import uuid
from typing import Optional, List

from fastapi import HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.redis import cache_get, cache_set, cache_delete, cache_delete_pattern
from app.models.product import Product
from app.models.product_image import ProductImage
from app.models.category import Category
from app.models.user import User
from app.schemas.product_schema import (
    ProductCreate,
    ProductUpdate,
    ProductResponse,
    ProductListResponse,
    CategoryResponse,
)


async def create_product(
    data: ProductCreate, seller: User, db: AsyncSession, image_files: List[dict] | None = None
) -> ProductResponse:
    # Verify category exists
    result = await db.execute(select(Category).where(Category.id == data.category_id))
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Category not found")

    product = Product(
        title=data.title,
        description=data.description,
        price=data.price,
        category_id=data.category_id,
        seller_id=seller.id,
        location=data.location,
        condition=data.condition,
    )
    db.add(product)
    await db.flush()

    # Add images from uploaded files (stored in DB)
    if image_files:
        for img_file in image_files:
            img = ProductImage(
                product_id=product.id,
                image_data=img_file["data"],
                content_type=img_file["content_type"],
                image_url="",
            )
            db.add(img)
            await db.flush()
            # Set image_url to the serving endpoint
            img.image_url = f"/api/images/{img.id}"
    else:
        # Fallback: use provided URLs (for backward compatibility)
        for url in data.image_urls:
            img = ProductImage(product_id=product.id, image_url=url)
            db.add(img)

    await db.commit()

    # Reload with relationships
    result = await db.execute(
        select(Product)
        .options(
            selectinload(Product.images),
            selectinload(Product.category),
            selectinload(Product.seller),
        )
        .where(Product.id == product.id)
    )
    product = result.scalar_one()

    # Invalidate product list cache
    await cache_delete_pattern("products:*")

    return ProductResponse.model_validate(product)


async def get_products(
    db: AsyncSession,
    page: int = 1,
    page_size: int = 20,
    category_id: Optional[uuid.UUID] = None,
) -> ProductListResponse:
    cache_key = f"products:page:{page}:size:{page_size}:cat:{category_id}"
    cached = await cache_get(cache_key)
    if cached:
        return ProductListResponse(**cached)

    query = select(Product).options(
        selectinload(Product.images),
        selectinload(Product.category),
        selectinload(Product.seller),
    ).where(Product.status == "active")

    if category_id:
        query = query.where(Product.category_id == category_id)

    # Count total
    count_query = select(func.count()).select_from(Product).where(Product.status == "active")
    if category_id:
        count_query = count_query.where(Product.category_id == category_id)
    count_result = await db.execute(count_query)
    total = count_result.scalar()

    offset = (page - 1) * page_size
    query = query.order_by(Product.created_at.desc()).offset(offset).limit(page_size)
    result = await db.execute(query)
    products = result.scalars().all()

    response = ProductListResponse(
        products=[ProductResponse.model_validate(p) for p in products],
        total=total,
        page=page,
        page_size=page_size,
    )

    await cache_set(cache_key, response.model_dump(mode="json"), expire=300)
    return response


async def get_product_by_id(product_id: uuid.UUID, db: AsyncSession) -> ProductResponse:
    cache_key = f"product:detail:{product_id}"
    cached = await cache_get(cache_key)
    if cached:
        return ProductResponse(**cached)

    result = await db.execute(
        select(Product)
        .options(
            selectinload(Product.images),
            selectinload(Product.category),
            selectinload(Product.seller),
        )
        .where(Product.id == product_id)
    )
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    response = ProductResponse.model_validate(product)
    await cache_set(cache_key, response.model_dump(mode="json"), expire=600)
    return response


async def update_product(
    product_id: uuid.UUID, data: ProductUpdate, seller: User, db: AsyncSession
) -> ProductResponse:
    result = await db.execute(
        select(Product)
        .options(selectinload(Product.images))
        .where(Product.id == product_id)
    )
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if product.seller_id != seller.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this product")

    update_data = data.model_dump(exclude_unset=True, exclude={"image_urls"})
    for field, value in update_data.items():
        setattr(product, field, value)

    # Update images if provided
    if data.image_urls is not None:
        # Remove old images
        for img in product.images:
            await db.delete(img)
        # Add new images
        for url in data.image_urls:
            img = ProductImage(product_id=product.id, image_url=url)
            db.add(img)

    await db.commit()

    # Reload
    result = await db.execute(
        select(Product)
        .options(
            selectinload(Product.images),
            selectinload(Product.category),
            selectinload(Product.seller),
        )
        .where(Product.id == product.id)
    )
    product = result.scalar_one()

    # Invalidate cache
    await cache_delete(f"product:detail:{product_id}")
    await cache_delete_pattern("products:*")

    return ProductResponse.model_validate(product)


async def delete_product(
    product_id: uuid.UUID, seller: User, db: AsyncSession
):
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if product.seller_id != seller.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this product")

    await db.delete(product)
    await db.commit()

    # Invalidate cache
    await cache_delete(f"product:detail:{product_id}")
    await cache_delete_pattern("products:*")

    return {"message": "Product deleted"}


async def get_categories(db: AsyncSession) -> list[CategoryResponse]:
    result = await db.execute(select(Category).order_by(Category.name))
    categories = result.scalars().all()
    return [CategoryResponse.model_validate(c) for c in categories]

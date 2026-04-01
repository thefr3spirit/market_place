import uuid
from typing import List, Optional

from fastapi import APIRouter, Depends, File, Form, Query, BackgroundTasks, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.dependencies.auth_dependencies import get_current_user
from app.models.user import User
from app.schemas.product_schema import (
    ProductCreate,
    ProductUpdate,
    ProductResponse,
    ProductListResponse,
    CategoryResponse,
)
from app.services.product_service import (
    create_product,
    get_products,
    get_product_by_id,
    update_product,
    delete_product,
    get_categories,
)
from app.services.search_service import index_product, remove_product_from_index

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

router = APIRouter(prefix="/products", tags=["Products"])


@router.post("", response_model=ProductResponse, status_code=201)
async def create(
    background_tasks: BackgroundTasks,
    title: str = Form(...),
    description: str = Form(...),
    price: float = Form(...),
    category_id: uuid.UUID = Form(...),
    location: str = Form(""),
    condition: str = Form("new"),
    images: List[UploadFile] = File(default=[]),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Read uploaded images into memory for DB storage
    image_files = []
    for img in images[:5]:  # max 5 images
        if img.content_type not in ALLOWED_TYPES:
            continue
        content = await img.read()
        if len(content) > MAX_FILE_SIZE:
            continue
        image_files.append({
            "data": content,
            "content_type": img.content_type,
        })

    data = ProductCreate(
        title=title,
        description=description,
        price=price,
        category_id=category_id,
        location=location or None,
        condition=condition,
        image_urls=[],
    )
    product = await create_product(data, current_user, db, image_files=image_files)
    # Index in search engine in background
    product_dict = product.model_dump(mode="json")
    product_dict["id"] = str(product.id)
    background_tasks.add_task(index_product, product_dict)
    return product


@router.get("", response_model=ProductListResponse)
async def list_products(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    category_id: Optional[uuid.UUID] = None,
    db: AsyncSession = Depends(get_db),
):
    return await get_products(db, page, page_size, category_id)


@router.get("/categories", response_model=list[CategoryResponse])
async def list_categories(db: AsyncSession = Depends(get_db)):
    return await get_categories(db)


@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(product_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    return await get_product_by_id(product_id, db)


@router.put("/{product_id}", response_model=ProductResponse)
async def update(
    product_id: uuid.UUID,
    data: ProductUpdate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    product = await update_product(product_id, data, current_user, db)
    product_dict = product.model_dump(mode="json")
    product_dict["id"] = str(product.id)
    background_tasks.add_task(index_product, product_dict)
    return product


@router.delete("/{product_id}")
async def delete(
    product_id: uuid.UUID,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await delete_product(product_id, current_user, db)
    background_tasks.add_task(remove_product_from_index, str(product_id))
    return result

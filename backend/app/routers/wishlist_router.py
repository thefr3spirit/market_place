import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database.session import get_db
from app.dependencies.auth_dependencies import get_current_user
from app.models.user import User
from app.models.wishlist import Wishlist
from app.models.product import Product
from app.schemas.product_schema import ProductResponse

router = APIRouter(prefix="/wishlist", tags=["Wishlist"])


@router.post("/add", status_code=201)
async def add_to_wishlist(
    product_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Check product exists
    result = await db.execute(select(Product).where(Product.id == product_id))
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Product not found")

    # Check if already in wishlist
    result = await db.execute(
        select(Wishlist).where(
            Wishlist.user_id == current_user.id, Wishlist.product_id == product_id
        )
    )
    if result.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Already in wishlist")

    item = Wishlist(user_id=current_user.id, product_id=product_id)
    db.add(item)
    await db.commit()
    return {"message": "Added to wishlist"}


@router.delete("/remove")
async def remove_from_wishlist(
    product_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Wishlist).where(
            Wishlist.user_id == current_user.id, Wishlist.product_id == product_id
        )
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Item not in wishlist")

    await db.delete(item)
    await db.commit()
    return {"message": "Removed from wishlist"}


@router.get("", response_model=list[ProductResponse])
async def get_wishlist(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Wishlist)
        .options(
            selectinload(Wishlist.product).selectinload(Product.images),
            selectinload(Wishlist.product).selectinload(Product.category),
            selectinload(Wishlist.product).selectinload(Product.seller),
        )
        .where(Wishlist.user_id == current_user.id)
    )
    items = result.scalars().all()
    return [ProductResponse.model_validate(item.product) for item in items if item.product]

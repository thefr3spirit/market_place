import uuid
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.search_service import search_products

router = APIRouter(prefix="/search", tags=["Search"])


@router.get("")
async def search(
    q: str = Query(..., min_length=1),
    category_id: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    location: Optional[str] = None,
    condition: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    return await search_products(
        query=q,
        category_id=category_id,
        min_price=min_price,
        max_price=max_price,
        location=location,
        condition=condition,
        page=page,
        page_size=page_size,
    )

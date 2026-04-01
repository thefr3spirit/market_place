import uuid

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.models.product_image import ProductImage

router = APIRouter(prefix="/images", tags=["Images"])


@router.get("/{image_id}")
async def get_image(image_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(ProductImage).where(ProductImage.id == image_id)
    )
    img = result.scalar_one_or_none()
    if not img or not img.image_data:
        raise HTTPException(status_code=404, detail="Image not found")

    return Response(
        content=img.image_data,
        media_type=img.content_type or "image/jpeg",
        headers={"Cache-Control": "public, max-age=86400"},
    )

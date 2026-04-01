import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.dependencies.auth_dependencies import get_current_user
from app.models.user import User
from app.schemas.review_schema import ReviewCreate, ReviewResponse, ReviewListResponse
from app.services.review_service import create_review, get_product_reviews

router = APIRouter(prefix="/reviews", tags=["Reviews"])


@router.post("", response_model=ReviewResponse, status_code=201)
async def create(
    data: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await create_review(data, current_user, db)


@router.get("/products/{product_id}", response_model=ReviewListResponse)
async def product_reviews(product_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    return await get_product_reviews(product_id, db)

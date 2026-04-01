import uuid

from fastapi import HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.review import Review
from app.models.product import Product
from app.models.user import User
from app.schemas.review_schema import ReviewCreate, ReviewResponse, ReviewListResponse


async def create_review(data: ReviewCreate, reviewer: User, db: AsyncSession) -> ReviewResponse:
    # Check product exists
    result = await db.execute(select(Product).where(Product.id == data.product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Prevent reviewing own product
    if product.seller_id == reviewer.id:
        raise HTTPException(status_code=400, detail="Cannot review your own product")

    # Check if already reviewed
    result = await db.execute(
        select(Review).where(
            Review.product_id == data.product_id, Review.reviewer_id == reviewer.id
        )
    )
    if result.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Already reviewed this product")

    review = Review(
        product_id=data.product_id,
        reviewer_id=reviewer.id,
        rating=data.rating,
        comment=data.comment,
    )
    db.add(review)
    await db.commit()
    await db.refresh(review)
    return ReviewResponse.model_validate(review)


async def get_product_reviews(
    product_id: uuid.UUID, db: AsyncSession
) -> ReviewListResponse:
    result = await db.execute(
        select(Review)
        .where(Review.product_id == product_id)
        .order_by(Review.created_at.desc())
    )
    reviews = result.scalars().all()

    # Calculate average
    avg_result = await db.execute(
        select(func.avg(Review.rating)).where(Review.product_id == product_id)
    )
    avg_rating = avg_result.scalar()

    return ReviewListResponse(
        reviews=[ReviewResponse.model_validate(r) for r in reviews],
        average_rating=float(avg_rating) if avg_rating else None,
        total=len(reviews),
    )

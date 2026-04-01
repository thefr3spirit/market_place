import uuid
from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel, Field


class ReviewCreate(BaseModel):
    product_id: uuid.UUID
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None


class ReviewResponse(BaseModel):
    id: uuid.UUID
    product_id: uuid.UUID
    reviewer_id: uuid.UUID
    rating: int
    comment: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class ReviewListResponse(BaseModel):
    reviews: List[ReviewResponse]
    average_rating: Optional[float] = None
    total: int

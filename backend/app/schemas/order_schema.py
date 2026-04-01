import uuid
from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel, Field


class OrderCreate(BaseModel):
    product_id: uuid.UUID


class OrderStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(confirmed|shipped|delivered|cancelled)$")


class OrderResponse(BaseModel):
    id: uuid.UUID
    buyer_id: uuid.UUID
    seller_id: uuid.UUID
    product_id: uuid.UUID
    price: float
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class OrderListResponse(BaseModel):
    orders: List[OrderResponse]
    total: int

import uuid
from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel, Field


class CategoryResponse(BaseModel):
    id: uuid.UUID
    name: str
    description: Optional[str] = None

    model_config = {"from_attributes": True}


class ProductImageResponse(BaseModel):
    id: uuid.UUID
    image_url: str

    model_config = {"from_attributes": True}


class ProductCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    description: str = Field(..., min_length=10)
    price: float = Field(..., gt=0)
    category_id: uuid.UUID
    location: Optional[str] = None
    condition: str = Field(default="new", pattern="^(new|used|refurbished)$")
    image_urls: List[str] = []


class ProductUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=200)
    description: Optional[str] = Field(None, min_length=10)
    price: Optional[float] = Field(None, gt=0)
    category_id: Optional[uuid.UUID] = None
    location: Optional[str] = None
    condition: Optional[str] = Field(None, pattern="^(new|used|refurbished)$")
    status: Optional[str] = Field(None, pattern="^(active|sold|inactive)$")
    image_urls: Optional[List[str]] = None


class SellerInfo(BaseModel):
    id: uuid.UUID
    username: str
    profile_image: Optional[str] = None

    model_config = {"from_attributes": True}


class ProductResponse(BaseModel):
    id: uuid.UUID
    title: str
    description: str
    price: float
    category_id: uuid.UUID
    seller_id: uuid.UUID
    location: Optional[str] = None
    condition: str
    status: str
    created_at: datetime
    images: List[ProductImageResponse] = []
    category: Optional[CategoryResponse] = None
    seller: Optional[SellerInfo] = None

    model_config = {"from_attributes": True}


class ProductListResponse(BaseModel):
    products: List[ProductResponse]
    total: int
    page: int
    page_size: int

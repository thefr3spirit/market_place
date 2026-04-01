import uuid
from datetime import datetime, timezone

from sqlalchemy import String, Numeric, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class Product(Base):
    __tablename__ = "products"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    title: Mapped[str] = mapped_column(String(200), index=True)
    description: Mapped[str] = mapped_column(Text)
    price: Mapped[float] = mapped_column(Numeric(12, 2))
    category_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("categories.id"), index=True
    )
    seller_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), index=True
    )
    location: Mapped[str | None] = mapped_column(String(200), nullable=True)
    condition: Mapped[str] = mapped_column(String(20), default="new")  # new, used, refurbished
    status: Mapped[str] = mapped_column(
        String(20), default="active", index=True
    )  # active, sold, inactive
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    seller = relationship("User", back_populates="products", foreign_keys=[seller_id])
    category = relationship("Category", back_populates="products")
    images = relationship("ProductImage", back_populates="product", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="product", cascade="all, delete-orphan")
    wishlist_entries = relationship("Wishlist", back_populates="product", cascade="all, delete-orphan")

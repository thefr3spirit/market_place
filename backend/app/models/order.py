import uuid
from datetime import datetime, timezone

from sqlalchemy import String, Numeric, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    buyer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), index=True
    )
    seller_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), index=True
    )
    product_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("products.id"), index=True
    )
    price: Mapped[float] = mapped_column(Numeric(12, 2))
    status: Mapped[str] = mapped_column(
        String(20), default="pending", index=True
    )  # pending, confirmed, shipped, delivered, cancelled
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    buyer = relationship("User", foreign_keys=[buyer_id])
    seller = relationship("User", foreign_keys=[seller_id])
    product = relationship("Product")

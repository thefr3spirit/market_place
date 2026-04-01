import uuid

from sqlalchemy import String, ForeignKey, LargeBinary
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class ProductImage(Base):
    __tablename__ = "product_images"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    product_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"), index=True
    )
    image_url: Mapped[str] = mapped_column(String(500), default="")
    image_data: Mapped[bytes | None] = mapped_column(LargeBinary, nullable=True)
    content_type: Mapped[str | None] = mapped_column(String(50), nullable=True)

    product = relationship("Product", back_populates="images")

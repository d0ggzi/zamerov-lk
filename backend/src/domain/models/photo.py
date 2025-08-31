from uuid import UUID, uuid4

from sqlalchemy import Uuid, ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.domain.base import BaseModel
from src.domain.models import Order


class OrderPhoto(BaseModel):
    __tablename__ = "order_photo"

    uuid: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4, unique=True)
    order_id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("order.uuid"), nullable=False)
    url: Mapped[str] = mapped_column(String(255), nullable=False)

    order: Mapped["Order"] = relationship(
        "Order",
        back_populates="photos",
        foreign_keys=[order_id]
    )

    __table_args__ = (UniqueConstraint("order_id", "url", name="uq_photo_order_url"),)

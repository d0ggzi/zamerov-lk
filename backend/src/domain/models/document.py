from uuid import UUID, uuid4

from sqlalchemy import Uuid, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.domain.base import BaseModel
from src.domain.choices.status import DocumentStatus
from src.domain.models import Order


class Document(BaseModel):
    __tablename__ = "document"

    uuid: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4, unique=True)
    order_id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("order.uuid"), nullable=False)
    url: Mapped[str] = mapped_column(String(512), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[DocumentStatus] = mapped_column(
        String(50), nullable=False, default=DocumentStatus.NOT_SIGNED.value
    )

    order: Mapped["Order"] = relationship(
        "Order",
        back_populates="documents",
        foreign_keys=[order_id],
    )

import typing
from datetime import datetime
from uuid import UUID
import uuid

from sqlalchemy import Uuid, String, ForeignKey, DateTime, UniqueConstraint, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.domain.base import BaseModel
from src.domain.choices import OrderStatus
from src.domain.models import Request, User, Service
from src.domain.models.mixins import TimestampMixin

if typing.TYPE_CHECKING:
    from src.domain.models import OrderPhoto


class Order(TimestampMixin, BaseModel):
    __tablename__ = "order"

    uuid: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True)
    description: Mapped[str] = mapped_column(Text, nullable=True, default=None)
    status: Mapped[OrderStatus] = mapped_column(String(50), nullable=False)
    address: Mapped[str] = mapped_column(String(255), nullable=True)
    data: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    request_id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("request.uuid"), nullable=False)
    employee_id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("users.uuid"), nullable=True, default=None)

    request: Mapped["Request"] = relationship("Request", back_populates="order", foreign_keys=[request_id])
    employee: Mapped["User"] = relationship("User", back_populates="employed_requests", foreign_keys=[employee_id])

    services: Mapped[list["Service"]] = relationship(
        "Service",
        secondary="order_service_relation",
        back_populates="orders",
    )
    photos: Mapped[list["OrderPhoto"]] = relationship(
        "OrderPhoto",
        back_populates="order",
    )


class OrderServiceRelation(BaseModel):
    __tablename__ = "order_service_relation"

    uuid: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True)
    order_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("order.uuid", ondelete="CASCADE"), primary_key=True
    )
    service_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("service.uuid", ondelete="CASCADE"), primary_key=True
    )

    __table_args__ = (UniqueConstraint("order_id", "service_id", name="uq_order_service"),)

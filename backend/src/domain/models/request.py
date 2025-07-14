from datetime import datetime
from typing import TYPE_CHECKING
from uuid import UUID

import uuid
from sqlalchemy import Uuid, String, ForeignKey, Text, DateTime, Enum, UniqueConstraint
from sqlalchemy.orm import relationship, mapped_column, Mapped

from src.domain.base import BaseModel
from src.domain.choices.status import RequestStatus
from src.domain.models.mixins import TimestampMixin

if TYPE_CHECKING:
    from src.domain.models import Service, User, Order


class Request(TimestampMixin, BaseModel):
    __tablename__ = "request"

    uuid: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True)
    manager_id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("users.uuid"))
    description: Mapped[str] = mapped_column(Text, nullable=True, default=None)
    address: Mapped[str] = mapped_column(String(255), nullable=True)
    data: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    status: Mapped[RequestStatus] = mapped_column(String(50), nullable=False)

    manager: Mapped["User"] = relationship("User", back_populates="requests", foreign_keys=[manager_id])

    order: Mapped["Order"] = relationship("Order", back_populates="request", uselist=False)
    services: Mapped[list["Service"]] = relationship(
        "Service",
        secondary="request_service_relation",
        back_populates="requests",
    )


class RequestServiceRelation(BaseModel):
    __tablename__ = "request_service_relation"

    uuid: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True)
    request_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("request.uuid", ondelete="CASCADE"), primary_key=True
    )
    service_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("service.uuid", ondelete="CASCADE"), primary_key=True
    )

    __table_args__ = (UniqueConstraint("request_id", "service_id", name="uq_request_service"),)

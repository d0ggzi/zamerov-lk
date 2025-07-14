from typing import TYPE_CHECKING
from uuid import UUID

import uuid
from sqlalchemy import String, Uuid
from sqlalchemy.orm import relationship, mapped_column, Mapped

from src.domain.base import BaseModel
from src.domain.models.mixins import TimestampMixin

if TYPE_CHECKING:
    from src.domain.models import RequestServiceRelation, Request, Order


class Service(TimestampMixin, BaseModel):
    __tablename__ = "service"

    uuid: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)

    requests: Mapped[list["Request"]] = relationship(
        "Request",
        secondary="request_service_relation",
        back_populates="services",
    )
    orders: Mapped[list["Order"]] = relationship(
        "Order",
        secondary="order_service_relation",
        back_populates="services",
    )

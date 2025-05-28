from datetime import datetime
from typing import TYPE_CHECKING
from uuid import UUID

import uuid
from sqlalchemy import Uuid, String, ForeignKey, Text, DateTime, Enum, UniqueConstraint
from sqlalchemy.orm import relationship, mapped_column, Mapped

from src.domain.base import BaseModel
from src.domain.choices.status import Status

if TYPE_CHECKING:
    from src.domain.models import Service, User


class Request(BaseModel):
    __tablename__ = "request"

    uuid: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True)
    user_id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("users.uuid"), primary_key=True)
    description: Mapped[str] = mapped_column(Text, nullable=False, default="")
    address: Mapped[str] = mapped_column(String(255), nullable=True)
    data: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    status: Mapped[Status] = mapped_column(Enum(Status))
    employer_id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("users.uuid"), primary_key=True)

    user: Mapped["User"] = relationship("User", back_populates="requests")

    request_services: Mapped["RequestServiceRelations"] = relationship(
        "RequestServiceRelations", back_populates="request"
    )


class RequestServiceRelations(BaseModel):
    __tablename__ = "request_service_relations"

    uuid: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True)
    request_id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("request.uuid"), primary_key=True)
    service_id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("service.uuid"), primary_key=True)

    request: Mapped["Request"] = relationship("Request", back_populates="request_services")
    service: Mapped["Service"] = relationship("Service", back_populates="request_services")

    __table_args__ = (UniqueConstraint("request_id", "service_id", name="uq_request_service"),)

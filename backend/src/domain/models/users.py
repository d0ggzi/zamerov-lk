from typing import TYPE_CHECKING
from uuid import UUID

import uuid
from sqlalchemy import Uuid, String, ForeignKey
from sqlalchemy.orm import relationship, Mapped, mapped_column

from src.domain.base import BaseModel

if TYPE_CHECKING:
    from src.domain.models.request import Request


class Role(BaseModel):
    __tablename__ = "role"

    uuid: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)

    users: Mapped[list["User"]] = relationship("User", back_populates="role")


class User(BaseModel):
    __tablename__ = "users"

    uuid: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    password: Mapped[str] = mapped_column(String(255), nullable=False)
    role_id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("role.uuid"), primary_key=True)

    role: Mapped["Role"] = relationship("Role", back_populates="users")

    requests: Mapped[list["Request"]] = relationship("Request", back_populates="user")

from uuid import UUID
import uuid

from sqlalchemy import Uuid, String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.domain.base import BaseModel
from src.domain.choices import RequestStatus


class Order(BaseModel):
    __tablename__ = "order"

    uuid: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True)
    status: Mapped[RequestStatus] = mapped_column(String(50), nullable=False)
    employer_id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("users.uuid"), nullable=True, default=None)

    employer: Mapped["User"] = relationship("User", back_populates="employed_requests", foreign_keys=[employer_id])
from typing import TYPE_CHECKING
from uuid import UUID

import uuid
from sqlalchemy import String, Uuid
from sqlalchemy.orm import relationship, mapped_column, Mapped

from src.domain.base import BaseModel

if TYPE_CHECKING:
    from src.domain.models import RequestServiceRelations


class Service(BaseModel):
    __tablename__ = "service"

    uuid: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)

    request_services: Mapped["RequestServiceRelations"] = relationship(
        "RequestServiceRelations", back_populates="service"
    )

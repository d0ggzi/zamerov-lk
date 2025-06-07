import uuid
from datetime import datetime

from pydantic import BaseModel

from src.domain.choices.status import Status


class Request(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    description: str | None = None
    address: str | None = None
    data: datetime | None = None
    status: Status
    employer_id: uuid.UUID | None = None


class RequestCreate(BaseModel):
    user_id: uuid.UUID
    description: str | None = None
    address: str | None = None
    data: datetime | None = None
    employer_id: uuid.UUID | None = None
    services_ids: list[uuid.UUID]

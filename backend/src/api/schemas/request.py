import uuid
from datetime import datetime

from pydantic import BaseModel

from src.api.schemas import Service, User
from src.api.schemas.auth import Role
from src.domain import models
from src.domain.choices.status import RequestStatus


class Request(BaseModel):
    id: str
    user: User
    description: str | None = None
    address: str | None = None
    data: datetime | None = None
    status: RequestStatus
    services: list[Service]

    @staticmethod
    def from_orm_model(request: models.Request):
        return Request(
            id=str(request.uuid),
            user=User(
                id=str(request.manager.uuid),
                email=request.manager.email,
                name=request.manager.name,
                role=Role(id=str(request.manager.role.uuid), name=request.manager.role.name),
            ),
            description=request.description,
            address=request.address,
            data=request.data,
            status=request.status,
            services=[Service(id=str(service.uuid), name=service.name) for service in request.services],
        )


class RequestCreate(BaseModel):
    manager_id: str
    description: str | None = None
    address: str | None = None
    data: datetime | None = None
    services_ids: list[str]


class RequestEdit(BaseModel):
    description: str | None = None
    address: str | None = None
    data: datetime | None = None
    status: RequestStatus | None = None
    services_ids: list[str] | None = None

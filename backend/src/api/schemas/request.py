import uuid
from datetime import datetime

from pydantic import BaseModel

from src.api.schemas import Service, User
from src.api.schemas.auth import Role
from src.domain.choices.status import RequestStatus


class Request(BaseModel):
    id: str
    user: User
    description: str | None = None
    address: str | None = None
    data: datetime | None = None
    status: RequestStatus
    employer: User | None = None
    services: list[Service]

    @staticmethod
    def from_orm_model(request):
        return Request(
            id=str(request.uuid),
            user=User(
                id=str(request.user.uuid),
                email=request.user.email,
                name=request.user.name,
                role=Role(id=str(request.user.role.uuid), name=request.user.role.name),
            ),
            description=request.description,
            address=request.address,
            data=request.data,
            status=request.status,
            employer=User(
                id=str(request.employer.uuid),
                email=request.employer.email,
                name=request.employer.name,
                role=Role(id=str(request.employer.role.uuid), name=request.employer.role.name),
            )
            if request.employer is not None
            else None,
            services=[Service(id=str(service.uuid), name=service.name) for service in request.services],
        )


class RequestCreate(BaseModel):
    user_id: str
    description: str | None = None
    address: str | None = None
    data: datetime | None = None
    employer_id: str | None = None
    services_ids: list[str]


class RequestEdit(BaseModel):
    description: str | None = None
    address: str | None = None
    data: datetime | None = None
    status: RequestStatus | None = None
    employer_id: str | None = None
    services_ids: list[str] | None = None

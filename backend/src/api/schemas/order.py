from datetime import datetime

from pydantic import BaseModel

from src.api.schemas import User, Service
from src.api.schemas.auth import Role
from src.api.schemas.photo import Photo
from src.domain import models
from src.domain.choices import OrderStatus


class Order(BaseModel):
    id: str
    description: str | None = None
    address: str | None = None
    data: datetime | None = None
    status: OrderStatus | None = None
    employee: User | None = None
    services: list[Service]
    photos: list[Photo]

    @staticmethod
    def from_orm_model(order: models.Order):
        return Order(
            id=str(order.uuid),
            description=order.description,
            address=order.address,
            data=order.data,
            status=order.status,
            employee=User(
                id=str(order.employee.uuid),
                email=order.employee.email,
                name=order.employee.name,
                role=Role(id=str(order.employee.role.uuid), name=order.employee.role.name),
            )
            if order.employee is not None
            else None,
            services=[Service(id=str(service.uuid), name=service.name) for service in order.services],
            photos=[Photo(id=str(photo.uuid), url=photo.url) for photo in order.photos]
        )


class OrderEdit(BaseModel):
    description: str | None = None
    address: str | None = None
    data: datetime | None = None
    status: OrderStatus | None = None
    employee_id: str | None = None
    services_ids: list[str] | None = None
    photos_urls: list[str] | None = None

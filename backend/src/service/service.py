from sqlalchemy import select
from sqlalchemy.exc import NoResultFound
from sqlalchemy.orm import Session

from src.api.schemas.service import Service, ServiceCreate
from src.domain import models
from src.service.exceptions import ServiceNotFoundError


class ServiceService:
    def __init__(self, session: Session):
        self.session = session

    async def list(self):
        services = self.session.execute(select(models.Service)).scalars().all()
        schema_services = [Service(id=str(service.uuid), name=service.name) for service in services]
        return schema_services

    async def create(self, service_create: ServiceCreate):
        service = models.Service(name=service_create.name)
        self.session.add(service)
        self.session.commit()
        return Service(id=str(service.uuid), name=service.name)

    async def delete(self, service_id: str):
        try:
            service = self.session.execute(select(models.Service).where(models.Service.uuid == service_id)).scalar_one()
        except NoResultFound:
            raise ServiceNotFoundError
        self.session.delete(service)
        self.session.commit()
        return Service(id=str(service.uuid), name=service.name)

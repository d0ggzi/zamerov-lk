from sqlalchemy import select
from sqlalchemy.orm import Session

from src.api.schemas.service import Service, ServiceCreate
from src.domain import models


class ServiceService:
    def __init__(self, session: Session):
        self.session = session

    def list(self):
        services = self.session.execute(select(models.Service)).scalars().all()
        schema_services = [Service(id=service.uuid, name=service.name) for service in services]
        return schema_services

    def create(self, service_create: ServiceCreate):
        service = models.Service(name=service_create.name)
        self.session.add(service)
        self.session.commit()
        return Service(id=service.uuid, name=service.name)

    def delete(self, service_name: str):
        service = self.session.execute(select(models.Service).where(models.Service.name == service_name)).scalar_one()
        self.session.delete(service)
        self.session.commit()
        return Service(id=service.uuid, name=service.name)

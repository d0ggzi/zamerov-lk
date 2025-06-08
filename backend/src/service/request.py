import uuid
from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from src.api.schemas import User, Service
from src.api.schemas.auth import Role
from src.api.schemas.request import RequestCreate, Request
from src.domain import models
from src.domain.choices.status import Status


class RequestService:
    def __init__(self, session: Session):
        self.session = session

    def list(self):
        requests = self.session.execute(select(models.Request)).scalars().all()
        schema_requests = [Request.from_orm_model(request) for request in requests]
        return schema_requests

    def create(self, request_create: RequestCreate):
        request = models.Request(
            user_id=request_create.user_id,
            description=request_create.description,
            address=request_create.address,
            data=datetime.now(),
            status=Status("draft"),
            employer_id=request_create.employer_id,
        )
        self.session.add(request)
        self.session.flush()
        request_service_relations = []
        for service_id in request_create.services_ids:
            request_service_relations.append(
                models.RequestServiceRelation(request_id=request.uuid, service_id=service_id)
            )
        self.session.add_all(request_service_relations)
        self.session.commit()
        return Request.from_orm_model(request)

    def delete(self, request_id: str):
        request = self.session.execute(select(models.Request).where(models.Request.uuid == request_id)).scalar_one()
        self.session.delete(request)
        self.session.commit()
        return Request.from_orm_model(request)

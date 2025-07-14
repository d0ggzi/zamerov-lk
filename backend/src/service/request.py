import uuid
from datetime import datetime

from sqlalchemy import select, delete
from sqlalchemy.exc import NoResultFound
from sqlalchemy.orm import Session

from src.api.schemas import User, Service
from src.api.schemas.auth import Role
from src.api.schemas.request import RequestCreate, Request, RequestEdit
from src.domain import models, choices
from src.domain.choices.status import RequestStatus
from src.service.exceptions import UserNotFoundError, RequestNotFoundError


class RequestService:
    def __init__(self, session: Session):
        self.session = session

    async def list(self, manager_id: str | None = None):
        query = select(models.Request).where(models.Request.deleted_at.is_(None))
        if manager_id is not None:
            query = query.where(models.Request.manager_id == manager_id)
        requests = self.session.execute(query).scalars().all()
        schema_requests = [Request.from_orm_model(request) for request in requests]
        return schema_requests

    async def get(self, request_id: str):
        try:
            request = self.session.execute(
                select(models.Request).where(models.Request.uuid == request_id, models.Request.deleted_at.is_(None))
            ).scalar_one()
        except NoResultFound:
            raise RequestNotFoundError
        return Request.from_orm_model(request)

    async def create(self, request_create: RequestCreate):
        request = models.Request(
            manager_id=request_create.manager_id,
            description=request_create.description,
            address=request_create.address,
            data=request_create.data,
            status=RequestStatus.NEW.value,
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

    async def edit(self, request_id: str, request_edit: RequestEdit):
        try:
            orm_request = self.session.execute(
                select(models.Request).where(models.Request.uuid == request_id, models.Request.deleted_at.is_(None))
            ).scalar_one()
        except NoResultFound:
            raise RequestNotFoundError
        if request_edit.description is not None:
            orm_request.description = request_edit.description
        if request_edit.address is not None:
            orm_request.address = request_edit.address
        if request_edit.data is not None:
            orm_request.data = request_edit.data
        if request_edit.status is not None:
            orm_request.status = request_edit.status.value
        if request_edit.services_ids is not None:
            self.session.execute(
                delete(models.RequestServiceRelation).where(
                    models.RequestServiceRelation.request_id == orm_request.uuid
                )
            )
            request_service_relations = []
            for service_id in request_edit.services_ids:
                request_service_relations.append(
                    models.RequestServiceRelation(request_id=orm_request.uuid, service_id=service_id)
                )
            self.session.add_all(request_service_relations)
        self.session.add(orm_request)
        self.session.commit()
        return Request.from_orm_model(orm_request)

    async def delete(self, request_id: str):
        try:
            request = self.session.execute(
                select(models.Request).where(models.Request.uuid == request_id, models.Request.deleted_at.is_(None))
            ).scalar_one()
        except NoResultFound:
            raise RequestNotFoundError
        request.set_deleted()
        self.session.commit()
        return Request.from_orm_model(request)

import uuid
from datetime import datetime

from sqlalchemy import select, delete
from sqlalchemy.exc import NoResultFound
from sqlalchemy.orm import Session

from src.api.schemas import User, Service
from src.api.schemas.auth import Role
from src.api.schemas.request import RequestCreate, Request, RequestEdit
from src.domain import models, choices
from src.domain.choices.status import RequestStatus, OrderStatus
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
        set_fields = request_edit.model_dump(exclude_unset=True)
        if "description" in set_fields:
            orm_request.description = request_edit.description
        if "address" in set_fields:
            orm_request.address = request_edit.address
        if "data" in set_fields:
            orm_request.data = request_edit.data
        if "status" in set_fields:
            orm_request.status = request_edit.status.value
            if request_edit.status == RequestStatus.ORDER:
                self._create_order(orm_request)
        if "services_ids" in set_fields:
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

    def _create_order(self, request: models.Request):
        order = models.Order(
            description=request.description,
            status=OrderStatus.READY,
            address=request.address,
            data=request.data,
            request_id=request.uuid,
        )
        self.session.add(order)
        self.session.flush()
        order_services = []
        for service in request.services:
            order_services.append(models.OrderServiceRelation(
                order_id=order.uuid,
                service_id=service.uuid
            ))
        self.session.add_all(order_services)
        self.session.commit()

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

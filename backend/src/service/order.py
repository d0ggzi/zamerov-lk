import uuid
from sqlalchemy import select, delete
from sqlalchemy.exc import NoResultFound
from sqlalchemy.orm import Session

from src.api.schemas.order import OrderEdit, Order
from src.domain import models, choices
from src.service.exceptions import OrderNotFoundError, UserNotFoundError
from src.service.s3 import S3Service


class OrderService:
    def __init__(self, session: Session, s3_service: S3Service):
        self.session = session
        self.s3_service = s3_service

    async def list(self, user_id: str | None = None):
        query = select(models.Order).where(models.Order.deleted_at.is_(None))
        if user_id is not None:
            query = query.where(models.Order.user_id == user_id)
        orders = self.session.execute(query).scalars().all()
        schema_orders = [Order.from_orm_model(order) for order in orders]
        return schema_orders

    async def list_for_calendar(self, current_user):
        query = select(models.Order).where(
            models.Order.deleted_at.is_(None),
            models.Order.data.is_not(None),
        )
        role = current_user.role.name
        if role == choices.Role.MANAGER.value:
            query = query.join(models.Request, models.Order.request_id == models.Request.uuid).where(
                models.Request.manager_id == uuid.UUID(current_user.id)
            )
        elif role == choices.Role.EMPLOYEE.value:
            query = query.where(models.Order.employee_id == uuid.UUID(current_user.id))
        elif role == choices.Role.USER.value:
            query = query.join(models.Request, models.Order.request_id == models.Request.uuid).where(
                models.Request.client_email == current_user.email
            )
        orders = self.session.execute(query).scalars().all()
        return [Order.from_orm_model(order) for order in orders]

    async def get(self, order_id: str):
        try:
            order = self.session.execute(
                select(models.Order).where(models.Order.uuid == order_id, models.Order.deleted_at.is_(None))
            ).scalar_one()
        except NoResultFound:
            raise OrderNotFoundError
        return Order.from_orm_model(order)

    async def edit(self, order_id: str, order_edit: OrderEdit):
        try:
            orm_order = self.session.execute(
                select(models.Order).where(models.Order.uuid == order_id, models.Order.deleted_at.is_(None))
            ).scalar_one()
        except NoResultFound:
            raise OrderNotFoundError
        set_fields = order_edit.model_dump(exclude_unset=True)
        if "description" in set_fields:
            orm_order.description = order_edit.description
        if "address" in set_fields:
            orm_order.address = order_edit.address
        if "data" in set_fields:
            orm_order.data = order_edit.data
        if "end_data" in set_fields:
            orm_order.end_data = order_edit.end_data
        if "status" in set_fields:
            orm_order.status = order_edit.status.value
        if "employee_id" in set_fields:
            if order_edit.employee_id is not None:
                try:
                    self.session.execute(
                        select(models.User)
                        .join(models.Role)
                        .where(
                            models.User.uuid == order_edit.employee_id, models.Role.name == choices.Role.EMPLOYEE.value
                        )
                    ).scalar_one()
                except NoResultFound:
                    raise UserNotFoundError
                orm_order.employee_id = uuid.UUID(order_edit.employee_id)
            else:
                orm_order.employee_id = None
        if "services_ids" in set_fields:
            self.session.execute(
                delete(models.OrderServiceRelation).where(models.OrderServiceRelation.order_id == orm_order.uuid)
            )
            order_service_relations = []
            for service_id in order_edit.services_ids:
                order_service_relations.append(
                    models.OrderServiceRelation(order_id=orm_order.uuid, service_id=service_id)
                )
            self.session.add_all(order_service_relations)
        self.session.add(orm_order)
        self.session.commit()
        return Order.from_orm_model(orm_order)

    async def delete(self, order_id: str):
        try:
            orm_order = self.session.execute(
                select(models.Order).where(models.Order.uuid == order_id, models.Order.deleted_at.is_(None))
            ).scalar_one()
        except NoResultFound:
            raise OrderNotFoundError
        orm_order.set_deleted()
        self.session.commit()
        return Order.from_orm_model(orm_order)

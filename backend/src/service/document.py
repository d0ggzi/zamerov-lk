import uuid

from sqlalchemy import select
from sqlalchemy.exc import NoResultFound
from sqlalchemy.orm import Session

from src.api.schemas.document import Document, DocumentCreate, DocumentUpdate, DocumentWithOrder
from src.domain import models
from src.service.exceptions import DocumentNotFoundError, OrderNotFoundError
from src.service.s3 import S3Service


class DocumentService:
    def __init__(self, session: Session, s3_service: S3Service):
        self.session = session
        self.s3_service = s3_service

    async def list_all(self):
        documents = self.session.execute(select(models.Document)).scalars().all()
        return [DocumentWithOrder.from_orm_model(document) for document in documents]

    async def list_for_order(self, order_id: str):
        self._get_order(order_id)
        documents = self.session.execute(
            select(models.Document).where(models.Document.order_id == order_id)
        ).scalars().all()
        return [Document.from_orm_model(document) for document in documents]

    async def add(self, order_id: str, document_create: DocumentCreate):
        self._get_order(order_id)
        document = models.Document(
            order_id=uuid.UUID(order_id),
            url=document_create.url,
            name=document_create.name,
        )
        self.session.add(document)
        self.session.commit()
        return Document.from_orm_model(document)

    async def update(self, document_id: str, document_update: DocumentUpdate):
        try:
            document = self.session.execute(
                select(models.Document).where(models.Document.uuid == document_id)
            ).scalar_one()
        except NoResultFound:
            raise DocumentNotFoundError
        set_fields = document_update.model_dump(exclude_unset=True)
        if "status" in set_fields and document_update.status is not None:
            document.status = document_update.status.value
        self.session.add(document)
        self.session.commit()
        return Document.from_orm_model(document)

    async def delete(self, document_id: str):
        try:
            document = self.session.execute(
                select(models.Document).where(models.Document.uuid == document_id)
            ).scalar_one()
        except NoResultFound:
            raise DocumentNotFoundError
        self.s3_service.delete_file(document.url)
        self.session.delete(document)
        self.session.commit()

    def _get_order(self, order_id: str) -> models.Order:
        try:
            return self.session.execute(
                select(models.Order).where(models.Order.uuid == order_id, models.Order.deleted_at.is_(None))
            ).scalar_one()
        except NoResultFound:
            raise OrderNotFoundError

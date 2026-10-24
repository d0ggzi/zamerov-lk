from pydantic import BaseModel

from src.domain import models
from src.domain.choices import DocumentStatus


class Document(BaseModel):
    id: str
    url: str
    name: str
    status: DocumentStatus

    @staticmethod
    def from_orm_model(document: models.Document):
        return Document(id=str(document.uuid), url=document.url, name=document.name, status=document.status)


class DocumentWithOrder(Document):
    # Только order_id: адрес/дата заказа запрашиваются отдельно по order_id
    # (GET /api/orders/{order_id}), чтобы не раздувать листинг документов.
    order_id: str

    @staticmethod
    def from_orm_model(document: models.Document):
        return DocumentWithOrder(
            id=str(document.uuid),
            url=document.url,
            name=document.name,
            status=document.status,
            order_id=str(document.order_id),
        )


class DocumentCreate(BaseModel):
    url: str
    name: str


class DocumentUpdate(BaseModel):
    # PATCH-семантика: применяются только переданные поля. Пока меняется только статус.
    status: DocumentStatus | None = None

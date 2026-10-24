import fastapi
from fastapi import APIRouter, Depends

from src.api.dependencies.auth import get_current_user
from src.api.dependencies.document import get_document_service
from src.api.schemas.document import DocumentCreate, DocumentUpdate
from src.service.document import DocumentService
from src.service.exceptions import DocumentNotFoundError, OrderNotFoundError

document_router = APIRouter(prefix="/api", tags=["documents"], dependencies=[Depends(get_current_user)])


@document_router.get("/documents")
async def list_documents(document_service: DocumentService = Depends(get_document_service)):
    return await document_service.list_all()


@document_router.get("/orders/{order_id}/documents")
async def list_order_documents(order_id: str, document_service: DocumentService = Depends(get_document_service)):
    try:
        return await document_service.list_for_order(order_id=order_id)
    except OrderNotFoundError as exc:
        raise fastapi.HTTPException(status_code=404, detail="Order not found") from exc


@document_router.post("/orders/{order_id}/documents", status_code=201)
async def add_order_document(
    order_id: str,
    document_create: DocumentCreate,
    document_service: DocumentService = Depends(get_document_service),
):
    try:
        return await document_service.add(order_id=order_id, document_create=document_create)
    except OrderNotFoundError as exc:
        raise fastapi.HTTPException(status_code=404, detail="Order not found") from exc


@document_router.patch("/documents/{document_id}")
async def update_document(
    document_id: str,
    document_update: DocumentUpdate,
    document_service: DocumentService = Depends(get_document_service),
):
    try:
        return await document_service.update(document_id=document_id, document_update=document_update)
    except DocumentNotFoundError as exc:
        raise fastapi.HTTPException(status_code=404, detail="Document not found") from exc


@document_router.delete("/documents/{document_id}", status_code=204)
async def delete_document(document_id: str, document_service: DocumentService = Depends(get_document_service)):
    try:
        await document_service.delete(document_id=document_id)
    except DocumentNotFoundError as exc:
        raise fastapi.HTTPException(status_code=404, detail="Document not found") from exc

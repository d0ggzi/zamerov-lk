from fastapi import APIRouter, Depends

from src.api.dependencies.request import get_request_service
from src.api.schemas.request import RequestCreate
from src.service.request import RequestService

request_router = APIRouter(prefix="/api/requests", tags=["requests"])


@request_router.get("/")
async def list_requests(request_service: RequestService = Depends(get_request_service)):
    return request_service.list()


@request_router.post("/")
async def create_request(request_create: RequestCreate, request_service: RequestService = Depends(get_request_service)):
    return request_service.create(request_create=request_create)


@request_router.delete("/{request_id}")
async def delete_request(request_id: str, request_service: RequestService = Depends(get_request_service)):
    return request_service.delete(request_id=request_id)

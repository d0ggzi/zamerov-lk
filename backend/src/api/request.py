import fastapi
from fastapi import APIRouter, Depends

from src.api.auth import user_router
from src.api.dependencies.auth import get_current_user
from src.api.dependencies.request import get_request_service
from src.api.schemas.request import RequestCreate, RequestEdit
from src.service.exceptions import UserNotFoundError, RequestNotFoundError
from src.service.request import RequestService

request_router = APIRouter(prefix="/api/requests", tags=["requests"], dependencies=[Depends(get_current_user)])


@request_router.get("/")
async def list_requests(request_service: RequestService = Depends(get_request_service)):
    return await request_service.list()


@user_router.get("/{manager_id}/requests")
async def list_user_requests(manager_id: str, request_service: RequestService = Depends(get_request_service)):
    return await request_service.list(manager_id=manager_id)


@request_router.post("/")
async def create_request(request_create: RequestCreate, request_service: RequestService = Depends(get_request_service)):
    return await request_service.create(request_create=request_create)


@request_router.get("/{request_id}")
async def get_request(request_id: str, request_service: RequestService = Depends(get_request_service)):
    try:
        request = await request_service.get(request_id=request_id)
    except RequestNotFoundError as exc:
        raise fastapi.HTTPException(status_code=404, detail="Request not found") from exc

    return request


@request_router.patch("/{request_id}")
async def edit_request(
    request_id: str, request_edit: RequestEdit, request_service: RequestService = Depends(get_request_service)
):
    try:
        request = await request_service.edit(request_id=request_id, request_edit=request_edit)
    except UserNotFoundError as exc:
        raise fastapi.HTTPException(status_code=404, detail="User not found") from exc
    except RequestNotFoundError as exc:
        raise fastapi.HTTPException(status_code=404, detail="Request not found") from exc

    return request


@request_router.delete("/{request_id}")
async def delete_request(request_id: str, request_service: RequestService = Depends(get_request_service)):
    try:
        request = await request_service.delete(request_id=request_id)
    except RequestNotFoundError as exc:
        raise fastapi.HTTPException(status_code=404, detail="Request not found") from exc

    return request

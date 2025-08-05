import fastapi
from fastapi import APIRouter, Depends

from src.api.dependencies.auth import get_current_user
from src.api.dependencies.service import get_service_service
from src.api.schemas.service import ServiceCreate
from src.service.exceptions import ServiceNotFoundError
from src.service.service import ServiceService

service_router = APIRouter(prefix="/api/services", tags=["services"], dependencies=[Depends(get_current_user)])


@service_router.get("/")
async def list_services(service_service: ServiceService = Depends(get_service_service)):
    return await service_service.list()


@service_router.post("/")
async def create_service(service_create: ServiceCreate, service_service: ServiceService = Depends(get_service_service)):
    return await service_service.create(service_create=service_create)


@service_router.delete("/{service_id}")
async def delete_service(service_id: str, service_service: ServiceService = Depends(get_service_service)):
    try:
        service = await service_service.delete(service_id=service_id)
    except ServiceNotFoundError as exc:
        raise fastapi.HTTPException(status_code=404, detail="Service not found") from exc

    return service

from fastapi import APIRouter, Depends

from src.api.dependencies.service import get_service_service
from src.api.schemas.service import ServiceCreate
from src.service.service import ServiceService

service_router = APIRouter(prefix="/api/services", tags=["services"])


@service_router.get("/")
async def list_services(service_service: ServiceService = Depends(get_service_service)):
    return service_service.list()


@service_router.post("/")
async def create_service(service_create: ServiceCreate, service_service: ServiceService = Depends(get_service_service)):
    return service_service.create(service_create=service_create)


@service_router.delete("/{service_name}")
async def delete_service(service_name: str, service_service: ServiceService = Depends(get_service_service)):
    return service_service.delete(service_name=service_name)

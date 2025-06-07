from fastapi import APIRouter, Depends

from src.api.dependencies.request import get_request_service
from src.service.request import RequestService

request_router = APIRouter(prefix="/api/requests", tags=["requests"])


@request_router.get("/")
async def list_requests(request_service: RequestService = Depends(get_request_service)):
    return "ok"

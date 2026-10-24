import fastapi
from fastapi import APIRouter, Depends

from src.api.dependencies.auth import get_current_user
from src.api.dependencies.photo import get_photo_service
from src.api.schemas.photo import PhotoCreate
from src.service.exceptions import OrderNotFoundError, PhotoNotFoundError
from src.service.photo import PhotoService

photo_router = APIRouter(prefix="/api", tags=["photos"], dependencies=[Depends(get_current_user)])


@photo_router.get("/orders/{order_id}/photos")
async def list_order_photos(order_id: str, photo_service: PhotoService = Depends(get_photo_service)):
    try:
        return await photo_service.list_for_order(order_id=order_id)
    except OrderNotFoundError as exc:
        raise fastapi.HTTPException(status_code=404, detail="Order not found") from exc


@photo_router.post("/orders/{order_id}/photos", status_code=201)
async def add_order_photo(
    order_id: str,
    photo_create: PhotoCreate,
    photo_service: PhotoService = Depends(get_photo_service),
):
    try:
        return await photo_service.add(order_id=order_id, photo_create=photo_create)
    except OrderNotFoundError as exc:
        raise fastapi.HTTPException(status_code=404, detail="Order not found") from exc


@photo_router.delete("/photos/{photo_id}", status_code=204)
async def delete_photo(photo_id: str, photo_service: PhotoService = Depends(get_photo_service)):
    try:
        await photo_service.delete(photo_id=photo_id)
    except PhotoNotFoundError as exc:
        raise fastapi.HTTPException(status_code=404, detail="Photo not found") from exc

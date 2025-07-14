import fastapi
from fastapi import APIRouter, Depends

from src.api.dependencies.order import get_order_service
from src.api.schemas.order import OrderEdit
from src.service.exceptions import OrderNotFoundError, UserNotFoundError
from src.service.order import OrderService

order_router = APIRouter(prefix="/api/orders", tags=["orders"])


@order_router.get("/")
async def list_orders(order_service: OrderService = Depends(get_order_service)):
    return await order_service.list()


@order_router.get("/{order_id}")
async def get_order(order_id: str, order_service: OrderService = Depends(get_order_service)):
    try:
        order = await order_service.get(order_id=order_id)
    except OrderNotFoundError as exc:
        raise fastapi.HTTPException(status_code=404, detail="Order not found") from exc

    return order


@order_router.patch("/{order_id}")
async def edit_order(order_id: str, order_edit: OrderEdit, order_service: OrderService = Depends(get_order_service)):
    try:
        order = await order_service.edit(order_id=order_id, order_edit=order_edit)
    except OrderNotFoundError as exc:
        raise fastapi.HTTPException(status_code=404, detail="Order not found") from exc
    except UserNotFoundError as exc:
        raise fastapi.HTTPException(status_code=404, detail="User not found") from exc
    return order

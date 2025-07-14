from fastapi import Depends
from sqlalchemy.orm import Session

from src.domain.base import get_session
from src.service.order import OrderService


async def get_order_service(session: Session = Depends(get_session)):
    return OrderService(session)

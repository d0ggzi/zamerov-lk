from fastapi import Depends
from sqlalchemy.orm import Session

from src.domain.base import get_session
from src.service.service import ServiceService


async def get_service_service(session: Session = Depends(get_session)):
    return ServiceService(session)

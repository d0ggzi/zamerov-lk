from fastapi import Depends
from sqlalchemy.orm import Session

from src.domain.base import get_session
from src.service.request import RequestService


async def get_request_service(session: Session = Depends(get_session)):
    return RequestService(session)

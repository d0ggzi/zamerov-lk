import uuid
from sqlalchemy import select
from sqlalchemy.orm import Session

from src.api.schemas.request import RequestCreate
from src.domain import models
from src.domain.choices.status import Status


class RequestService:
    def __init__(self, session: Session):
        self.session = session

    def list(self):
        requests = self.session.execute(select(models.Request)).scalars().all()
        return requests

    def create(self, request_create: RequestCreate):
        new_request = models.Request(
            user_id=request_create.user_id,
            description=request_create.description,
            address=request_create.address,
            data=request_create.data,
            status=Status("draft"),
            employer_id=request_create.employer_id,
        )
        self.session.add(new_request)
        self.session.commit()

    def delete(self, request_id: str):
        request = self.session.execute(select(models.Request).where(models.Request.uuid == request_id)).scalar_one()
        self.session.delete(request)
        self.session.commit()

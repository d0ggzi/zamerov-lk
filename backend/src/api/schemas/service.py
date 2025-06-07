import uuid

from pydantic import BaseModel


class Service(BaseModel):
    id: uuid.UUID
    name: str

class ServiceCreate(BaseModel):
    name: str

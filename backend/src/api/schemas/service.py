import uuid

from pydantic import BaseModel


class Service(BaseModel):
    id: str
    name: str


class ServiceCreate(BaseModel):
    name: str

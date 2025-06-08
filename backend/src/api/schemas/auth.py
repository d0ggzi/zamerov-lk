import uuid
from pydantic import BaseModel, field_serializer


class Role(BaseModel):
    id: uuid.UUID
    name: str


class UserCreate(BaseModel):
    email: str
    name: str
    password: str
    role_name: str


class User(BaseModel):
    id: uuid.UUID
    email: str
    name: str
    role: Role

    @field_serializer("id")
    def serialize_uuid_id(self, value):
        return str(value)


class UserEdit(BaseModel):
    email: str | None = None
    name: str | None = None
    password: str | None = None
    role_name: str | None = None

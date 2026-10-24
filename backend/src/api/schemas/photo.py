from pydantic import BaseModel

from src.domain import models


class Photo(BaseModel):
    id: str
    url: str

    @staticmethod
    def from_orm_model(photo: models.OrderPhoto):
        return Photo(id=str(photo.uuid), url=photo.url)


class PhotoCreate(BaseModel):
    url: str

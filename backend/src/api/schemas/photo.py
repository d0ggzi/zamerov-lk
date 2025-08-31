from pydantic import BaseModel


class Photo(BaseModel):
    id: str
    url: str

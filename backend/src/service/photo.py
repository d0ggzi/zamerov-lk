import uuid

from sqlalchemy import select
from sqlalchemy.exc import NoResultFound
from sqlalchemy.orm import Session

from src.api.schemas.photo import Photo, PhotoCreate
from src.domain import models
from src.service.exceptions import OrderNotFoundError, PhotoNotFoundError
from src.service.s3 import S3Service


class PhotoService:
    def __init__(self, session: Session, s3_service: S3Service):
        self.session = session
        self.s3_service = s3_service

    async def list_for_order(self, order_id: str):
        self._get_order(order_id)
        photos = self.session.execute(
            select(models.OrderPhoto).where(models.OrderPhoto.order_id == order_id)
        ).scalars().all()
        return [Photo.from_orm_model(photo) for photo in photos]

    async def add(self, order_id: str, photo_create: PhotoCreate):
        self._get_order(order_id)
        # (order_id, url) уникальна — делаем add идемпотентным: если фото уже привязано,
        # возвращаем существующую запись, а не ловим IntegrityError (иначе middleware вернёт 500).
        existing = self.session.execute(
            select(models.OrderPhoto).where(
                models.OrderPhoto.order_id == order_id,
                models.OrderPhoto.url == photo_create.url,
            )
        ).scalar_one_or_none()
        if existing is not None:
            return Photo.from_orm_model(existing)
        photo = models.OrderPhoto(order_id=uuid.UUID(order_id), url=photo_create.url)
        self.session.add(photo)
        self.session.commit()
        return Photo.from_orm_model(photo)

    async def delete(self, photo_id: str):
        try:
            photo = self.session.execute(
                select(models.OrderPhoto).where(models.OrderPhoto.uuid == photo_id)
            ).scalar_one()
        except NoResultFound:
            raise PhotoNotFoundError
        self.s3_service.delete_file(photo.url)
        self.session.delete(photo)
        self.session.commit()

    def _get_order(self, order_id: str) -> models.Order:
        try:
            return self.session.execute(
                select(models.Order).where(models.Order.uuid == order_id, models.Order.deleted_at.is_(None))
            ).scalar_one()
        except NoResultFound:
            raise OrderNotFoundError

import fastapi.security as _security
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

import src.api.schemas.auth as schemas
import jwt

from src.api.schemas.auth import User
import src.domain.models.users as models
from src.service.exceptions import (
    UserAlreadyExistsError,
    UserNotFoundError,
    RoleNotFoundError,
    BadCredentials,
)
from src.settings.config import settings
from src.utils.password import check_password, hash_password

oauth2schema = _security.OAuth2PasswordBearer(tokenUrl="/api/auth/token")


async def get_user_by_email(session: Session, email: str) -> schemas.User:
    orm_user = session.query(models.User).filter_by(email=email).first()
    if orm_user is None:
        raise UserNotFoundError
    user = schemas.User(
        id=str(orm_user.uuid),
        email=orm_user.email,
        name=orm_user.name,
        role=schemas.Role(id=str(orm_user.role.uuid), name=orm_user.role.name),
    )
    return user


async def get_user_by_id(session: Session, user_id: str) -> schemas.User:
    orm_user = session.query(models.User).filter_by(uuid=user_id).first()
    if orm_user is None:
        raise UserNotFoundError
    user = schemas.User(
        id=str(orm_user.uuid),
        email=orm_user.email,
        name=orm_user.name,
        role=schemas.Role(id=str(orm_user.role.uuid), name=orm_user.role.name),
    )
    return user


async def list_users(session: Session, role: str | None) -> list[User]:
    query = select(models.User)
    if role is not None:
        query = query.join(models.Role).where(models.Role.name == role)
    orm_users = session.execute(query).scalars().all()
    users = [
        schemas.User(
            id=str(orm_user.uuid),
            email=orm_user.email,
            name=orm_user.name,
            role=schemas.Role(id=str(orm_user.role.uuid), name=orm_user.role.name),
        )
        for orm_user in orm_users
    ]
    return users


async def edit_user(session: Session, user_edit: schemas.UserEdit, user: schemas.User) -> schemas.User:
    orm_user = session.query(models.User).filter_by(email=user.email).one()
    if user_edit.name is not None:
        orm_user.name = user_edit.name
    if user_edit.email is not None:
        orm_user.email = user_edit.email
    if user_edit.password is not None:
        orm_user.password = hash_password(user_edit.password)
    if user_edit.role_name is not None:
        orm_user.role = session.query(models.Role).filter_by(name=user_edit.role_name).one()
    session.add(orm_user)
    session.commit()
    user_res = schemas.User(
        id=str(orm_user.uuid),
        email=orm_user.email,
        name=orm_user.name,
        role=schemas.Role(id=str(orm_user.role.uuid), name=orm_user.role.name),
    )
    return user_res


async def create_user(session: Session, user: schemas.UserCreate) -> schemas.User:
    role = session.query(models.Role).filter_by(name=user.role_name).one_or_none()
    if role is None:
        raise RoleNotFoundError
    hashed_password = hash_password(user.password)
    orm_user = models.User(email=user.email, password=hashed_password, name=user.name, role_id=role.uuid)
    try:
        session.add(orm_user)
        session.commit()
    except IntegrityError as exc:
        raise UserAlreadyExistsError from exc

    user_res = schemas.User(
        id=str(orm_user.uuid),
        email=user.email,
        name=user.name,
        role=schemas.Role(id=str(orm_user.role.uuid), name=orm_user.role.name),
    )
    return user_res


async def authenticate_user(session: Session, email: str, password: str) -> schemas.User:
    orm_user = session.query(models.User).filter_by(email=email).first()
    if orm_user is None or not check_password(password, orm_user.password):
        raise BadCredentials
    user_res = schemas.User(
        id=str(orm_user.uuid),
        email=email,
        name=orm_user.name,
        role=schemas.Role(id=str(orm_user.role.uuid), name=orm_user.role.name),
    )
    return user_res


async def create_token(user: schemas.User):
    token = jwt.encode(user.dict(), settings.JWT_SECRET)

    return dict(access_token=token, token_type="bearer")

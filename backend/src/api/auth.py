import fastapi
from fastapi import APIRouter, Depends
import fastapi.security as _security
from sqlalchemy.orm import Session

from src.api.dependencies.auth import get_current_user
from src.api.schemas.auth import UserCreate, User, UserEdit
from src.domain.base import get_session
from src.service import auth as user_service
from src.service.exceptions import (
    UserAlreadyExistsError,
    RoleNotFoundError,
    BadCredentials,
    UserNotFoundError,
)

auth_router = APIRouter(prefix="/api/auth", tags=["auth"])
user_router = APIRouter(prefix="/api/users", tags=["user"])


@auth_router.post("/register")
async def create_user(user_create: UserCreate, session: Session = Depends(get_session)):
    try:
        user: User = await user_service.create_user(session, user_create)
    except UserAlreadyExistsError as exc:
        raise fastapi.HTTPException(status_code=409, detail="Email already in use") from exc
    except RoleNotFoundError as exc:
        raise fastapi.HTTPException(status_code=404, detail="Role not found") from exc

    return await user_service.create_token(user)


@user_router.get("", response_model=list[User])
async def list_users(role: str | None = None, session: Session = Depends(get_session), user=fastapi.Depends(get_current_user)):
    return await user_service.list_users(session, role=role)


@user_router.get("/me", response_model=User)
async def get_current_user_api(user=fastapi.Depends(get_current_user)):
    return user


@user_router.get("/{user_id}", response_model=User)
async def get_user(user_id: str, session: Session = Depends(get_session), auth=fastapi.Depends(get_current_user)):
    try:
        user: User = await user_service.get_user_by_id(session, user_id)
    except UserNotFoundError as exc:
        raise fastapi.HTTPException(status_code=404, detail="User not found") from exc

    return user


@user_router.patch("/me")
async def edit_user(
    user_edit: UserEdit,
    session: Session = Depends(get_session),
    user=fastapi.Depends(get_current_user),
):
    edited_user: User = await user_service.edit_user(session, user_edit, user)
    return edited_user


@auth_router.post("/token")
async def generate_token(
    form_data: _security.OAuth2PasswordRequestForm = fastapi.Depends(),
    session: Session = Depends(get_session),
):
    try:
        user: User = await user_service.authenticate_user(session, form_data.username, form_data.password)
    except BadCredentials as exc:
        raise fastapi.HTTPException(status_code=401, detail="Invalid Credentials") from exc

    return await user_service.create_token(user)

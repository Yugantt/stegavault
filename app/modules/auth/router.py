from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.modules.auth.deps import get_current_user
from app.modules.auth.jwt import (
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.modules.auth.models import User
from app.modules.auth.schemas import (
    LoginRequest,
    RefreshRequest,
    RegisterRequest,
    TokenResponse,
    UserResponse,
)
from app.modules.auth.service import authenticate, register_user
from app.shared.exceptions import AuthError

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserResponse, status_code=201)
async def register(payload: RegisterRequest, db: AsyncSession = Depends(get_db)):
    return await register_user(db, payload)


@router.post("/login", response_model=TokenResponse)
async def login(
    payload: LoginRequest, request: Request, db: AsyncSession = Depends(get_db)
):
    user = await authenticate(db, payload.email, payload.password, request)
    return TokenResponse(
        access_token=create_access_token(str(user.id)),
        refresh_token=create_refresh_token(str(user.id)),
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh(payload: RefreshRequest):
    try:
        data = decode_token(payload.refresh_token)
    except ValueError:
        raise AuthError("Invalid refresh token")
    if data.get("type") != "refresh":
        raise AuthError("Wrong token type")
    return TokenResponse(
        access_token=create_access_token(data["sub"]),
        refresh_token=create_refresh_token(data["sub"]),
    )


@router.get("/me", response_model=UserResponse)
async def me(current: User = Depends(get_current_user)):
    return current

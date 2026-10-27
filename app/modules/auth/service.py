from datetime import datetime, timezone

from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.modules.auth.exceptions import (
    AccountDisabledError,
    InvalidCredentialsError,
    UserExistsError,
)
from app.modules.auth.models import LoginLog, User
from app.modules.auth.schemas import RegisterRequest

_ph = PasswordHasher(
    time_cost=settings.ARGON2_TIME_COST,
    memory_cost=settings.ARGON2_MEMORY_COST,
    parallelism=settings.ARGON2_PARALLELISM,
)


def hash_password(password: str) -> str:
    return _ph.hash(password)


def verify_password(password: str, hash_: str) -> bool:
    try:
        return _ph.verify(hash_, password)
    except VerifyMismatchError:
        return False
    except Exception:
        return False


async def register_user(db: AsyncSession, payload: RegisterRequest) -> User:
    result = await db.execute(
        select(User).where(
            or_(User.email == payload.email, User.username == payload.username)
        )
    )
    if result.scalar_one_or_none():
        raise UserExistsError("Email or username already taken")

    user = User(
        email=payload.email,
        username=payload.username,
        password_hash=hash_password(payload.password),
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


async def authenticate(
    db: AsyncSession, email: str, password: str, request=None
) -> User:
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if user is None or not verify_password(password, user.password_hash):
        await _log_login(db, email, "failed", "invalid_credentials", request, None)
        raise InvalidCredentialsError("Invalid email or password")

    if not user.is_active:
        await _log_login(db, email, "failed", "account_disabled", request, user.id)
        raise AccountDisabledError("Account disabled")

    user.last_login = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(user)

    await _log_login(db, email, "success", None, request, user.id)
    return user


async def _log_login(db, email, status, reason, request, user_id):
    log = LoginLog(
        user_id=user_id,
        email=email,
        status=status,
        reason=reason,
        ip_address=request.client.host if request and request.client else None,
        user_agent=(request.headers.get("user-agent", "")[:500] if request else None),
    )
    db.add(log)
    await db.commit()

import uuid
from typing import Optional
from fastapi import Depends, HTTPException, Request, Response, status
from fastapi_users import BaseUserManager, FastAPIUsers, UUIDIDMixin
from fastapi_users.authentication import AuthenticationBackend, CookieTransport, JWTStrategy
from fastapi_users.db import SQLAlchemyUserDatabase
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_session
from app.models import User


class CookieBearerTransport(CookieTransport):
    async def get_token(self, request: Request) -> Optional[str]:
        token = request.cookies.get(self.cookie_name)
        if token:
            return token
        auth = request.headers.get("Authorization")
        if auth and auth.startswith("Bearer "):
            return auth[7:]
        return None

    async def get_login_response(self, token: str, response: Optional[Response] = None) -> Response:
        if response is None:
            return await super().get_login_response(token)
        response.set_cookie(
            key=self.cookie_name,
            value=token,
            max_age=self.cookie_max_age,
            path=self.cookie_path,
            domain=self.cookie_domain,
            secure=self.cookie_secure,
            httponly=self.cookie_httponly,
            samesite=self.cookie_samesite,
        )
        return response


class UserManager(UUIDIDMixin, BaseUserManager[User, uuid.UUID]):
    reset_password_token_secret = settings.secret
    verification_token_secret = settings.secret

    async def on_after_register(self, user: User, request: Optional[Request] = None):
        pass

    async def on_after_forgot_password(self, user: User, token: str, request: Optional[Request] = None):
        pass

    async def on_after_request_verify(self, user: User, token: str, request: Optional[Request] = None):
        pass


async def get_user_db(session: AsyncSession = Depends(get_session)):
    yield SQLAlchemyUserDatabase(session, User)


async def get_user_manager(user_db: SQLAlchemyUserDatabase = Depends(get_user_db)):
    yield UserManager(user_db)


transport = CookieBearerTransport()


def get_jwt_strategy() -> JWTStrategy:
    return JWTStrategy(secret=settings.secret, lifetime_seconds=86400 * 30)


auth_backend = AuthenticationBackend(
    name="jwt",
    transport=transport,
    get_strategy=get_jwt_strategy,
)

fastapi_users = FastAPIUsers[User, uuid.UUID](get_user_manager, [auth_backend])

current_active_user = fastapi_users.current_user(active=True)
optional_active_user = fastapi_users.current_user(active=True, optional=True)

premium_user = fastapi_users.current_user(active=True)

async def require_premium(user: User = Depends(premium_user)):
    if user.is_admin:
        return user
    if not user.is_premium:
        raise HTTPException(status.HTTP_402_PAYMENT_REQUIRED, detail="Premium subscription required")
    return user


admin_user = fastapi_users.current_user(active=True)


async def require_admin(user: User = Depends(admin_user)):
    if not settings.admin_email or user.email != settings.admin_email:
        raise HTTPException(status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return user

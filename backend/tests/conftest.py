import uuid

import pytest
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlalchemy.pool import StaticPool

from app.models import Base, User


@pytest.fixture
async def session_maker():
    engine = create_async_engine(
        "sqlite+aiosqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    maker = async_sessionmaker(engine, expire_on_commit=False)
    yield maker
    await engine.dispose()


@pytest.fixture
async def session(session_maker):
    async with session_maker() as s:
        yield s


@pytest.fixture
def make_user():
    def _make(**overrides):
        defaults = dict(
            email=f"{uuid.uuid4()}@example.com",
            hashed_password="x",
            is_active=True,
            is_guest=False,
            is_premium=False,
            ai_free_used=False,
            ai_credits_used=0,
            ai_credits_reset_at=None,
        )
        defaults.update(overrides)
        return User(**defaults)

    return _make

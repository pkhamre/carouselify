# Save & Share Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) for syntax tracking.

**Goal:** Add FastAPI backend with PostgreSQL persistence, JWT auth via fastapi-users, carousel CRUD, public sharing with read-only view, and "Clone & Edit" flow.

**Architecture:** Monorepo with `frontend/` (Next.js moved from root) and `backend/` (FastAPI). Docker Compose orchestrates postgres, backend, frontend. JWT auth via fastapi-users with Bearer tokens stored in localStorage.

**Tech Stack:** FastAPI, fastapi-users[sqlalchemy], asyncpg, SQLAlchemy 2.0 async, Alembic async, Pydantic v2, Next.js 15 App Router, PostgreSQL 18-alpine

---

### Task 1: Backend — directory structure, requirements.txt, Dockerfile

**Files:**
- Create: `backend/requirements.txt`
- Create: `backend/Dockerfile`
- Create: `backend/app/__init__.py`
- Create: `backend/app/routers/__init__.py`

- [ ] **Step 1: Create directory structure**

```bash
mkdir -p backend/app/routers backend/alembic/versions
```

- [ ] **Step 2: Create requirements.txt**

```
fastapi>=0.115.0
fastapi-users[sqlalchemy]>=12.0.0
uvicorn[standard]>=0.34.0
asyncpg>=0.30.0
sqlalchemy[asyncio]>=2.0.0
alembic>=1.14.0
pydantic-settings>=2.7.0
python-multipart>=0.0.18
```

- [ ] **Step 3: Create backend/Dockerfile**

```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

- [ ] **Step 4: Create empty __init__.py files**

```bash
touch backend/app/__init__.py backend/app/routers/__init__.py
```

- [ ] **Step 5: Commit**

```bash
git add backend/
git commit -m "feat: add backend scaffold with requirements and Dockerfile"
```

---

### Task 2: Backend — config + database setup

**Files:**
- Create: `backend/app/config.py`
- Create: `backend/app/database.py`

- [ ] **Step 1: Create config.py**

```python
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://carouselify:carouselify@localhost:5432/carouselify"
    secret: str = "change-me-in-production"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
```

- [ ] **Step 2: Create database.py**

```python
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase

from app.config import settings

engine = create_async_engine(settings.database_url, echo=False)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_session() -> AsyncSession:
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()
```

- [ ] **Step 3: Commit**

```bash
git add backend/app/config.py backend/app/database.py
git commit -m "feat: add backend config and async database setup"
```

---

### Task 3: Backend — models (User + Carousel)

**Files:**
- Create: `backend/app/models.py`

- [ ] **Step 1: Create models.py**

```python
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from fastapi_users.db import SQLAlchemyBaseUserTableUUID

from app.database import Base


class User(SQLAlchemyBaseUserTableUUID, Base):
    __tablename__ = "user"

    carousels = relationship("Carousel", back_populates="user", cascade="all, delete-orphan")


class Carousel(Base):
    __tablename__ = "carousel"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("user.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False, default="Untitled")
    data = Column(JSONB, nullable=False, default=dict)
    is_public = Column(Boolean, default=False, nullable=False)
    share_token = Column(UUID(as_uuid=True), unique=True, nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=text("now()"), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=text("now()"), onupdate=text("now()"), nullable=False)

    user = relationship("User", back_populates="carousels")
```

Note: Add `from sqlalchemy.sql import text` at the top.

- [ ] **Step 2: Verify the import is included**

```python
from sqlalchemy.sql import text
```

- [ ] **Step 3: Commit**

```bash
git add backend/app/models.py
git commit -m "feat: add User (fastapi-users) and Carousel models"
```

---

### Task 4: Backend — Pydantic schemas

**Files:**
- Create: `backend/app/schemas.py`

- [ ] **Step 1: Create schemas.py**

```python
import uuid
from datetime import datetime
from pydantic import BaseModel


class CarouselCreate(BaseModel):
    title: str = "Untitled"
    data: dict = {}


class CarouselUpdate(BaseModel):
    title: str | None = None
    data: dict | None = None


class CarouselOut(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    title: str
    data: dict
    is_public: bool
    share_token: uuid.UUID | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class CarouselListItem(BaseModel):
    id: uuid.UUID
    title: str
    is_public: bool
    share_token: uuid.UUID | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ShareResponse(BaseModel):
    url: str
    share_token: uuid.UUID
```

- [ ] **Step 2: Commit**

```bash
git add backend/app/schemas.py
git commit -m "feat: add Pydantic schemas for carousel CRUD and share"
```

---

### Task 5: Backend — fastapi-users auth setup

**Files:**
- Create: `backend/app/users.py`

- [ ] **Step 1: Create users.py**

```python
import uuid
from typing import Optional
from fastapi import Depends, Request
from fastapi_users import BaseUserManager, FastAPIUsers, UUIDIDMixin
from fastapi_users.authentication import AuthenticationBackend, BearerTransport, JWTStrategy
from fastapi_users.db import SQLAlchemyUserDatabase
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_session
from app.models import User


class UserManager(UUIDIDMixin, BaseUserManager[User, uuid.UUID]):
    reset_password_token_secret = settings.secret
    verification_token_secret = settings.secret

    async def on_after_register(self, user: User, request: Optional[Request] = None):
        print(f"User {user.id} registered.")

    async def on_after_forgot_password(self, user: User, token: str, request: Optional[Request] = None):
        print(f"User {user.id} forgot password. Token: {token}")

    async def on_after_request_verify(self, user: User, token: str, request: Optional[Request] = None):
        print(f"Verification token for user {user.id}: {token}")


async def get_user_db(session: AsyncSession = Depends(get_session)):
    yield SQLAlchemyUserDatabase(session, User)


async def get_user_manager(user_db: SQLAlchemyUserDatabase = Depends(get_user_db)):
    yield UserManager(user_db)


bearer_transport = BearerTransport(tokenUrl="auth/jwt/login")


def get_jwt_strategy() -> JWTStrategy:
    return JWTStrategy(secret=settings.secret, lifetime_seconds=86400 * 30)


auth_backend = AuthenticationBackend(
    name="jwt",
    transport=bearer_transport,
    get_strategy=get_jwt_strategy,
)

fastapi_users = FastAPIUsers[User, uuid.UUID](get_user_manager, [auth_backend])

current_active_user = fastapi_users.current_user(active=True)
```

- [ ] **Step 2: Commit**

```bash
git add backend/app/users.py
git commit -m "feat: add fastapi-users auth setup with JWT strategy"
```

---

### Task 6: Backend — carousels router (CRUD + share/revoke)

**Files:**
- Create: `backend/app/routers/carousels.py`

- [ ] **Step 1: Create carousels.py**

```python
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.models import Carousel, User
from app.schemas import CarouselCreate, CarouselOut, CarouselListItem, CarouselUpdate, ShareResponse
from app.users import current_active_user

router = APIRouter(prefix="/api/carousels", tags=["carousels"])


@router.post("", response_model=CarouselOut, status_code=status.HTTP_201_CREATED)
async def create_carousel(
    data: CarouselCreate,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_session),
):
    carousel = Carousel(
        user_id=user.id,
        title=data.title,
        data=data.data,
    )
    session.add(carousel)
    await session.commit()
    await session.refresh(carousel)
    return carousel


@router.get("", response_model=list[CarouselListItem])
async def list_carousels(
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(
        select(Carousel).where(Carousel.user_id == user.id).order_by(Carousel.updated_at.desc())
    )
    return result.scalars().all()


@router.get("/{carousel_id}", response_model=CarouselOut)
async def get_carousel(
    carousel_id: uuid.UUID,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(
        select(Carousel).where(Carousel.id == carousel_id, Carousel.user_id == user.id)
    )
    carousel = result.scalar_one_or_none()
    if not carousel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Carousel not found")
    return carousel


@router.put("/{carousel_id}", response_model=CarouselOut)
async def update_carousel(
    carousel_id: uuid.UUID,
    data: CarouselUpdate,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(
        select(Carousel).where(Carousel.id == carousel_id, Carousel.user_id == user.id)
    )
    carousel = result.scalar_one_or_none()
    if not carousel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Carousel not found")
    if data.title is not None:
        carousel.title = data.title
    if data.data is not None:
        carousel.data = data.data
    await session.commit()
    await session.refresh(carousel)
    return carousel


@router.delete("/{carousel_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_carousel(
    carousel_id: uuid.UUID,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(
        select(Carousel).where(Carousel.id == carousel_id, Carousel.user_id == user.id)
    )
    carousel = result.scalar_one_or_none()
    if not carousel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Carousel not found")
    await session.delete(carousel)
    await session.commit()


@router.post("/{carousel_id}/share", response_model=ShareResponse)
async def share_carousel(
    carousel_id: uuid.UUID,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(
        select(Carousel).where(Carousel.id == carousel_id, Carousel.user_id == user.id)
    )
    carousel = result.scalar_one_or_none()
    if not carousel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Carousel not found")
    carousel.share_token = uuid.uuid4()
    carousel.is_public = True
    await session.commit()
    await session.refresh(carousel)
    return ShareResponse(url=f"/s/{carousel.share_token}", share_token=carousel.share_token)


@router.delete("/{carousel_id}/share", status_code=status.HTTP_204_NO_CONTENT)
async def revoke_share(
    carousel_id: uuid.UUID,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(
        select(Carousel).where(Carousel.id == carousel_id, Carousel.user_id == user.id)
    )
    carousel = result.scalar_one_or_none()
    if not carousel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Carousel not found")
    carousel.share_token = None
    carousel.is_public = False
    await session.commit()
```

- [ ] **Step 2: Create public share router in same file (or a separate one)**

Add this at the bottom of carousels.py:

```python
public_router = APIRouter(prefix="/api/s", tags=["public"])


@public_router.get("/{share_token}", response_model=CarouselOut)
async def get_shared_carousel(
    share_token: uuid.UUID,
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(
        select(Carousel).where(Carousel.share_token == share_token, Carousel.is_public == True)
    )
    carousel = result.scalar_one_or_none()
    if not carousel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shared carousel not found")
    return carousel
```

- [ ] **Step 3: Commit**

```bash
git add backend/app/routers/carousels.py
git commit -m "feat: add carousels CRUD and share/revoke endpoints"
```

---

### Task 7: Backend — main.py (app assembly, CORS, lifespan)

**Files:**
- Create: `backend/app/main.py`

- [ ] **Step 1: Create main.py**

```python
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base
from app.users import fastapi_users, auth_backend
from app.routers.carousels import router as carousels_router, public_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(title="Carouselify API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://frontend:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(fastapi_users.get_auth_router(auth_backend), prefix="/auth/jwt", tags=["auth"])
app.include_router(fastapi_users.get_register_router(), prefix="/auth", tags=["auth"])
app.include_router(fastapi_users.get_users_router(), prefix="/auth", tags=["auth"])
app.include_router(fastapi_users.get_reset_password_router(), prefix="/auth", tags=["auth"])
app.include_router(fastapi_users.get_verify_router(), prefix="/auth", tags=["auth"])
app.include_router(carousels_router)
app.include_router(public_router)


@app.get("/health")
async def health():
    return {"status": "ok"}
```

- [ ] **Step 2: Commit**

```bash
git add backend/app/main.py
git commit -m "feat: add FastAPI app with CORS, auth routers, Carousel CRUD"
```

---

### Task 8: Backend — Alembic async setup + initial migration

**Files:**
- Create: `backend/alembic.ini`
- Create: `backend/alembic/env.py`
- Create: `backend/alembic/script.py.mako`

- [ ] **Step 1: Initialize alembic**

```bash
cd backend && pip install -r requirements.txt && alembic init alembic
```

But since we may not have python installed, manually create these files:

- [ ] **Step 2: Create alembic.ini**

```ini
[alembic]
script_location = alembic
prepend_sys_path = .
sqlalchemy.url = postgresql+asyncpg://carouselify:carouselify@localhost:5432/carouselify

[loggers]
keys = root,sqlalchemy,alembic

[handlers]
keys = console

[formatters]
keys = generic

[logger_root]
level = WARN
handlers = console

[logger_sqlalchemy]
level = WARN
handlers =
qualname = sqlalchemy.engine

[logger_alembic]
level = INFO
handlers =
qualname = alembic

[handler_console]
class = StreamHandler
args = (sys.stderr,)
level = NOTSET
formatter = generic

[formatter_generic]
format = %(levelname)-5.5s [%(name)s] %(message)s
datefmt = %H:%M:%S
```

- [ ] **Step 3: Create alembic/env.py** (async variant)

```python
import asyncio
from logging.config import fileConfig

from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

from alembic import context

from app.database import Base
from app.models import User, Carousel

config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    configuration = config.get_section(config.config_ini_section, {})
    connectable = async_engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await connectable.dispose()


def run_migrations_online() -> None:
    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
```

- [ ] **Step 4: Create initial migration**

```bash
cd backend && alembic revision --autogenerate -m "initial"
```

If python not available, we'll generate after docker-compose is up, or just rely on `Base.metadata.create_all` in lifespan (already in main.py). The migration is secondary — the lifespan auto-creates tables for dev. Document this.

- [ ] **Step 5: Commit**

```bash
git add backend/alembic/ backend/alembic.ini
git commit -m "feat: add Alembic async migration setup"
```

---

### Task 9: Root — docker-compose.yml (all services)

**Files:**
- Modify: `docker-compose.yml` (root)

- [ ] **Step 1: Replace docker-compose.yml**

```yaml
services:
  postgres:
    image: postgres:18-alpine
    environment:
      POSTGRES_USER: carouselify
      POSTGRES_PASSWORD: carouselify
      POSTGRES_DB: carouselify
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U carouselify"]
      interval: 5s
      timeout: 5s
      retries: 5

  backend:
    build: ./backend
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      DATABASE_URL: postgresql+asyncpg://carouselify:carouselify@postgres:5432/carouselify
      SECRET: change-me-in-production
    ports:
      - "8000:8000"
    develop:
      watch:
        - path: ./backend
          action: rebuild

  frontend:
    build: ./frontend
    depends_on:
      - backend
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:8000
    ports:
      - "3000:3000"
    develop:
      watch:
        - path: ./frontend
          action: sync
          target: /app
          ignore:
            - node_modules/
            - .next/

volumes:
  pgdata:
```

- [ ] **Step 2: Commit**

```bash
git add docker-compose.yml
git commit -m "feat: add docker-compose with postgres, backend, frontend services"
```

---

### Task 10: Move frontend to frontend/ directory

**Files:**
- Move: `src/` → `frontend/src/`
- Move: `package.json`, `package-lock.json`, `tsconfig.json`, `next.config.mjs`, `tailwind.config.ts`, `postcss.config.mjs`, `eslint.config.mjs` → `frontend/`
- Move: `.dockerignore` → `frontend/`
- Delete: root `Dockerfile` (replaced by `frontend/Dockerfile`)

- [ ] **Step 1: Move source files and config**

```bash
mkdir -p frontend
git mv src frontend/
git mv package.json package-lock.json tsconfig.json next.config.mjs tailwind.config.ts postcss.config.mjs eslint.config.mjs frontend/
git mv .dockerignore frontend/
git rm Dockerfile
```

- [ ] **Step 2: Update import paths in frontend files** — The `@/*` path alias in `tsconfig.json` points to `./src/*`. Since tsconfig.json is now at `frontend/tsconfig.json`, this still resolves to `frontend/src/*`. No changes needed.

- [ ] **Step 3: Update frontend Dockerfile** — Create `frontend/Dockerfile` based on the root Dockerfile, with corrected COPY paths:

```dockerfile
# ============================================================
# Base stage — shared foundation for all targets
# ============================================================
FROM node:24-alpine AS base
WORKDIR /app

# ============================================================
# Dependencies stage
# ============================================================
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci

# ============================================================
# Development stage
# ============================================================
FROM base AS dev
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# ============================================================
# Builder stage
# ============================================================
FROM base AS builder
ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV
ENV NEXT_OUTPUT=standalone
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ============================================================
# Runner stage
# ============================================================
FROM base AS runner
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
```

- [ ] **Step 4: Commit**

```bash
git add frontend/ && git rm Dockerfile && git add docker-compose.yml
git commit -m "refactor: move frontend to frontend/ directory"
```

---

### Task 11: Frontend — API client (src/lib/api.ts)

**Files:**
- Create: `frontend/src/lib/api.ts`

- [ ] **Step 1: Create api.ts**

```typescript
"use client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem("token", token);
  } else {
    localStorage.removeItem("token");
  }
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(body.detail || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// Auth
export function login(email: string, password: string): Promise<{ access_token: string; token_type: string }> {
  const form = new URLSearchParams();
  form.append("username", email);
  form.append("password", password);
  return request("/auth/jwt/login", {
    method: "POST",
    body: form,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
}

export function register(email: string, password: string): Promise<any> {
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function logout(): Promise<void> {
  return request("/auth/jwt/logout", { method: "POST" });
}

export function getMe(): Promise<{ id: string; email: string; is_active: boolean; is_superuser: boolean; is_verified: boolean }> {
  return request("/auth/me");
}

// Carousels
export interface CarouselListItem {
  id: string;
  title: string;
  is_public: boolean;
  share_token: string | null;
  created_at: string;
  updated_at: string;
}

export interface CarouselData {
  id: string;
  user_id: string;
  title: string;
  data: any;
  is_public: boolean;
  share_token: string | null;
  created_at: string;
  updated_at: string;
}

export function createCarousel(title: string, data: any): Promise<CarouselData> {
  return request("/api/carousels", {
    method: "POST",
    body: JSON.stringify({ title, data }),
  });
}

export function listCarousels(): Promise<CarouselListItem[]> {
  return request("/api/carousels");
}

export function getCarousel(id: string): Promise<CarouselData> {
  return request(`/api/carousels/${id}`);
}

export function updateCarousel(id: string, data: { title?: string; data?: any }): Promise<CarouselData> {
  return request(`/api/carousels/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteCarousel(id: string): Promise<void> {
  return request(`/api/carousels/${id}`, { method: "DELETE" });
}

export function shareCarousel(id: string): Promise<{ url: string; share_token: string }> {
  return request(`/api/carousels/${id}/share`, { method: "POST" });
}

export function revokeShare(id: string): Promise<void> {
  return request(`/api/carousels/${id}/share`, { method: "DELETE" });
}

export function getSharedCarousel(shareToken: string): Promise<CarouselData> {
  return request(`/api/s/${shareToken}`);
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/lib/api.ts
git commit -m "feat: add frontend API client with auth and carousel endpoints"
```

---

### Task 12: Frontend — AuthProvider context + AuthModal

**Files:**
- Create: `frontend/src/lib/auth.tsx`
- Create: `frontend/src/components/AuthModal.tsx`

- [ ] **Step 1: Create auth context**

`frontend/src/lib/auth.tsx`:

```typescript
"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { login as apiLogin, register as apiRegister, logout as apiLogout, getMe, setToken, getToken, isAuthenticated } from "./api";

interface AuthUser {
  id: string;
  email: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated()) {
      getMe()
        .then((u) => setUser({ id: u.id, email: u.email }))
        .catch(() => setToken(null))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiLogin(email, password);
    setToken(res.access_token);
    const me = await getMe();
    setUser({ id: me.id, email: me.email });
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    await apiRegister(email, password);
    await login(email, password);
  }, [login]);

  const logout = useCallback(async () => {
    try { await apiLogout(); } catch {}
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
```

- [ ] **Step 2: Create AuthModal component**

`frontend/src/components/AuthModal.tsx`:

```tsx
"use client";

import { useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

export function AuthModal({ open, onClose }: AuthModalProps) {
  const { login, register } = useAuth();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (tab === "login") {
        await login(email, password);
      } else {
        await register(email, password);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-sm mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex mb-4">
          <button
            className={`flex-1 pb-2 text-sm font-medium border-b-2 transition-colors ${
              tab === "login"
                ? "border-sky-600 text-sky-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setTab("login")}
          >
            Login
          </button>
          <button
            className={`flex-1 pb-2 text-sm font-medium border-b-2 transition-colors ${
              tab === "register"
                ? "border-sky-600 text-sky-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setTab("register")}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-600"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-600"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            className="w-full py-2 text-sm font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-700 disabled:opacity-50 transition-colors"
          >
            {busy ? "Please wait..." : tab === "login" ? "Login" : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/lib/auth.tsx frontend/src/components/AuthModal.tsx
git commit -m "feat: add AuthProvider context and AuthModal component"
```

---

### Task 13: Frontend — SaveButton + ShareDialog components

**Files:**
- Create: `frontend/src/components/SaveButton.tsx`
- Create: `frontend/src/components/ShareDialog.tsx`

- [ ] **Step 1: Create SaveButton**

`frontend/src/components/SaveButton.tsx`:

```tsx
"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { createCarousel, updateCarousel } from "@/lib/api";
import { AuthModal } from "./AuthModal";

interface SaveButtonProps {
  carouselData: any;
  savedId: string | null;
  onSaved: (id: string, title: string) => void;
}

export function SaveButton({ carouselData, savedId, onSaved }: SaveButtonProps) {
  const { user, isAuthenticated } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [busy, setBusy] = useState(false);
  const [title, setTitle] = useState("Untitled");

  const handleSave = useCallback(async () => {
    if (!isAuthenticated) {
      setShowAuth(true);
      return;
    }
    setBusy(true);
    try {
      if (savedId) {
        await updateCarousel(savedId, { title, data: carouselData });
      } else {
        const created = await createCarousel(title, carouselData);
        onSaved(created.id, created.title);
      }
    } finally {
      setBusy(false);
    }
  }, [isAuthenticated, savedId, carouselData, title, onSaved]);

  return (
    <>
      <button
        onClick={handleSave}
        disabled={busy}
        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
      >
        {busy ? "Saving..." : savedId ? "Save" : "Save"}
      </button>

      {showAuth && isAuthenticated === false && (
        <AuthModal open={showAuth} onClose={() => setShowAuth(false)} />
      )}
    </>
  );
}
```

- [ ] **Step 2: Create ShareDialog**

`frontend/src/components/ShareDialog.tsx`:

```tsx
"use client";

import { useState, useCallback } from "react";
import { shareCarousel, revokeShare } from "@/lib/api";

interface ShareDialogProps {
  carouselId: string;
  shareUrl: string | null;
  onShared: (url: string) => void;
  onRevoked: () => void;
}

export function ShareDialog({ carouselId, shareUrl, onShared, onRevoked }: ShareDialogProps) {
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(async () => {
    setBusy(true);
    try {
      const res = await shareCarousel(carouselId);
      onShared(res.url);
    } finally {
      setBusy(false);
    }
  }, [carouselId, onShared]);

  const handleRevoke = useCallback(async () => {
    setBusy(true);
    try {
      await revokeShare(carouselId);
      onRevoked();
    } finally {
      setBusy(false);
    }
  }, [carouselId, onRevoked]);

  const handleCopy = useCallback(async () => {
    if (!shareUrl) return;
    const fullUrl = `${window.location.origin}${shareUrl}`;
    await navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [shareUrl]);

  if (!shareUrl) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 transition-colors">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Share</h3>
        <button
          onClick={handleShare}
          disabled={busy}
          className="w-full py-2 text-sm font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-700 disabled:opacity-50 transition-colors"
        >
          {busy ? "Generating..." : "Generate share link"}
        </button>
      </div>
    );
  }

  const fullUrl = typeof window !== "undefined" ? `${window.location.origin}${shareUrl}` : shareUrl;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 transition-colors">
      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Share</h3>
      <div className="flex items-center gap-2">
        <input
          type="text"
          readOnly
          value={fullUrl}
          className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        />
        <button
          onClick={handleCopy}
          className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <button
        onClick={handleRevoke}
        disabled={busy}
        className="mt-2 w-full py-1.5 text-xs font-medium text-red-600 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 transition-colors"
      >
        Revoke share link
      </button>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/SaveButton.tsx frontend/src/components/ShareDialog.tsx
git commit -m "feat: add SaveButton and ShareDialog components"
```

---

### Task 14: Frontend — update page.tsx with auth + save/share integration

**Files:**
- Modify: `frontend/src/app/page.tsx`

- [ ] **Step 1: Add imports and state**

Add these imports:

```typescript
import { AuthProvider } from "@/lib/auth";
import { SaveButton } from "@/components/SaveButton";
import { ShareDialog } from "@/components/ShareDialog";
```

Add state variables after existing state:

```typescript
const [savedCarouselId, setSavedCarouselId] = useState<string | null>(null);
const [shareUrl, setShareUrl] = useState<string | null>(null);
```

- [ ] **Step 2: Wrap the return with AuthProvider**

```tsx
export default function Home() {
  // ... existing state
  const [savedCarouselId, setSavedCarouselId] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  // ... existing handlers

  const carouselData = {
    slides,
    schemeIndex: colorSchemes.indexOf(scheme), // Need to import colorSchemes
    fontIndex: fontPairings.indexOf(fonts),
    logo,
    inverted,
    presentationTitle: "My Deck",
  };

  return (
    <AuthProvider>
      <div className="min-h-screen ...">
        {/* existing content, with SaveButton in header and ShareDialog in sidebar */}
        <header>
          {/* ... */}
          <div className="flex items-center gap-3">
            <SaveButton
              carouselData={carouselData}
              savedId={savedCarouselId}
              onSaved={(id, title) => {
                setSavedCarouselId(id);
                // toast
              }}
            />
            {savedCarouselId && (
              <ShareDialog
                carouselId={savedCarouselId}
                shareUrl={shareUrl}
                onShared={setShareUrl}
                onRevoked={() => setShareUrl(null)}
              />
            )}
            {/* existing buttons */}
          </div>
        </header>
        {/* ... */}
      </div>
    </AuthProvider>
  );
}
```

- [ ] **Step 3: Import colorSchemes and fontPairings**

Add to the import from `@/lib/themes`:

```typescript
import { defaultScheme, defaultFonts, colorSchemes, fontPairings } from "@/lib/themes";
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/app/page.tsx
git commit -m "feat: integrate SaveButton and ShareDialog into editor"
```

---

### Task 15: Frontend — add readOnly prop to slide components

**Files:**
- Modify: `frontend/src/components/slides/SlideCanvas.tsx`
- Modify: `frontend/src/components/slides/CoverSlide.tsx`
- Modify: `frontend/src/components/slides/ContentB1Slide.tsx`
- Modify: `frontend/src/components/slides/ContentB2Slide.tsx`
- Modify: `frontend/src/components/slides/ListSlide.tsx`
- Modify: `frontend/src/components/slides/CtaSlide.tsx`

- [ ] **Step 1: Add readOnly to SlideCanvasProps**

```typescript
interface SlideCanvasProps {
  slide: Slide;
  scheme: ColorScheme;
  fonts: FontPairing;
  logo: LogoConfig;
  slideNumber: number;
  totalSlides: number;
  readOnly?: boolean;
}
```

Pass through to each slide component.

- [ ] **Step 2: Add readOnly to each slide component's interface and props**

For CoverSlide, ContentB1Slide, ContentB2Slide, ListSlide, CtaSlide:

```typescript
interface XxxSlideComponentProps {
  // existing props
  readOnly?: boolean;
}
```

- [ ] **Step 3: No rendering changes needed for read-only**

Since the slide components already render text statically (using `<h1>`, `<h2>`, `<p>`, `<li>` elements — not `<input>` or contentEditable), the existing render is already "read-only". The `readOnly` prop is available for future use if editable controls are added. For now, the prop is accepted but the rendering is the same.

This matches the spec: "text renders as `<p>` instead of `<input>`/contentEditable" — which is already the case.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/slides/
git commit -m "feat: add readOnly prop to all slide components"
```

---

### Task 16: Frontend — create public view at /s/[id]/page.tsx

**Files:**
- Create: `frontend/src/app/s/[id]/page.tsx`

- [ ] **Step 1: Create the public shared view page**

```tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSharedCarousel } from "@/lib/api";
import { SlideCanvas } from "@/components/slides/SlideCanvas";
import type { Slide, ColorScheme, FontPairing, LogoConfig } from "@/lib/types";
import { colorSchemes, fontPairings } from "@/lib/themes";

interface SharedCarouselData {
  slides: Slide[];
  schemeIndex: number;
  fontIndex: number;
  logo: LogoConfig;
  inverted: boolean;
  presentationTitle: string;
}

export default function SharedCarouselPage() {
  const params = useParams();
  const router = useRouter();
  const shareToken = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<SharedCarouselData | null>(null);

  useEffect(() => {
    if (!shareToken) return;
    setLoading(true);
    getSharedCarousel(shareToken)
      .then((res) => {
        setData(res.data as SharedCarouselData);
      })
      .catch((err) => {
        setError(err.message || "Failed to load carousel");
      })
      .finally(() => setLoading(false));
  }, [shareToken]);

  const handleClone = () => {
    if (!data) return;
    // Store data in sessionStorage and redirect to editor
    sessionStorage.setItem("clone-data", JSON.stringify(data));
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <p className="text-gray-500">Loading carousel...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Not found</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-4">{error || "This carousel doesn't exist or has been unshared."}</p>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-700 transition-colors"
          >
            Go to editor
          </button>
        </div>
      </div>
    );
  }

  const scheme: ColorScheme = data.schemeIndex !== undefined ? colorSchemes[data.schemeIndex] || colorSchemes[0] : colorSchemes[0];
  const fonts: FontPairing = data.fontIndex !== undefined ? fontPairings[data.fontIndex] || fontPairings[0] : fontPairings[0];
  const effectiveScheme: ColorScheme = data.inverted
    ? { ...scheme, background: scheme.textPrimary, textPrimary: scheme.background, textOnAccent: scheme.bgOnAccent, bgOnAccent: scheme.textPrimary }
    : scheme;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 transition-colors">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {data.presentationTitle || "Shared Carousel"}
          </h1>
          <button
            onClick={handleClone}
            className="px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-700 transition-colors"
          >
            Clone and Edit
          </button>
        </div>
      </header>

      <div className="max-w-[600px] mx-auto p-6 space-y-6">
        {data.slides.map((slide: Slide, index: number) => (
          <div
            key={slide.id}
            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden"
          >
            <div style={{ aspectRatio: "1", position: "relative", overflow: "hidden" }}>
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: 1080,
                  height: 1080,
                  transform: "scale(0.5)",
                  transformOrigin: "top left",
                }}
              >
                <SlideCanvas
                  slide={slide}
                  scheme={effectiveScheme}
                  fonts={fonts}
                  logo={data.logo}
                  slideNumber={index + 1}
                  totalSlides={data.slides.length}
                  readOnly
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Update page.tsx to check for cloned data**

In `frontend/src/app/page.tsx`, add at the top of the Home component:

```typescript
useEffect(() => {
  const cloneData = sessionStorage.getItem("clone-data");
  if (cloneData) {
    try {
      const parsed = JSON.parse(cloneData);
      if (parsed.slides) setSlides(parsed.slides);
      if (parsed.schemeIndex !== undefined) setScheme(colorSchemes[parsed.schemeIndex] || defaultScheme);
      if (parsed.fontIndex !== undefined) setFonts(fontPairings[parsed.fontIndex] || defaultFonts);
      if (parsed.logo) setLogo(parsed.logo);
      if (parsed.inverted !== undefined) setInverted(parsed.inverted);
    } catch {}
    sessionStorage.removeItem("clone-data");
  }
}, []);
```

Add the import:

```typescript
import { useEffect } from "react";
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/s/[id]/page.tsx frontend/src/app/page.tsx
git commit -m "feat: add public shared view at /s/[id] with Clone & Edit"
```

---

### Task 17: Frontend — Toast notification utility (for save/share feedback)

**Files:**
- Create: `frontend/src/components/Toast.tsx`

- [ ] **Step 1: Create a simple toast component**

```tsx
"use client";

import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from "react";

interface ToastItem {
  id: number;
  message: string;
  type: "success" | "error";
}

interface ToastContextType {
  toast: (message: string, type?: "success" | "error") => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

let toastId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const toast = useCallback((message: string, type: "success" | "error" = "success") => {
    const id = ++toastId;
    setItems((prev) => [...prev, { id, message, type }]);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] space-y-2">
        {items.map((item) => (
          <ToastItem key={item.id} item={item} onDone={() => setItems((prev) => prev.filter((i) => i.id !== item.id))} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ item, onDone }: { item: ToastItem; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      className={`px-4 py-2 rounded-lg text-sm font-medium shadow-lg transition-colors ${
        item.type === "success"
          ? "bg-green-600 text-white"
          : "bg-red-600 text-white"
      }`}
    >
      {item.message}
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
```

- [ ] **Step 2: Integrate toast into page.tsx**

Wrap with `<ToastProvider>` alongside `<AuthProvider>`:

```tsx
<AuthProvider>
  <ToastProvider>
    {/* ... */}
  </ToastProvider>
</AuthProvider>
```

Use in SaveButton integration:

```typescript
const { toast } = useToast();

// after save success
onSaved={(id, title) => {
  setSavedCarouselId(id);
  toast("Carousel saved!");
}}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/Toast.tsx
git commit -m "feat: add Toast notification component"
```

---

### Task 18: Update AGENTS.md + .gitignore

**Files:**
- Modify: `AGENTS.md`

- [ ] **Step 1: Update AGENTS.md**

Add backend commands and new architecture info:

```markdown
## Backend (FastAPI)

### Commands
- `docker compose up` — Start all services (postgres, backend, frontend)
- `docker compose up postgres backend` — Start backend only
- `cd backend && uvicorn app.main:app --reload` — Dev server (with local postgres)
- `cd backend && alembic upgrade head` — Run migrations

### Architecture
- Backend at `backend/`, frontend at `frontend/`
- Docker Compose orchestrates postgres, backend, frontend
- Auth via fastapi-users with JWT Bearer tokens
- API client in `frontend/src/lib/api.ts`
- Auth context in `frontend/src/lib/auth.tsx`
```

- [ ] **Step 2: Update .gitignore** (ensure backend artifacts are ignored)

Add to `.gitignore`:

```
__pycache__/
*.pyc
*.egg-info/
.venv/
```

- [ ] **Step 3: Commit**

```bash
git add AGENTS.md .gitignore
git commit -m "docs: update AGENTS.md and .gitignore for backend"
```

---

### Task 19: Build and verify

- [ ] **Step 1: Run the frontend build** to check for TypeScript errors

```bash
cd frontend && npm run build
```

- [ ] **Step 2: Fix any build errors** (import paths, missing exports, etc.)

- [ ] **Step 3: Start the full stack** with Docker Compose

```bash
docker compose up --build
```

- [ ] **Step 4: Verify health endpoint**

```bash
curl http://localhost:8000/health
```

Expected: `{"status": "ok"}`

- [ ] **Step 5: Verify registration**

```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

- [ ] **Step 6: Verify login**

```bash
curl -X POST http://localhost:8000/auth/jwt/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=test@example.com&password=password123"
```

Expected: returns `{"access_token": "...", "token_type": "bearer"}`

- [ ] **Step 7: Verify carousel CRUD (using the token)**

```bash
TOKEN="<token from login>"

# Create
curl -X POST http://localhost:8000/api/carousels \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","data":{"slides":[]}}'

# List
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/carousels
```

- [ ] **Step 8: Final commit if any fixes were needed**

```bash
git add -A && git commit -m "fix: build errors and polish"
```

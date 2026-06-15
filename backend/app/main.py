from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.database import engine, Base
from app.schemas import UserRead, UserCreate, UserUpdate
from app.users import fastapi_users, auth_backend
from app.config import settings
from app.limiter import limiter
from pathlib import Path
from fastapi.staticfiles import StaticFiles
from app.routers.carousels import router as carousels_router, public_router, guest_router
from app.routers.schemes import router as schemes_router
from app.routers.billing import router as billing_router
from app.routers.upload import router as upload_router
from app.routers.ai import router as ai_router
from app.routers.config import router as config_router
from app.routers.admin import router as admin_router, contact_public_router, track_public_router
from app.routers.showcase import router as showcase_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


docs_enabled = settings.environment != "production"
app = FastAPI(title="Carouselify API", lifespan=lifespan, docs_url="/docs" if docs_enabled else None, redoc_url="/redoc" if docs_enabled else None)

app.state.limiter = limiter
app.add_exception_handler(429, lambda request, exc: JSONResponse(status_code=429, content={"detail": "Too many requests"}))

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4000",
        "http://frontend:4000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response

uploads_dir = Path("uploads/logos")
uploads_dir.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(fastapi_users.get_auth_router(auth_backend), prefix="/auth/jwt", tags=["auth"])
app.include_router(fastapi_users.get_register_router(UserRead, UserCreate), prefix="/auth", tags=["auth"])
app.include_router(fastapi_users.get_users_router(UserRead, UserUpdate), prefix="/auth", tags=["auth"])
app.include_router(fastapi_users.get_reset_password_router(), prefix="/auth", tags=["auth"])
app.include_router(fastapi_users.get_verify_router(UserRead), prefix="/auth", tags=["auth"])
app.include_router(carousels_router)
app.include_router(guest_router)
app.include_router(schemes_router)
app.include_router(public_router)
app.include_router(billing_router)
app.include_router(upload_router)
app.include_router(ai_router)
app.include_router(admin_router)
app.include_router(contact_public_router)
app.include_router(track_public_router)
app.include_router(showcase_router)
app.include_router(config_router)


@app.get("/health")
async def health():
    return {"status": "ok"}

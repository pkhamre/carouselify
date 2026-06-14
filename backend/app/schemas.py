import uuid
from datetime import datetime
from typing import Optional
from fastapi_users import schemas as users_schemas
from pydantic import BaseModel


class UserRead(users_schemas.BaseUser[uuid.UUID]):
    is_premium: bool = False
    ai_credits_used: int = 0
    ai_credits_reset_at: Optional[datetime] = None
    lemon_squeezy_subscription_id: Optional[str] = None


class UserCreate(users_schemas.BaseUserCreate):
    pass


class UserUpdate(users_schemas.BaseUserUpdate):
    pass


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


class GuestResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str


class LinkGuestRequest(BaseModel):
    guest_user_id: str


class ShareResponse(BaseModel):
    url: str
    share_token: uuid.UUID


class CheckoutRequest(BaseModel):
    return_url: str


class CheckoutResponse(BaseModel):
    url: str


class PortalResponse(BaseModel):
    url: str


class CreditsResponse(BaseModel):
    used: int
    limit: int
    remaining: int
    resets_at: datetime | None


class AiGenerateRequest(BaseModel):
    prompt: str
    slide_count: int = 5


class AiGenerateResponse(BaseModel):
    slides: list
    credits_used: int
    credits_remaining: int

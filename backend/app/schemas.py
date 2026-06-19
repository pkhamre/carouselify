import uuid
from datetime import datetime
from typing import Optional
from fastapi_users import schemas as users_schemas
from pydantic import BaseModel


class UserRead(users_schemas.BaseUser[uuid.UUID]):
    is_premium: bool = False
    is_admin: bool = False
    ai_free_used: bool = False
    ai_credits_used: int = 0
    ai_credits_reset_at: Optional[datetime] = None
    polar_subscription_id: Optional[str] = None
    polar_subscription_status: Optional[str] = None
    polar_subscription_period_end: Optional[datetime] = None
    polar_cancel_at_period_end: bool = False


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
    showcase_author: str | None = None


class CarouselOut(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    title: str
    data: dict
    is_public: bool
    share_token: uuid.UUID | None
    showcased: bool = False
    showcase_author: str | None = None
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


class PublishShowcaseRequest(BaseModel):
    author: str | None = None


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
    slide_count: int = 1


class AiGenerateResponse(BaseModel):
    slides: list
    credits_used: int
    credits_remaining: int


class CustomSchemeCreate(BaseModel):
    name: str
    background: str
    accent: str
    text_primary: str
    text_on_accent: str
    bg_on_accent: str


class CustomSchemeUpdate(BaseModel):
    name: str | None = None
    background: str | None = None
    accent: str | None = None
    text_primary: str | None = None
    text_on_accent: str | None = None
    bg_on_accent: str | None = None


class TrackEventRequest(BaseModel):
    event_type: str
    carousel_id: uuid.UUID | None = None
    metadata: dict | None = None


class ShowcaseListItem(BaseModel):
    id: uuid.UUID
    title: str
    showcase_author: str | None = None
    share_token: uuid.UUID
    created_at: datetime
    slide_count: int = 0
    like_count: int = 0

    model_config = {"from_attributes": True}


class LikeResponse(BaseModel):
    liked: bool
    like_count: int


class ContactMessageCreate(BaseModel):
    name: str
    email: str
    message: str


class ContactMessageOut(BaseModel):
    id: uuid.UUID
    name: str
    email: str
    message: str
    archived: bool = False
    created_at: datetime

    model_config = {"from_attributes": True}


class StatsResponse(BaseModel):
    users: dict
    carousels: dict
    ai: dict
    events: dict
    showcase: dict


class CustomSchemeOut(BaseModel):
    id: uuid.UUID
    name: str
    background: str
    accent: str
    text_primary: str
    text_on_accent: str
    bg_on_accent: str
    created_at: datetime

    model_config = {"from_attributes": True}

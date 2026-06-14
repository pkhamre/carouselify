import uuid
from datetime import datetime
from fastapi_users import schemas as users_schemas
from pydantic import BaseModel


class UserRead(users_schemas.BaseUser[uuid.UUID]):
    pass


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


class ShareResponse(BaseModel):
    url: str
    share_token: uuid.UUID

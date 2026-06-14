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

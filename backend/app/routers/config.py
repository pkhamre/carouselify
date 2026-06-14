from fastapi import APIRouter
from pydantic import BaseModel
from app.config import settings

router = APIRouter(tags=["config"])


class ConfigResponse(BaseModel):
    subscriptions_enabled: bool


@router.get("/api/config", response_model=ConfigResponse)
async def get_config():
    return ConfigResponse(subscriptions_enabled=settings.subscriptions_enabled)

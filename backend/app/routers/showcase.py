import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.schemas import ShowcaseListItem
from app.showcase_items import list_showcase_items

router = APIRouter(prefix="/api/showcase", tags=["showcase"])


@router.get("", response_model=list[ShowcaseListItem])
async def list_showcase(
    session: AsyncSession = Depends(get_session),
):
    return await list_showcase_items(session)

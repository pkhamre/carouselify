import uuid
from sqlalchemy import func
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.models import Carousel, CarouselLike
from app.schemas import ShowcaseListItem

router = APIRouter(prefix="/api/showcase", tags=["showcase"])


@router.get("", response_model=list[ShowcaseListItem])
async def list_showcase(
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(
        select(Carousel)
        .where(Carousel.showcased == True, Carousel.share_token.isnot(None))
        .order_by(Carousel.updated_at.desc())
    )
    carousels = result.scalars().all()
    items = []
    for c in carousels:
        slides = c.data.get("slides", []) if c.data else []
        like_count = await session.scalar(
            select(func.count(CarouselLike.id)).where(CarouselLike.carousel_id == c.id)
        ) or 0
        items.append(ShowcaseListItem(
            id=c.id,
            title=c.title,
            showcase_author=c.showcase_author,
            share_token=c.share_token,
            created_at=c.created_at,
            slide_count=len(slides),
            like_count=like_count,
        ))
    return items

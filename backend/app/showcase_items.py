from fastapi import Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.models import Carousel, CarouselLike
from app.schemas import ShowcaseListItem


async def list_showcase_items(
    session: AsyncSession,
    include_unshared: bool = False,
) -> list[ShowcaseListItem]:
    """Shape the Showcase gallery listing. Public hides unshared carousels; admin includes them.

    slide_count is derived from each carousel's data; like_count is aggregated in one
    grouped query (no per-carousel N+1).
    """
    conds = [Carousel.showcased == True]  # noqa: E712
    if not include_unshared:
        conds.append(Carousel.share_token.isnot(None))

    result = await session.execute(
        select(Carousel).where(*conds).order_by(Carousel.updated_at.desc())
    )
    carousels = result.scalars().all()
    if not carousels:
        return []

    like_rows = await session.execute(
        select(CarouselLike.carousel_id, func.count(CarouselLike.id))
        .where(CarouselLike.carousel_id.in_([c.id for c in carousels]))
        .group_by(CarouselLike.carousel_id)
    )
    like_counts = dict(like_rows.all())

    return [
        ShowcaseListItem(
            id=c.id,
            title=c.title,
            showcase_author=c.showcase_author,
            share_token=c.share_token,
            created_at=c.created_at,
            slide_count=len(c.data.get("slides", [])) if c.data else 0,
            like_count=like_counts.get(c.id, 0),
        )
        for c in carousels
    ]

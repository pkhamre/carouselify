from uuid import UUID

from fastapi import Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.models import Carousel


class CarouselStore:
    """Fetch Carousel rows behind one seam, owning the ownership-filter semantics.

    Returns None instead of raising, so callers (and tests) decide how to surface
    a missing row (e.g. a 404) without coupling the store to HTTP errors.
    """

    def __init__(self, session: AsyncSession):
        self._session = session

    async def get_owned(self, carousel_id: UUID, user_id: UUID) -> Carousel | None:
        result = await self._session.execute(
            select(Carousel).where(
                Carousel.id == carousel_id, Carousel.user_id == user_id
            )
        )
        return result.scalar_one_or_none()


def get_carousel_store(
    session: AsyncSession = Depends(get_session),
) -> CarouselStore:
    return CarouselStore(session)

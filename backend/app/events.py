import uuid
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Event


async def track_event(
    session: AsyncSession,
    event_type: str,
    user_id: uuid.UUID | None = None,
    carousel_id: uuid.UUID | None = None,
    metadata: dict | None = None,
):
    event = Event(
        event_type=event_type,
        user_id=user_id,
        carousel_id=carousel_id,
        metadata_=metadata,
    )
    session.add(event)
    await session.commit()

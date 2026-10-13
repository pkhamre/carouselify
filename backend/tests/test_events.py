from sqlalchemy import func, select

from app.events import track_event
from app.models import Event, User


async def test_track_event_does_not_commit_pending(session, make_user):
    user = make_user()
    session.add(user)
    await track_event(session, "test_event", user_id=user.id)

    # track_event must not have flushed the caller's pending insert: rollback discards it
    await session.rollback()
    count = await session.scalar(select(func.count(User.id)))
    assert count == 0


async def test_track_event_persists_with_explicit_commit(session, make_user):
    user = make_user()
    session.add(user)
    await session.commit()

    await track_event(session, "test_event", user_id=user.id)
    await session.commit()

    n = await session.scalar(
        select(func.count(Event.id)).where(Event.event_type == "test_event")
    )
    assert n == 1

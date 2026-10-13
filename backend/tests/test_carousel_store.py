import uuid

from app.carousel_store import CarouselStore
from app.models import Carousel


async def test_get_owned_returns_row_for_owner(session_maker, make_user):
    async with session_maker() as s:
        owner = make_user()
        other = make_user()
        s.add_all([owner, other])
        await s.commit()
        await s.refresh(owner)
        await s.refresh(other)

        carousel = Carousel(user_id=owner.id, title="Mine", data={"slides": []})
        s.add(carousel)
        await s.commit()
        await s.refresh(carousel)

        store = CarouselStore(s)
        assert await store.get_owned(carousel.id, owner.id) is carousel
        assert await store.get_owned(carousel.id, other.id) is None
        assert await store.get_owned(uuid.uuid4(), owner.id) is None

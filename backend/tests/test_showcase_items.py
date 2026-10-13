import uuid

from app.models import Carousel, CarouselLike
from app.showcase_items import list_showcase_items


async def _carousel(s, user_id, title, showcased, share_token):
    c = Carousel(
        user_id=user_id,
        title=title,
        data={"slides": [{"type": "cover"}, {"type": "cta"}]},
        showcased=showcased,
        share_token=share_token,
        is_public=bool(share_token),
    )
    s.add(c)
    await s.commit()
    await s.refresh(c)
    return c


async def test_public_listing_shapes_items(session_maker, make_user):
    async with session_maker() as s:
        user = make_user()
        s.add(user)
        await s.commit()
        await s.refresh(user)

        public = await _carousel(s, user.id, "Public", True, uuid.uuid4())
        unshared = await _carousel(s, user.id, "Unshared", True, None)
        not_showcased = await _carousel(s, user.id, "Hidden", False, uuid.uuid4())

        # 3 likes on `public`, 1 on `unshared`
        for liker in (make_user(), make_user(), make_user()):
            s.add(liker)
            await s.commit()
            await s.refresh(liker)
            s.add(CarouselLike(carousel_id=public.id, user_id=liker.id))
        await s.commit()

        items = await list_showcase_items(s)
        titles = {i.title for i in items}
        assert titles == {"Public"}
        (item,) = items
        assert item.slide_count == 2
        assert item.like_count == 3

        all_items = await list_showcase_items(s, include_unshared=True)
        by_title = {i.title: i for i in all_items}
        assert set(by_title) == {"Public", "Unshared"}
        assert by_title["Unshared"].like_count == 0

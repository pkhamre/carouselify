import random
import string
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import JSONResponse
from fastapi_users.password import PasswordHelper
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.limiter import limiter
from app.models import Carousel, CarouselLike, User
from app.schemas import CarouselCreate, CarouselOut, CarouselListItem, CarouselUpdate, GuestResponse, LikeResponse, LinkGuestRequest, PublishShowcaseRequest, ShareResponse
from app.users import current_active_user, get_jwt_strategy, optional_active_user, transport
from app.events import track_event

router = APIRouter(prefix="/api/carousels", tags=["carousels"])


@router.post("", response_model=CarouselOut, status_code=status.HTTP_201_CREATED)
async def create_carousel(
    data: CarouselCreate,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_session),
):
    carousel = Carousel(
        user_id=user.id,
        title=data.title,
        data=data.data,
    )
    session.add(carousel)
    await session.commit()
    await session.refresh(carousel)
    await track_event(session, "carousel_created", user_id=user.id, carousel_id=carousel.id)
    return carousel


@router.get("", response_model=list[CarouselListItem])
async def list_carousels(
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(
        select(Carousel).where(Carousel.user_id == user.id).order_by(Carousel.updated_at.desc())
    )
    return result.scalars().all()


@router.get("/{carousel_id}", response_model=CarouselOut)
async def get_carousel(
    carousel_id: uuid.UUID,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(
        select(Carousel).where(Carousel.id == carousel_id, Carousel.user_id == user.id)
    )
    carousel = result.scalar_one_or_none()
    if not carousel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Carousel not found")
    return carousel


@router.put("/{carousel_id}", response_model=CarouselOut)
async def update_carousel(
    carousel_id: uuid.UUID,
    data: CarouselUpdate,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(
        select(Carousel).where(Carousel.id == carousel_id, Carousel.user_id == user.id)
    )
    carousel = result.scalar_one_or_none()
    if not carousel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Carousel not found")
    if data.title is not None:
        carousel.title = data.title
    if data.data is not None:
        carousel.data = data.data
    await session.commit()
    await session.refresh(carousel)
    return carousel


@router.delete("/{carousel_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_carousel(
    carousel_id: uuid.UUID,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(
        select(Carousel).where(Carousel.id == carousel_id, Carousel.user_id == user.id)
    )
    carousel = result.scalar_one_or_none()
    if not carousel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Carousel not found")
    await session.delete(carousel)
    await session.commit()


@router.post("/{carousel_id}/share", response_model=ShareResponse)
async def share_carousel(
    carousel_id: uuid.UUID,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(
        select(Carousel).where(Carousel.id == carousel_id, Carousel.user_id == user.id)
    )
    carousel = result.scalar_one_or_none()
    if not carousel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Carousel not found")
    carousel.share_token = uuid.uuid4()
    carousel.is_public = True
    await session.commit()
    await session.refresh(carousel)
    await track_event(session, "carousel_shared", user_id=user.id, carousel_id=carousel.id)
    return ShareResponse(url=f"/showcase/{carousel.share_token}", share_token=carousel.share_token)


@router.delete("/{carousel_id}/share", status_code=status.HTTP_204_NO_CONTENT)
async def revoke_share(
    carousel_id: uuid.UUID,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(
        select(Carousel).where(Carousel.id == carousel_id, Carousel.user_id == user.id)
    )
    carousel = result.scalar_one_or_none()
    if not carousel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Carousel not found")
    carousel.share_token = None
    carousel.is_public = False
    await session.commit()
    await track_event(session, "carousel_unshared", user_id=user.id, carousel_id=carousel.id)


@router.post("/{carousel_id}/publish-showcase", response_model=CarouselOut)
async def publish_showcase(
    carousel_id: uuid.UUID,
    body: PublishShowcaseRequest,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(
        select(Carousel).where(Carousel.id == carousel_id, Carousel.user_id == user.id)
    )
    carousel = result.scalar_one_or_none()
    if not carousel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Carousel not found")
    if not carousel.share_token:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Carousel must be shared before publishing to showcase")
    carousel.showcased = True
    carousel.showcase_author = body.author
    await session.commit()
    await session.refresh(carousel)
    await track_event(session, "carousel_published_showcase", user_id=user.id, carousel_id=carousel.id)
    return carousel


@router.post("/{carousel_id}/unpublish-showcase", response_model=CarouselOut)
async def unpublish_showcase(
    carousel_id: uuid.UUID,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(
        select(Carousel).where(Carousel.id == carousel_id, Carousel.user_id == user.id)
    )
    carousel = result.scalar_one_or_none()
    if not carousel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Carousel not found")
    carousel.showcased = False
    carousel.showcase_author = None
    await session.commit()
    await session.refresh(carousel)
    await track_event(session, "carousel_unpublished_showcase", user_id=user.id, carousel_id=carousel.id)
    return carousel


@router.get("/{carousel_id}/likes", response_model=LikeResponse)
async def get_likes(
    carousel_id: uuid.UUID,
    user: User | None = Depends(optional_active_user),
    session: AsyncSession = Depends(get_session),
):
    count_result = await session.execute(
        select(func.count(CarouselLike.id)).where(CarouselLike.carousel_id == carousel_id)
    )
    like_count = count_result.scalar() or 0

    liked = False
    if user:
        like_result = await session.execute(
            select(CarouselLike).where(
                CarouselLike.carousel_id == carousel_id,
                CarouselLike.user_id == user.id,
            )
        )
        liked = like_result.scalar_one_or_none() is not None

    return LikeResponse(liked=liked, like_count=like_count)


@router.post("/{carousel_id}/like", response_model=LikeResponse)
async def toggle_like(
    carousel_id: uuid.UUID,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(
        select(CarouselLike).where(
            CarouselLike.carousel_id == carousel_id,
            CarouselLike.user_id == user.id,
        )
    )
    existing = result.scalar_one_or_none()

    if existing:
        await session.delete(existing)
        await session.commit()
        liked = False
    else:
        like = CarouselLike(carousel_id=carousel_id, user_id=user.id)
        session.add(like)
        await session.commit()
        liked = True

    count_result = await session.execute(
        select(func.count(CarouselLike.id)).where(CarouselLike.carousel_id == carousel_id)
    )
    like_count = count_result.scalar() or 0

    return LikeResponse(liked=liked, like_count=like_count)


guest_router = APIRouter(prefix="/auth", tags=["auth"])


@guest_router.post("/guest")
@limiter.limit("10/hour")
async def create_guest(
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    pw_helper = PasswordHelper()
    random_pw = "".join(random.choices(string.ascii_letters + string.digits, k=32))
    guest_email = f"guest-{uuid.uuid4()}@carouselify.local"

    user = User(
        id=uuid.uuid4(),
        email=guest_email,
        hashed_password=pw_helper.hash(random_pw),
        is_active=True,
        is_superuser=False,
        is_verified=False,
        is_guest=True,
    )
    session.add(user)
    await session.commit()

    strategy = get_jwt_strategy()
    token = await strategy.write_token(user)

    content = {"access_token": token, "token_type": "bearer", "user_id": str(user.id)}
    response = JSONResponse(content=content)
    await transport.get_login_response(token, response)
    return response


@guest_router.post("/link-guest")
async def link_guest(
    body: LinkGuestRequest,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_session),
):
    guest_id = uuid.UUID(body.guest_user_id)
    if guest_id == user.id:
        raise HTTPException(400, detail="Cannot link to self")

    result = await session.execute(
        select(Carousel).where(Carousel.user_id == guest_id)
    )
    guest_carousels = result.scalars().all()
    for c in guest_carousels:
        c.user_id = user.id

    guest = await session.get(User, guest_id)
    if guest:
        await session.delete(guest)

    await session.commit()
    return {"transferred": len(guest_carousels)}


public_router = APIRouter(prefix="/api/s", tags=["public"])


@public_router.get("/{share_token}", response_model=CarouselOut)
async def get_shared_carousel(
    share_token: uuid.UUID,
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(
        select(Carousel).where(Carousel.share_token == share_token, Carousel.is_public == True)
    )
    carousel = result.scalar_one_or_none()
    if not carousel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shared carousel not found")
    await track_event(session, "carousel_viewed", carousel_id=carousel.id)
    return carousel

import random
import string
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi_users.password import PasswordHelper
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.models import Carousel, User
from app.schemas import CarouselCreate, CarouselOut, CarouselListItem, CarouselUpdate, GuestResponse, LinkGuestRequest, ShareResponse, ShowcaseSubmitRequest
from app.users import current_active_user, get_jwt_strategy
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


@router.post("/{carousel_id}/submit-showcase", response_model=CarouselOut)
async def submit_showcase(
    carousel_id: uuid.UUID,
    body: ShowcaseSubmitRequest,
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
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Carousel must be shared before submitting to showcase")
    carousel.showcase_submitted = datetime.now(timezone.utc)
    carousel.showcase_author = body.author
    carousel.showcased = False
    await session.commit()
    await session.refresh(carousel)
    await track_event(session, "carousel_submitted_showcase", user_id=user.id, carousel_id=carousel.id)
    return carousel


guest_router = APIRouter(prefix="/auth", tags=["auth"])


@guest_router.post("/guest", response_model=GuestResponse)
async def create_guest(
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

    return GuestResponse(access_token=token, user_id=str(user.id))


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

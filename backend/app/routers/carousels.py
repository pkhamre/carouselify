import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.models import Carousel, User
from app.schemas import CarouselCreate, CarouselOut, CarouselListItem, CarouselUpdate, ShareResponse
from app.users import current_active_user

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
    return ShareResponse(url=f"/s/{carousel.share_token}", share_token=carousel.share_token)


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
    return carousel

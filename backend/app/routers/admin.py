import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.models import Carousel, Event, User
from app.schemas import StatsResponse, TrackEventRequest, ShowcaseListItem
from app.users import current_active_user, require_admin
from app.events import track_event

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/stats", response_model=StatsResponse)
async def get_stats(
    user: User = Depends(require_admin),
    session: AsyncSession = Depends(get_session),
):
    now = datetime.now(timezone.utc)

    user_total = await session.scalar(select(func.count(User.id))) or 0
    user_registered = await session.scalar(select(func.count(User.id)).where(User.is_guest == False)) or 0
    user_guests = await session.scalar(select(func.count(User.id)).where(User.is_guest == True)) or 0
    user_premium = await session.scalar(select(func.count(User.id)).where(User.is_premium == True)) or 0

    car_total = await session.scalar(select(func.count(Carousel.id))) or 0
    car_shared = await session.scalar(select(func.count(Carousel.id)).where(Carousel.share_token.isnot(None))) or 0
    car_this_month = await session.scalar(
        select(func.count(Carousel.id)).where(
            Carousel.created_at >= now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        )
    ) or 0

    data_rows = await session.execute(select(Carousel.data))
    slide_counts = []
    for (data,) in data_rows:
        slides = data.get("slides", []) if data else []
        if slides:
            slide_counts.append(len(slides))
    avg_slides = round(sum(slide_counts) / len(slide_counts), 1) if slide_counts else 0

    ai_total = await session.scalar(
        select(func.count(Event.id)).where(Event.event_type == "ai_generated")
    ) or 0
    ai_credits = await session.scalar(select(func.sum(User.ai_credits_used))) or 0

    views_total = await session.scalar(
        select(func.count(Event.id)).where(Event.event_type == "carousel_viewed")
    ) or 0
    views_this_month = await session.scalar(
        select(func.count(Event.id)).where(
            Event.event_type == "carousel_viewed",
            Event.created_at >= now.replace(day=1, hour=0, minute=0, second=0, microsecond=0),
        )
    ) or 0
    exports_total = await session.scalar(
        select(func.count(Event.id)).where(Event.event_type == "carousel_exported")
    ) or 0
    exports_this_month = await session.scalar(
        select(func.count(Event.id)).where(
            Event.event_type == "carousel_exported",
            Event.created_at >= now.replace(day=1, hour=0, minute=0, second=0, microsecond=0),
        )
    ) or 0

    pending_submissions = await session.scalar(
        select(func.count(Carousel.id)).where(
            Carousel.showcase_submitted.isnot(None),
            Carousel.showcased == False,
        )
    ) or 0

    return StatsResponse(
        users={
            "total": user_total,
            "registered": user_registered,
            "guests": user_guests,
            "premium": user_premium,
            "this_month": 0,
        },
        carousels={
            "total": car_total,
            "shared": car_shared,
            "this_month": car_this_month,
            "avg_slides": avg_slides,
        },
        ai={
            "total_generations": ai_total,
            "total_credits_used": ai_credits,
        },
        events={
            "total_views": views_total,
            "views_this_month": views_this_month,
            "total_exports": exports_total,
            "exports_this_month": exports_this_month,
        },
        showcase={
            "pending_submissions": pending_submissions,
        },
    )


@router.post("/showcase/{carousel_id}/approve", response_model=ShowcaseListItem)
async def approve_showcase(
    carousel_id: uuid.UUID,
    user: User = Depends(require_admin),
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(select(Carousel).where(Carousel.id == carousel_id))
    carousel = result.scalar_one_or_none()
    if not carousel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Carousel not found")
    carousel.showcased = True
    await session.commit()
    await session.refresh(carousel)
    slides = carousel.data.get("slides", []) if carousel.data else []
    return ShowcaseListItem(
        id=carousel.id,
        title=carousel.title,
        showcase_author=carousel.showcase_author,
        share_token=carousel.share_token,
        created_at=carousel.created_at,
        slide_count=len(slides),
    )


@router.post("/showcase/{carousel_id}/reject", status_code=status.HTTP_200_OK)
async def reject_showcase(
    carousel_id: uuid.UUID,
    user: User = Depends(require_admin),
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(select(Carousel).where(Carousel.id == carousel_id))
    carousel = result.scalar_one_or_none()
    if not carousel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Carousel not found")
    carousel.showcased = False
    carousel.showcase_submitted = None
    carousel.showcase_author = None
    await session.commit()
    return {"ok": True}


@router.get("/showcase/pending", response_model=list[ShowcaseListItem])
async def list_pending_showcase(
    user: User = Depends(require_admin),
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(
        select(Carousel)
        .where(Carousel.showcase_submitted.isnot(None), Carousel.showcased == False)
        .order_by(Carousel.showcase_submitted.desc())
    )
    carousels = result.scalars().all()
    items = []
    for c in carousels:
        slides = c.data.get("slides", []) if c.data else []
        items.append(ShowcaseListItem(
            id=c.id,
            title=c.title,
            showcase_author=c.showcase_author,
            share_token=c.share_token,
            created_at=c.created_at,
            slide_count=len(slides),
        ))
    return items


track_public_router = APIRouter(prefix="/api/track", tags=["track"])


@track_public_router.post("/event", status_code=status.HTTP_201_CREATED)
async def track_client_event(
    body: TrackEventRequest,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_session),
):
    await track_event(
        session,
        event_type=body.event_type,
        user_id=user.id,
        carousel_id=body.carousel_id,
        metadata=body.metadata,
    )
    return {"ok": True}

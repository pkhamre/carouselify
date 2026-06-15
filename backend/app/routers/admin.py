import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.models import Carousel, Event, User
from app.schemas import StatsResponse, TrackEventRequest
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
    )


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

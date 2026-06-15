import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.limiter import limiter
from app.models import Carousel, CarouselLike, ContactMessage, Event, User
from app.schemas import ContactMessageCreate, ContactMessageOut, StatsResponse, TrackEventRequest, ShowcaseListItem
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

    total_likes = await session.scalar(
        select(func.count(CarouselLike.id))
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
            "total_likes": total_likes,
        },
    )


@router.get("/showcase/list", response_model=list[ShowcaseListItem])
async def list_showcased(
    user: User = Depends(require_admin),
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(
        select(Carousel)
        .where(Carousel.showcased == True)
        .order_by(Carousel.updated_at.desc())
    )
    carousels = result.scalars().all()
    items = []
    for c in carousels:
        slides = c.data.get("slides", []) if c.data else []
        like_count = await session.scalar(
            select(func.count(CarouselLike.id)).where(CarouselLike.carousel_id == c.id)
        ) or 0
        items.append(ShowcaseListItem(
            id=c.id,
            title=c.title,
            showcase_author=c.showcase_author,
            share_token=c.share_token,
            created_at=c.created_at,
            slide_count=len(slides),
            like_count=like_count,
        ))
    return items


@router.post("/showcase/{carousel_id}/remove", status_code=status.HTTP_200_OK)
async def remove_from_showcase(
    carousel_id: uuid.UUID,
    user: User = Depends(require_admin),
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(select(Carousel).where(Carousel.id == carousel_id))
    carousel = result.scalar_one_or_none()
    if not carousel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Carousel not found")
    carousel.showcased = False
    carousel.showcase_author = None
    await session.commit()
    return {"ok": True}


contact_public_router = APIRouter(prefix="/api", tags=["contact"])


@contact_public_router.post("/contact", response_model=ContactMessageOut, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/hour")
async def submit_contact(
    request: Request,
    body: ContactMessageCreate,
    session: AsyncSession = Depends(get_session),
):
    msg = ContactMessage(name=body.name, email=body.email, message=body.message)
    session.add(msg)
    await session.commit()
    await session.refresh(msg)
    return msg


@router.get("/contact-messages", response_model=list[ContactMessageOut])
async def list_contact_messages(
    user: User = Depends(require_admin),
    session: AsyncSession = Depends(get_session),
    include_archived: bool = False,
):
    query = select(ContactMessage)
    if not include_archived:
        query = query.where(ContactMessage.archived == False)
    query = query.order_by(ContactMessage.created_at.desc())
    result = await session.execute(query)
    return result.scalars().all()


@router.patch("/contact-messages/{message_id}/archive", response_model=ContactMessageOut)
async def toggle_archive_message(
    message_id: uuid.UUID,
    user: User = Depends(require_admin),
    session: AsyncSession = Depends(get_session),
):
    msg = await session.get(ContactMessage, message_id)
    if not msg:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message not found")
    msg.archived = not msg.archived
    await session.commit()
    await session.refresh(msg)
    return msg


@router.delete("/contact-messages/{message_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_contact_message(
    message_id: uuid.UUID,
    user: User = Depends(require_admin),
    session: AsyncSession = Depends(get_session),
):
    msg = await session.get(ContactMessage, message_id)
    if not msg:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message not found")
    await session.delete(msg)
    await session.commit()


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

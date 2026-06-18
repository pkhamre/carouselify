from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from polar_sdk import Polar
from polar_sdk.webhooks import validate_event, WebhookVerificationError, WebhookUnknownTypeError

from app.config import settings
from app.database import get_session
from app.models import User
from app.schemas import CheckoutRequest, CheckoutResponse, PortalResponse
from app.users import current_active_user
import json as _json
import uuid as _uuid
router = APIRouter(prefix="/api/billing", tags=["billing"])


@router.post("/checkout", response_model=CheckoutResponse)
async def create_checkout(
    data: CheckoutRequest,
    user: User = Depends(current_active_user),
):
    if not settings.subscriptions_enabled:
        raise HTTPException(503, detail="Subscriptions are temporarily unavailable")
    if not settings.polar_access_token or not settings.polar_product_id:
        raise HTTPException(502, detail="Polar.sh not configured")

    async with Polar(access_token=settings.polar_access_token, server=settings.polar_server) as polar:
        checkout = await polar.checkouts.create_async(request={
            "products": [settings.polar_product_id],
            "customer_email": user.email,
            "success_url": data.return_url,
            "external_customer_id": str(user.id),
        })
        return CheckoutResponse(url=checkout.url)


@router.post("/portal", response_model=PortalResponse)
async def create_portal(
    data: CheckoutRequest,
    user: User = Depends(current_active_user),
):
    if not settings.subscriptions_enabled:
        raise HTTPException(503, detail="Subscriptions are temporarily unavailable")
    if not settings.polar_access_token:
        raise HTTPException(502, detail="Polar.sh not configured")

    async with Polar(access_token=settings.polar_access_token, server=settings.polar_server) as polar:
        session = await polar.customer_sessions.create_async(request={
            "external_customer_id": str(user.id),
            "return_url": data.return_url,
        })
        return PortalResponse(url=session.customer_portal_url)


@router.post("/webhook", status_code=status.HTTP_202_ACCEPTED)
async def webhook_handler(
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    if not settings.polar_webhook_secret:
        raise HTTPException(502, detail="Polar.sh not configured")

    raw_body = await request.body()
    try:
        event = validate_event(
            body=raw_body,
            headers=dict(request.headers),
            secret=settings.polar_webhook_secret,
        )
    except (WebhookVerificationError, WebhookUnknownTypeError):
        raise HTTPException(401, detail="Invalid webhook signature")

    ev_type = _json.loads(raw_body)["type"]
    sub = event.data
    if not sub.customer or not sub.customer.external_id:
        print(f"[webhook] {ev_type}: no customer or external_id, skipping")
        return {"ok": True}

    user_id = _uuid.UUID(sub.customer.external_id)
    result = await session.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        print(f"[webhook] {ev_type}: user not found for external_id={sub.customer.external_id}")
        return {"ok": True}

    print(f"[webhook] {ev_type}: user={user.id} status={sub.status.value}")

    vals = {}

    if ev_type in ("subscription.created", "subscription.active"):
        vals["is_premium"] = True
        vals["polar_subscription_id"] = sub.id
        vals["polar_customer_id"] = sub.customer_id
        vals["polar_subscription_status"] = sub.status.value
        vals["polar_subscription_period_end"] = sub.current_period_end
        vals["polar_cancel_at_period_end"] = sub.cancel_at_period_end
        vals["ai_credits_used"] = 0
        vals["ai_credits_reset_at"] = sub.current_period_end

    elif ev_type == "subscription.updated":
        vals["polar_subscription_status"] = sub.status.value
        vals["polar_cancel_at_period_end"] = sub.cancel_at_period_end
        vals["polar_subscription_period_end"] = sub.current_period_end

    elif ev_type == "subscription.canceled":
        vals["is_premium"] = False
        vals["polar_subscription_status"] = "canceled"

    elif ev_type == "subscription.uncanceled":
        vals["polar_cancel_at_period_end"] = False
        vals["is_premium"] = True
        vals["polar_subscription_status"] = "active"

    elif ev_type == "subscription.revoked":
        vals["is_premium"] = False
        vals["polar_subscription_status"] = "revoked"

    if vals:
        await session.execute(update(User).where(User.id == user_id).values(**vals))
        await session.commit()
        print(f"[webhook] {ev_type}: updated {vals}")

    return {"ok": True}

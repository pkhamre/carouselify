import json
import hmac
import hashlib
import httpx
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_session
from app.models import User
from app.schemas import CheckoutRequest, CheckoutResponse, PortalResponse
from app.users import current_active_user

router = APIRouter(prefix="/api/billing", tags=["billing"])

LEMON_API = "https://api.lemonsqueezy.com/v1"


@router.post("/checkout", response_model=CheckoutResponse)
async def create_checkout(
    data: CheckoutRequest,
    user: User = Depends(current_active_user),
):
    if not settings.lemon_squeezy_api_key or not settings.lemon_squeezy_product_variant_id:
        raise HTTPException(502, detail="Lemon Squeezy not configured")
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{LEMON_API}/checkouts",
            headers={
                "Authorization": f"Bearer {settings.lemon_squeezy_api_key}",
                "Accept": "application/vnd.api+json",
                "Content-Type": "application/vnd.api+json",
            },
            json={
                "data": {
                    "type": "checkouts",
                    "attributes": {
                        "variant_id": int(settings.lemon_squeezy_product_variant_id),
                        "product_options": {
                            "enabled_variants": [int(settings.lemon_squeezy_product_variant_id)],
                            "redirect_url": data.return_url,
                        },
                        "checkout_data": {
                            "email": user.email,
                            "custom": {"user_id": str(user.id)},
                        },
                        "test_mode": True,
                    },
                    "relationships": {
                        "store": {
                            "data": {
                                "type": "stores",
                                "id": settings.lemon_squeezy_store_id,
                            },
                        },
                        "variant": {
                            "data": {
                                "type": "variants",
                                "id": str(int(settings.lemon_squeezy_product_variant_id)),
                            },
                        },
                    },
                }
            },
        )
        res = resp.json()
        if resp.status_code >= 400:
            err_msg = res.get("errors", [{"detail": "Unknown Lemon Squeezy error"}])[0].get("detail", "Unknown error")
            print(f"Lemon Squeezy checkout error ({resp.status_code}): {err_msg}")
            print(f"Full response: {json.dumps(res, indent=2)}")
            raise HTTPException(502, detail=err_msg)
        checkout_url = res["data"]["attributes"]["url"]
        return CheckoutResponse(url=checkout_url)


@router.post("/portal", response_model=PortalResponse)
async def create_portal(
    data: CheckoutRequest,
    user: User = Depends(current_active_user),
):
    if not settings.lemon_squeezy_api_key:
        raise HTTPException(502, detail="Lemon Squeezy not configured")
    if not user.lemon_squeezy_customer_id:
        raise HTTPException(400, detail="No subscription found")

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{LEMON_API}/customer-portal",
            headers={
                "Authorization": f"Bearer {settings.lemon_squeezy_api_key}",
                "Accept": "application/vnd.api+json",
                "Content-Type": "application/vnd.api+json",
            },
            json={
                "data": {
                    "type": "customer-portals",
                    "attributes": {
                        "customer_id": int(user.lemon_squeezy_customer_id),
                        "return_url": data.return_url,
                    },
                }
            },
        )
        res = resp.json()
        if resp.status_code >= 400:
            err_msg = res.get("errors", [{"detail": "Unknown Lemon Squeezy error"}])[0].get("detail", "Unknown error")
            print(f"Lemon Squeezy portal error ({resp.status_code}): {err_msg}")
            raise HTTPException(502, detail=err_msg)
        portal_url = res["data"]["attributes"]["url"]
        return PortalResponse(url=portal_url)


@router.post("/webhook")
async def webhook_handler(request: Request, session: AsyncSession = Depends(get_session)):
    if not settings.lemon_squeezy_webhook_secret:
        raise HTTPException(502, detail="Lemon Squeezy not configured")

    raw_body = await request.body()
    signature = request.headers.get("x-signature", "")

    computed = hmac.new(
        settings.lemon_squeezy_webhook_secret.encode(),
        raw_body,
        hashlib.sha256,
    ).hexdigest()

    if not hmac.compare_digest(signature, computed):
        raise HTTPException(401, detail="Invalid signature")

    payload = json.loads(raw_body)
    event_name = payload["meta"]["event_name"]
    custom_data = payload["meta"].get("custom_data", {})
    user_id = custom_data.get("user_id") if custom_data else None

    if not user_id:
        return {"ok": True}

    result = await session.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        return {"ok": True}

    if event_name == "subscription_created":
        sub_data = payload["data"]["attributes"]
        user.is_premium = True
        user.lemon_squeezy_customer_id = str(sub_data["customer_id"])
        user.lemon_squeezy_subscription_id = str(payload["data"]["id"])
        user.ai_credits_used = 0
        user.ai_credits_reset_at = sub_data.get("renews_at")
    elif event_name == "subscription_updated":
        user.is_premium = True
    elif event_name in ("subscription_cancelled", "subscription_expired"):
        user.is_premium = False

    await session.commit()
    return {"ok": True}

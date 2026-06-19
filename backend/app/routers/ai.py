import json
import re
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Request, status
from openai import AsyncOpenAI
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_session
from app.limiter import limiter
from app.models import User
from app.schemas import AiGenerateRequest, AiGenerateResponse, CreditsResponse
from app.users import current_active_user
from app.events import track_event

router = APIRouter(prefix="/api/ai", tags=["ai"])

INJECTION_PATTERNS = [
    r"ignore\s+(all\s+)?(previous\s+)?instructions",
    r"system\s+(prompt|message)",
    r"you\s+are\s+(now|not\s+required\s+to)",
    r"disregard",
    r"forget\s+(your\s+)?(instructions|prompt)",
]

CREDITS_PREMIUM = 50
CREDITS_REGISTERED = 5

def _build_system_prompt(slide_count: int) -> str:
    types = """1. cover: { "type": "cover", "h1": "...", "h2": "...", "caption": "..." }
   - h1: 2-6 words (headline)
   - h2: 2-6 words (punchline)
   - caption: 8-15 words (supporting context)

2. content-b1: { "type": "content-b1", "intro": "...", "h2": "...", "body": "..." }
   - intro: 3-8 words (hook)
   - h2: 2-5 words (bold statement)
   - body: 8-15 words (explanation)

3. content-b2: { "type": "content-b2", "h1": "...", "h2": "...", "body": "..." }
   - h1: 2-5 words (setup topic)
   - h2: 2-5 words (bold payoff)
   - body: 8-15 words (supporting text)

4. list: { "type": "list", "intro": "...", "h2": "...", "items": ["...", "...", "..."] }
   - intro: 3-8 words (context)
   - h2: 2-5 words (key insight)
   - items: exactly 3 items, each 2-6 words

5. cta: { "type": "cta", "h1": "...", "ctaText": "...", "body": "..." }
   - h1: 2-6 words (call to action heading)
   - ctaText: 2-4 words (button text)
   - body: 5-10 words (closing nudge)"""
    return f"""You generate carousel slides as a JSON object with a "slides" array.
Each slide must follow EXACTLY one of these 5 types:

{types}

Generate exactly {slide_count} slide(s). When generating 1 slide, use type "cover".
Keep ALL text short and punchy. No field may exceed 15 words."""


async def _deduct_credit(user: User, session: AsyncSession) -> tuple[int, int]:
    """Deduct one credit and return (deducted, remaining)."""
    now = datetime.now(timezone.utc).replace(tzinfo=None)

    if user.is_guest:
        user.ai_free_used = True
        await session.commit()
        return (0, 0)

    if user.is_premium:
        if user.ai_credits_reset_at and user.ai_credits_reset_at.replace(tzinfo=None) < now:
            user.ai_credits_used = 0
        used = user.ai_credits_used or 0
        user.ai_credits_used = used + 1
        remaining = max(0, CREDITS_PREMIUM - user.ai_credits_used)
        await session.commit()
        return (1, remaining)

    used = user.ai_credits_used or 0
    user.ai_credits_used = used + 1
    remaining = max(0, CREDITS_REGISTERED - user.ai_credits_used)
    await session.commit()
    return (1, remaining)


@router.get("/credits", response_model=CreditsResponse)
async def get_credits(
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_session),
):
    now = datetime.now(timezone.utc).replace(tzinfo=None)

    if user.is_guest:
        return CreditsResponse(
            used=1 if user.ai_free_used else 0,
            limit=1,
            remaining=0 if user.ai_free_used else 1,
            resets_at=None,
        )

    if user.is_premium:
        if user.ai_credits_reset_at and user.ai_credits_reset_at.replace(tzinfo=None) < now:
            user.ai_credits_used = 0
            await session.commit()
        limit = CREDITS_PREMIUM
    else:
        limit = CREDITS_REGISTERED

    used = user.ai_credits_used or 0
    remaining = max(0, limit - used)
    return CreditsResponse(
        used=used,
        limit=limit,
        remaining=remaining,
        resets_at=user.ai_credits_reset_at if user.is_premium else None,
    )


@router.post("/generate", response_model=AiGenerateResponse)
@limiter.limit("5/minute")
async def generate_slides(
    request: Request,
    body: AiGenerateRequest,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_session),
):
    now = datetime.now(timezone.utc).replace(tzinfo=None)

    # Credit check
    if user.is_guest:
        if user.ai_free_used:
            raise HTTPException(
                status.HTTP_402_PAYMENT_REQUIRED,
                detail="Create a free account to get 5 more AI credits",
            )
    elif user.is_premium:
        if user.ai_credits_reset_at and user.ai_credits_reset_at.replace(tzinfo=None) < now:
            user.ai_credits_used = 0
        if (user.ai_credits_used or 0) >= CREDITS_PREMIUM:
            raise HTTPException(status.HTTP_402_PAYMENT_REQUIRED, detail="Out of credits")
    else:
        if (user.ai_credits_used or 0) >= CREDITS_REGISTERED:
            raise HTTPException(
                status.HTTP_402_PAYMENT_REQUIRED,
                detail="Upgrade to Premium for 50 AI credits per month",
            )

    for pattern in INJECTION_PATTERNS:
        if re.search(pattern, body.prompt, re.IGNORECASE):
            raise HTTPException(status_code=400, detail="Prompt rejected")

    body.prompt = body.prompt.strip()[:2000]

    if not settings.openai_api_key:
        raise HTTPException(502, detail="OpenAI API key not configured")

    client = AsyncOpenAI(api_key=settings.openai_api_key)
    resp = await client.chat.completions.create(
        model=settings.openai_model,
        messages=[
            {"role": "system", "content": _build_system_prompt(body.slide_count)},
            {"role": "user", "content": f"Generate {body.slide_count} slide(s) about: {body.prompt}"},
        ],
        response_format={"type": "json_object"},
    )

    slides = []
    try:
        data = json.loads(resp.choices[0].message.content)
        slides = data.get("slides", data if isinstance(data, list) else [])
    except (json.JSONDecodeError, KeyError, TypeError):
        raise HTTPException(500, detail="AI response parsing failed")

    deduction, remaining = await _deduct_credit(user, session)
    await track_event(session, "ai_generated", user_id=user.id, metadata={"prompt": body.prompt[:100], "slide_count": len(slides)})

    return AiGenerateResponse(
        slides=slides,
        credits_used=deduction,
        credits_remaining=remaining,
    )

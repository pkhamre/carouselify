from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from openai import AsyncOpenAI
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_session
from app.models import User
from app.schemas import AiGenerateRequest, AiGenerateResponse, CreditsResponse
from app.users import current_active_user

router = APIRouter(prefix="/api/ai", tags=["ai"])

CREDITS_LIMIT = 50

SYSTEM_PROMPT = """You generate carousel slides as a JSON object with a "slides" array.
Each slide must follow EXACTLY one of these 5 types:

1. cover: { "type": "cover", "h1": "...", "h2": "...", "caption": "..." }
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
   - body: 5-10 words (closing nudge)

Generate exactly 5 slides, one of each type, in this order: cover, content-b1, content-b2, list, cta.
Keep ALL text short and punchy. No field may exceed 15 words."""


@router.get("/credits", response_model=CreditsResponse)
async def get_credits(
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_session),
):
    now = datetime.now(timezone.utc)
    if user.ai_credits_reset_at and user.ai_credits_reset_at < now:
        user.ai_credits_used = 0
        await session.commit()

    remaining = max(0, CREDITS_LIMIT - (user.ai_credits_used or 0))
    return CreditsResponse(
        used=user.ai_credits_used or 0,
        limit=CREDITS_LIMIT if user.is_premium else 0,
        remaining=remaining if user.is_premium else 0,
        resets_at=user.ai_credits_reset_at,
    )


@router.post("/generate", response_model=AiGenerateResponse)
async def generate_slides(
    body: AiGenerateRequest,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_session),
):
    if not user.is_premium:
        raise HTTPException(status.HTTP_402_PAYMENT_REQUIRED, detail="Premium required")

    now = datetime.now(timezone.utc)
    if user.ai_credits_reset_at and user.ai_credits_reset_at < now:
        user.ai_credits_used = 0

    used = user.ai_credits_used or 0
    if used >= CREDITS_LIMIT:
        raise HTTPException(402, detail="Out of credits")

    if not settings.openai_api_key:
        raise HTTPException(502, detail="OpenAI API key not configured")

    client = AsyncOpenAI(api_key=settings.openai_api_key)
    resp = await client.chat.completions.create(
        model=settings.openai_model,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"Generate slides about: {body.prompt}"},
        ],
        response_format={"type": "json_object"},
    )

    slides = []
    try:
        import json
        data = json.loads(resp.choices[0].message.content)
        slides = data.get("slides", data if isinstance(data, list) else [])
    except (json.JSONDecodeError, KeyError, TypeError):
        raise HTTPException(500, detail="AI response parsing failed")

    deduction = min(len(slides), CREDITS_LIMIT - used)
    user.ai_credits_used = used + deduction
    await session.commit()

    remaining = CREDITS_LIMIT - user.ai_credits_used
    return AiGenerateResponse(
        slides=slides,
        credits_used=deduction,
        credits_remaining=remaining,
    )

# Premium Features Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add subscription-based premium features (custom logo upload + AI slide generation) behind a Lemon Squeezy paywall.

**Architecture:** Backend additions: User model fields (`is_premium`, `lemon_squeezy_*`, `ai_credits_*`), billing endpoints (`/api/billing/*`), logo upload (`/api/upload/logo`), AI generation (`/api/ai/*`). Frontend additions: `UpgradePrompt`, custom logo upload UI in `LogoSettings`, AI generation dialog, credit badge. Premium gated via `Depends(premium_user)` on backend and `isPremium` checks on frontend.

**Tech Stack:** Lemon Squeezy API, OpenAI API, `httpx`, `python-multipart`, `openai`

---

## File Structure

| File | Action | Purpose |
|------|--------|---------|
| `backend/requirements.txt` | Modify | Add `openai`, `httpx` |
| `backend/app/models.py` | Modify | Add premium + credits fields to User |
| `backend/app/schemas.py` | Modify | Add billing/credits/upload/AI schemas |
| `backend/app/routers/billing.py` | Create | Checkout, portal, webhook endpoints |
| `backend/app/routers/upload.py` | Create | Logo upload endpoint |
| `backend/app/routers/ai.py` | Create | AI generation + credits endpoints |
| `backend/app/users.py` | Modify | Add `premium_user` dependency |
| `backend/app/main.py` | Modify | Mount uploads static dir, register new routers |
| `backend/app/config.py` | Modify | Add env vars for Lemon Squeezy + OpenAI |
| `frontend/src/lib/api.ts` | Modify | Add billing/credits/upload/AI functions |
| `frontend/src/lib/types.ts` | Modify | Extend `LogoConfig` with `customUrl`, `isCustom` |
| `frontend/src/components/UpgradePrompt.tsx` | Create | Paywall gate component |
| `frontend/src/components/LogoSettings.tsx` | Modify | Add custom upload UI for premium |
| `frontend/src/components/AiDialog.tsx` | Create | AI generation dialog |
| `frontend/src/components/slides/*/SlideCanvas.tsx` | Modify | Render custom logo URL |
| `frontend/src/app/page.tsx` | Modify | Integrate AiDialog, credit badge, LogoSetings upgrade |

---

### Task 1: Add backend dependencies + config

**Files:**
- Modify: `backend/requirements.txt`
- Modify: `backend/app/config.py`

- [ ] **Add to `backend/requirements.txt`:**
```
openai>=1.0.0
httpx>=0.27.0
```

- [ ] **Add env vars to `backend/app/config.py`:**
```python
lemon_squeezy_api_key: str = ""
lemon_squeezy_webhook_secret: str = ""
lemon_squeezy_product_variant_id: str = ""
openai_api_key: str = ""
```

- [ ] **Rebuild and verify:**
```bash
docker compose up --build -d backend
```

- [ ] **Commit**

---

### Task 2: Add premium + credits fields to User model

**Files:**
- Modify: `backend/app/models.py`

- [ ] **Add columns** after `is_guest`:
```python
is_premium = Column(Boolean, default=False, nullable=False)
lemon_squeezy_customer_id = Column(String, nullable=True, index=True)
lemon_squeezy_subscription_id = Column(String, nullable=True)
ai_credits_used = Column(Integer, default=0, nullable=False)
ai_credits_reset_at = Column(DateTime(timezone=True), nullable=True)
```

- [ ] **Drop and recreate postgres volume:**
```bash
docker compose down -v && docker compose up --build -d
```

- [ ] **Commit**

---

### Task 3: Add schemas for billing, upload, AI

**Files:**
- Modify: `backend/app/schemas.py`

- [ ] **Add schemas** after existing ones:
```python
class CheckoutRequest(BaseModel):
    return_url: str

class CheckoutResponse(BaseModel):
    url: str

class PortalResponse(BaseModel):
    url: str

class CreditsResponse(BaseModel):
    used: int
    limit: int
    remaining: int
    resets_at: datetime | None

class AiGenerateRequest(BaseModel):
    prompt: str
    slide_count: int = 5

class AiGenerateResponse(BaseModel):
    slides: list
    credits_used: int
    credits_remaining: int
```

- [ ] **Commit**

---

### Task 4: Create billing router (checkout, portal, webhook)

**Files:**
- Create: `backend/app/routers/billing.py`

- [ ] **Create file** with three endpoints:

```python
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
    body: CheckoutRequest,
    user: User = Depends(current_active_user),
):
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{LEMON_API}/checkouts",
            headers={
                "Authorization": f"Bearer {settings.lemon_squeezy_api_key}",
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
            json={
                "data": {
                    "type": "checkouts",
                    "attributes": {
                        "product_variant_id": settings.lemon_squeezy_product_variant_id,
                        "custom_price": None,
                        "product_options": {
                            "enabled_variants": [settings.lemon_squeezy_product_variant_id],
                        },
                        "checkout_data": {
                            "email": user.email,
                            "custom": {"user_id": str(user.id)},
                        },
                    },
                }
            },
        )
        data = resp.json()
        checkout_url = data["data"]["attributes"]["url"]
        return CheckoutResponse(url=checkout_url)


@router.post("/portal", response_model=PortalResponse)
async def create_portal(
    body: CheckoutRequest,
    user: User = Depends(current_active_user),
):
    if not user.lemon_squeezy_customer_id:
        raise HTTPException(400, detail="No subscription found")

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{LEMON_API}/customer-portal",
            headers={
                "Authorization": f"Bearer {settings.lemon_squeezy_api_key}",
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
            json={
                "data": {
                    "type": "customer-portals",
                    "attributes": {
                        "customer_id": int(user.lemon_squeezy_customer_id),
                        "return_url": body.return_url,
                    },
                }
            },
        )
        data = resp.json()
        portal_url = data["data"]["attributes"]["url"]
        return PortalResponse(url=portal_url)


@router.post("/webhook")
async def webhook_handler(request: Request, session: AsyncSession = Depends(get_session)):
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
        user.lemon_squeezy_subscription_id = str(sub_data["id"])
        user.ai_credits_used = 0
        user.ai_credits_reset_at = sub_data.get("renews_at")
    elif event_name == "subscription_updated":
        user.is_premium = True
    elif event_name in ("subscription_cancelled", "subscription_expired"):
        user.is_premium = False

    await session.commit()
    return {"ok": True}
```

- [ ] **Commit**

---

### Task 5: Create upload router

**Files:**
- Create: `backend/app/routers/upload.py`

- [ ] **Create file:**

```python
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from app.models import User
from app.users import current_active_user

router = APIRouter(prefix="/api/upload", tags=["upload"])

ALLOWED_TYPES = {"image/png", "image/jpeg", "image/webp", "image/gif"}
MAX_SIZE = 2 * 1024 * 1024  # 2MB


@router.post("/logo")
async def upload_logo(
    file: UploadFile = File(...),
    user: User = Depends(current_active_user),
):
    if not user.is_premium:
        raise HTTPException(status.HTTP_402_PAYMENT_REQUIRED, detail="Premium required")

    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(400, detail="Only PNG, JPEG, WebP, GIF allowed")

    contents = await file.read()
    if len(contents) > MAX_SIZE:
        raise HTTPException(400, detail="File too large (max 2MB)")

    ext = file.filename.rsplit(".", 1)[-1] if "." in file.filename else "png"
    filename = f"{user.id}-{uuid.uuid4()}.{ext}"

    upload_dir = Path("uploads/logos")
    upload_dir.mkdir(parents=True, exist_ok=True)

    (upload_dir / filename).write_bytes(contents)

    url = f"/uploads/logos/{filename}"
    return {"url": url}
```

- [ ] **Commit**

---

### Task 6: Create AI router

**Files:**
- Create: `backend/app/routers/ai.py`

- [ ] **Create file:**

```python
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
client = AsyncOpenAI(api_key=settings.openai_api_key)

CREDITS_LIMIT = 50

SYSTEM_PROMPT = """You generate carousel slides in JSON format.
Each slide has a type (cover, content-b1, content-b2, list, cta) and fields.
Cover: title, subtitle.
ContentB1: title, body.
ContentB2: title, leftBody, rightBody.
List: title, items (array of strings).
Cta: title, buttonLabel.
Return a JSON array of slide objects."""


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

    resp = await client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"Generate {body.slide_count} slides about: {body.prompt}"},
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
```

- [ ] **Commit**

---

### Task 7: Add premium_user dependency

**Files:**
- Modify: `backend/app/users.py`

- [ ] **Add** after `current_active_user`:
```python
from fastapi import HTTPException, status

premium_user = fastapi_users.current_user(active=True)

async def require_premium(user: User = Depends(premium_user)):
    if not user.is_premium:
        raise HTTPException(status.HTTP_402_PAYMENT_REQUIRED, detail="Premium subscription required")
    return user
```

- [ ] **Commit**

---

### Task 8: Update main.py — mount uploads + register routers

**Files:**
- Modify: `backend/app/main.py`

- [ ] **Add imports:**
```python
from pathlib import Path
from fastapi.staticfiles import StaticFiles
from app.routers.billing import router as billing_router
from app.routers.upload import router as upload_router
from app.routers.ai import router as ai_router
```

- [ ] **Add after app creation:**
```python
uploads_dir = Path("uploads/logos")
uploads_dir.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
```

- [ ] **Add router includes:**
```python
app.include_router(billing_router)
app.include_router(upload_router)
app.include_router(ai_router)
```

- [ ] **Commit**

---

### Task 9: Frontend — update types + API client

**Files:**
- Modify: `frontend/src/lib/types.ts`
- Modify: `frontend/src/lib/api.ts`

- [ ] **Extend `LogoConfig` in `frontend/src/lib/types.ts`:**
```typescript
export interface LogoConfig {
  showLogo: boolean;
  blobShape: number;
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  customUrl?: string | null;
  isCustom?: boolean;
}
```

- [ ] **Add to `frontend/src/lib/api.ts`:**
```typescript
export function createCheckout(returnUrl: string): Promise<{ url: string }> {
  return request("/api/billing/checkout", {
    method: "POST",
    body: JSON.stringify({ return_url: returnUrl }),
  });
}

export function createPortal(returnUrl: string): Promise<{ url: string }> {
  return request("/api/billing/portal", {
    method: "POST",
    body: JSON.stringify({ return_url: returnUrl }),
  });
}

export function uploadLogo(file: File): Promise<{ url: string }> {
  const form = new FormData();
  form.append("file", file);
  return request("/api/upload/logo", { method: "POST", body: form });
}

export function getCredits(): Promise<{ used: number; limit: number; remaining: number; resets_at: string | null }> {
  return request("/api/ai/credits");
}

export function generateSlides(prompt: string, slideCount: number): Promise<{ slides: any[]; credits_used: number; credits_remaining: number }> {
  return request("/api/ai/generate", {
    method: "POST",
    body: JSON.stringify({ prompt, slide_count: slideCount }),
  });
}
```

- [ ] **Commit**

---

### Task 10: Create UpgradePrompt component

**Files:**
- Create: `frontend/src/components/UpgradePrompt.tsx`

- [ ] **Create file:**
```typescript
"use client";

import { useState } from "react";
import { createCheckout } from "@/lib/api";

interface UpgradePromptProps {
  feature: string;
  compact?: boolean;
}

export function UpgradePrompt({ feature, compact }: UpgradePromptProps) {
  const [busy, setBusy] = useState(false);

  const handleUpgrade = async () => {
    setBusy(true);
    try {
      const res = await createCheckout(window.location.origin);
      window.location.href = res.url;
    } catch {}
    setBusy(false);
  };

  if (compact) {
    return (
      <button
        onClick={handleUpgrade}
        disabled={busy}
        className="text-xs text-sky-600 hover:text-sky-700 underline"
      >
        Upgrade to Premium
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-6 text-center">
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
        {feature} is a premium feature
      </p>
      <button
        onClick={handleUpgrade}
        disabled={busy}
        className="px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors disabled:opacity-50"
      >
        {busy ? "Redirecting..." : "Upgrade to Premium"}
      </button>
    </div>
  );
}
```

- [ ] **Commit**

---

### Task 11: Update LogoSettings with custom upload UI

**Files:**
- Modify: `frontend/src/components/LogoSettings.tsx`

- [ ] **Read current file** to understand structure, then add:
- Import `useAuth`, `uploadLogo`, `UpgradePrompt`
- Add state: `uploadBusy`, `uploadError`
- Add a "Custom" button/tab alongside blob shapes (only when `isPremium`)
- File input: `<input type="file" accept="image/*" onChange={handleUpload} />`
- Preview: when `isCustom`, show `<img>` instead of current logo display
- Non-premium users see `UpgradePrompt` in the custom tab area

- [ ] **Commit**

---

### Task 12: Update slide components to render custom logo

**Files:**
- Modify: `frontend/src/components/slides/SlideCanvas.tsx`

- [ ] **In the logo rendering block**, change from always rendering blob SVG:
```typescript
{logo.showLogo && (
  <div className={`slide-logo slide-logo-${logo.position}`}>
    {logo.isCustom && logo.customUrl ? (
      <img src={logo.customUrl} alt="Logo" className="h-10 w-auto object-contain" />
    ) : (
      // existing blob SVG rendering
    )}
  </div>
)}
```

- [ ] **Commit**

---

### Task 13: Create AiDialog component

**Files:**
- Create: `frontend/src/components/AiDialog.tsx`

- [ ] **Create file:**
```typescript
"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { generateSlides, getCredits } from "@/lib/api";
import { UpgradePrompt } from "./UpgradePrompt";

interface AiDialogProps {
  open: boolean;
  onClose: () => void;
  onGenerate: (slides: any[]) => void;
}

export function AiDialog({ open, onClose, onGenerate }: AiDialogProps) {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [count, setCount] = useState(5);
  const [busy, setBusy] = useState(false);
  const [credits, setCredits] = useState<{ used: number; remaining: number } | null>(null);

  useState(() => {
    if (open) getCredits().then(setCredits).catch(() => {});
  });

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setBusy(true);
    try {
      const res = await generateSlides(prompt, count);
      onGenerate(res.slides);
      setCredits({ used: credits?.used ?? 0 + res.credits_used, remaining: res.credits_remaining });
      onClose();
    } catch (e: any) {
      alert(e.message);
    }
    setBusy(false);
  };

  if (!open) return null;

  if (!user?.isPremium) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
          <UpgradePrompt feature="AI content generation" />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-md w-full mx-4 space-y-4" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Generate with AI
        </h2>
        {credits && (
          <p className="text-xs text-gray-500">
            {credits.remaining} / 50 credits remaining
          </p>
        )}
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your presentation..."
          rows={4}
          className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 resize-none"
        />
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 dark:text-gray-400">Slides:</label>
          <input
            type="range"
            min={3}
            max={10}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="flex-1"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300 w-6 text-right">{count}</span>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={busy || !prompt.trim()}
            className="px-4 py-2 text-sm bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50 transition-colors"
          >
            {busy ? "Generating..." : "Generate"}
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Commit**

---

### Task 14: Integrate AiDialog + credits into page.tsx

**Files:**
- Modify: `frontend/src/app/page.tsx`

- [ ] **Import**: `AiDialog`, `getCredits`
- [ ] **Add state**: `showAiDialog`, `credits` (fetched on mount + on save for premium users)
- [ ] **Add "Generate with AI" button** in desktop toolbar and mobile preview tab, with credit counter
- [ ] **Add `<AiDialog>`** wired to `handleLoadCarousel`-style callback that sets slides
- [ ] **Add credit badge** in header area when authenticated

- [ ] **Commit**

---

### Task 15: Build and verify

- [ ] **Build:**
```bash
docker compose up --build -d backend
docker compose up --build -d frontend
```

- [ ] **Check backend health:** `curl localhost:8000/health` → `{"status":"ok"}`
- [ ] **Check premium endpoints return 401 without auth**
- [ ] **Check premium endpoints return 402 for non-premium users**
- [ ] **Check frontend build:** `npm run build` in `frontend/`
- [ ] **Commit**

---

## Spec Coverage

| Spec Requirement | Task |
|-----------------|------|
| User model: is_premium, lemon_squeezy_*, ai_credits_* | Task 2 |
| Billing checkout endpoint | Task 4 |
| Billing portal endpoint | Task 4 |
| Billing webhook | Task 4 |
| Lemon Squeezy API client | Task 4 (httpx inline) |
| Webhook signature verification | Task 4 |
| Logo upload endpoint (premium-only) | Task 5 |
| Upload validation (types, size) | Task 5 |
| AI generate endpoint (premium-only) | Task 6 |
| Credits endpoint + auto-reset | Task 6 |
| OpenAI integration | Task 6 |
| Premium dependency guard | Task 7 |
| Mount uploads + register routers | Task 8 |
| Frontend types + API client | Task 9 |
| UpgradePrompt component | Task 10 |
| LogoSettings custom upload | Task 11 |
| Slide logo rendering (custom URL) | Task 12 |
| AiDialog component | Task 13 |
| page.tsx integration | Task 14 |
| Build and verify | Task 15 |

# Premium Features — Design Specification

**Date:** 2026-06-14
**Status:** Approved

## Overview

Add subscription-based premium features behind a paywall using Lemon Squeezy for payments and OpenAI for AI content generation.

## Architecture

```
Frontend ──→ Backend API ──→ Lemon Squeezy (checkout/portal/webhooks)
                            ──→ OpenAI (content generation)
                            ──→ Local file storage (logo uploads)
```

- **Payments:** [Lemon Squeezy](https://lemonsqueezy.com) — checkout, customer portal, webhooks
- **AI:** OpenAI API (GPT-4o-mini for slide generation)
- **Storage:** Backend filesystem via `StaticFiles` mount for logo uploads
- **Premium gating:** `is_premium` field on `User` model, checked via `Depends(premium_user)` middleware

## Data Model

### User additions (existing model)

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| `is_premium` | Boolean | `False` | Set by webhook |
| `lemon_squeezy_customer_id` | String \| None | `None` | Lemon Squeezy customer ID |
| `lemon_squeezy_subscription_id` | String \| None | `None` | Lemon Squeezy subscription ID |
| `ai_credits_used` | Integer | `0` | Monthly counter |
| `ai_credits_reset_at` | DateTime \| None | `None` | When credits reset |

### LogoConfig additions (frontend type)

| Field | Type | Notes |
|-------|------|-------|
| `customUrl` | string \| null | Uploaded logo URL |
| `isCustom` | boolean | True when using custom upload |

## API Endpoints

### Billing

#### `POST /api/billing/checkout`
- Auth: required
- Body: `{ "returnUrl": string }`
- Creates Lemon Squeezy checkout session for a predefined product variant
- Returns: `{ "url": string }` — redirect user here

#### `POST /api/billing/portal`
- Auth: required
- Body: `{ "returnUrl": string }`
- Creates Lemon Squeezy customer portal session
- Returns: `{ "url": string }`
- 400 if user has no customer ID

#### `POST /api/billing/webhook`
- Auth: none (signed by Lemon Squeezy secret)
- Receives: `subscription_created`, `subscription_updated`, `subscription_cancelled`, `subscription_expired`
- Sets `is_premium` + `lemon_squeezy_*` fields
- On first subscription_created: sets `ai_credits_reset_at` to end of month

### Upload

#### `POST /api/upload/logo`
- Auth: required, premium only
- Accepts: `multipart/form-data` with `file` field (image, max 2MB)
- Saves to `backend/uploads/logos/{user_id}-{uuid}.{ext}`
- Returns: `{ "url": string }`

### AI Generation

#### `POST /api/ai/generate`
- Auth: required, premium only
- Body: `{ "prompt": string, "slideCount"?: number }`
- Calls OpenAI with system prompt to generate slides in the existing `Slide[]` format
- Deducts credits (1 per slide generated)
- Returns: `{ "slides": Slide[], "creditsUsed": number, "creditsRemaining": number }`

#### `GET /api/ai/credits`
- Auth: required
- Returns: `{ "used": number, "limit": number, "remaining": number, "resetsAt": string }`
- Checks and auto-resets credits if `ai_credits_reset_at` has passed

## Credits System

- **Monthly limit:** 50 AI generations per premium user
- **Reset:** On webhook `subscription_created`/`subscription_updated` and checked on each credits API call
- **Deduction:** 1 credit per slide generated
- **Non-premium users:** Return `0` limit from credits endpoint
- **Out of credits:** Return 402 with upgrade prompt

## Frontend Changes

### Premium Gates

- `UpgradePrompt` component — shown inline where premium features would appear
- "Upgrade to Premium" button → calls checkout API → redirects
- Credit badge in header near save/export when authenticated

### Custom Logo Upload (LogoSettings.tsx)

- Add "Custom" tab when `isPremium` is true
- File upload area: drag-and-drop or click to select
- Shows preview after upload
- Uses existing `logo` state with `customUrl` + `isCustom: true`

### Logo Rendering (slide components)

- When `logo.isCustom && logo.customUrl`, render `<img src={logo.customUrl} />` instead of blob SVG
- Same position/shape logic applies

### AI Generation

- "Generate with AI" button in toolbar (or header area)
- Opens dialog modal:
  - Textarea: "Describe your presentation..."
  - Slide count selector (3-10)
  - "Generate" button with credit info
- On generation:
  - Shows loading spinner
  - Replaces current slides with generated ones
  - Shows success toast with credits remaining
- On error:
  - Shows error toast
  - Keeps existing slides

### Premium Guarding Logic

```
isFeatureEnabled = isAuthenticated && user.isPremium
```

Check on:
- Logo upload UI (→ show UpgradePrompt if not premium)
- AI generate button (→ show UpgradePrompt if not premium)
- Credit display (→ show "Premium feature" if not premium)

## Lemon Squeezy Integration

- Product ID configured via environment variables
- API key via `LEMON_SQUEEZY_API_KEY`
- Webhook secret via `LEMON_SQUEEZY_WEBHOOK_SECRET`
- Checkout: [Lemon Squeezy Checkout API](https://docs.lemonsqueezy.com/api/checkouts)
- Portal: [Customer Portal API](https://docs.lemonsqueezy.com/api/customer-portal)
- Webhook signature verification: SHA256 HMAC

## Environment Variables

```
LEMON_SQUEEZY_API_KEY=...
LEMON_SQUEEZY_WEBHOOK_SECRET=...
LEMON_SQUEEZY_PRODUCT_VARIANT_ID=...
OPENAI_API_KEY=...
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Dependencies

**Backend (requirements.txt additions):**
- `openai>=1.0.0`
- `httpx>=0.27.0` (for Lemon Squeezy API calls)

## Security

- Upload validation: image MIME only, max 2MB, server-side type verification
- Webhook signature verification on every event
- Premium endpoint guard: `Depends(premium_user)` that checks both auth + premium status
- Rate limiting on AI endpoint (consider implementing if abuse becomes an issue)

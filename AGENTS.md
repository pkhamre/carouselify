# carouselify — agent guidance

## Commands
- `cd frontend && npm run dev -- -p 4000` — Turbopack dev server (port 4000)
- `cd frontend && npm run build` — production build (primary verification; no separate typecheck)
- `cd frontend && npm run start -- -p 4000` — production server
- `cd frontend && npm run lint` — ESLint via `next lint`
- `docker compose up --build` — Start all services
- `docker compose up --build -d carouselify-backend` — Backend only
- `docker compose down -v` — Wipe SQLite data volume (needed when models change)
- Backend dev: `cd backend && uvicorn app.main:app --reload` (no Docker)

## Architecture
- Monorepo: `frontend/` (Next.js 15 App Router) + `backend/` (FastAPI + SQLite + Polar.sh) + root `docker-compose.yml`.
- Frontend single-page editor at `/` → `frontend/src/app/page.tsx`.
- Public shared view at `/showcase/[id]` → `frontend/src/app/showcase/[id]/page.tsx` (no `/s/` route).
- Showcase gallery at `/showcase` → `frontend/src/app/showcase/page.tsx`.
- Tailwind `darkMode: "class"` — toggle `class="dark"` on `<html>` app UI only (slides unaffected).
- UI accent color is `sky-600` everywhere.

## Auth flow
- Guests auto-create on first visit: `POST /auth/guest` → JWT stored, but `user` stays `null` (not authenticated in UI).
- Guest detection: email domain `@carouselify.app` in `getMe()` then-discard. No `is_guest` field in `UserRead`.
- `UserRead` (from `/auth/me`) exposes: `id`, `email`, `is_premium`, `is_admin`, `ai_credits_*`, `polar_subscription_*`, `polar_cancel_at_period_end`.
- Login/Register: `POST /auth/jwt/login` (form-urlencoded: `username=email&password=...`), `POST /auth/register`.
- On register, guest carousels merge via `POST /auth/link-guest` (reads `guest_user_id` from localStorage).
- `Depends(premium_user)` in `backend/app/users.py:82` returns 402 if not premium.
- `/auth/logout` clears token and `guest_user_id` from localStorage.

## Share + Showcase
- `ShareDialog.tsx` was gutted — now exports `ShareButton` + `ShowcaseButton` (NOT a dialog modal).
- Sharing is permanent from UI (no revoke). `ShareButton` calls `shareCarousel()`, copies URL to clipboard, shows toast.
- Showcase publish (`POST /api/carousels/:id/publish-showcase`) auto-creates `share_token` if missing — no "must share first" error.
- Unpublish from gallery: `POST /api/carousels/:id/unpublish-showcase` (keeps share link active).
- Showcase gallery: `GET /api/showcase` lists `showcased == true AND share_token IS NOT NULL`.

## Custom fonts (premium)
- `frontend/src/lib/googleFonts.ts` — 56 curated Google Fonts, `buildGoogleFontsUrl()`, `buildPreviewFontsUrl()`.
- ThemePicker.tsx: "Custom" option for premium → two searchable font pickers with live typeface preview in dropdown (20 popular fonts preloaded via combined URL).
- Custom fonts dynamically injected into `<head>` via `<link>` and cleaned up when switching to presets.

## Backend
- SQLite WAL mode via PRAGMA in `database.py`. Single-writer lock under heavy load.
- **Both** `create_all` (dev lifespan) and alembic (production `entrypoint.sh`: `alembic upgrade head` then uvicorn).
- Rate limit: `slowapi` `Limiter`, 429 handler in `main.py`.
- Guest endpoint (`POST /auth/guest`) in `routers/carousels.py`, rate-limited 10/hour.

### Routers (all in `backend/app/routers/`)

| File | Prefix | Purpose |
|------|--------|---------|
| `carousels.py` | `/api/carousels` | CRUD + share/guest/link-guest + publish/unpublish-showcase + public `/api/s/{token}` |
| `showcase.py` | `/api/showcase` | Public gallery listing |
| `schemes.py` | `/api/schemes` | Custom color schemes |
| `billing.py` | `/api/billing` | Polar.sh checkout, portal, webhook |
| `upload.py` | `/api/upload` | Logo upload (premium, 2MB, PNG/JPEG/WebP/GIF) |
| `ai.py` | `/api/ai` | AI generation (gpt-4o-mini) + credits |
| `admin.py` | `/api/admin` | Stats, showcase management, contact messages |
| `config.py` | `/api/config` | Public config (subscriptions_enabled) |
| `track.py` | (in admin router) | Public event tracking |

### Premium / Polar.sh
- NOT Lemon Squeezy. Uses `polar-sdk` (`polar_sdk`).
- `SUBSCRIPTIONS_ENABLED` env var gates checkout (set `true` for dev testing).
- Webhook handles: `subscription.created`, `.active`, `.updated`, `.canceled`, `.uncanceled`, `.revoked`.
- AI credits (50/month) reset when `ai_credits_reset_at < now`.

## Slide system
- 5 types: `cover`, `content-b1`, `content-b2`, `list`, `cta` (discriminated union `Slide`).
- 1080×1080px canvas, 72px margins, 8px accent bar (progress line).
- CTA button: `display: inline-flex; align-items: center; justify-content: center; height: 64px` (NOT line-height — html-to-image bug).
- All slide components accept `scheme`, `fonts`, `logo`, `slideNumber`, `totalSlides`, `readOnly`.
- 10 color schemes, 4 font pairings (+ custom for premium), 5 blob logo shapes.
- Preview: CSS `transform: scale(0.5)` desktop / `scale(0.333)` mobile with `transform-origin: top left`.
- Desktop: 3-column grid. Mobile < lg (1024px): tabbed layout with fixed bottom tab bar.

## Export (html-to-image)
- Options: `width: 1080, height: 1080, pixelRatio: 1, cacheBust: true, preferredFontFormat: 'woff2'`.
- Capture: hidden off-screen div (`position: fixed; left: -9999px; pointer-events: none`) at native 1080×1080.
- `getFontEmbedCSS()` called once per batch, passed as `fontEmbedCSS` to `toPng()`.
- PostHog optional (`NEXT_PUBLIC_POSTHOG_KEY`).

## Gotchas
- `build` is the only verification command (no separate typecheck/lint step).
- `URLSearchParams` body in `api.ts` must NOT have `Content-Type` overwritten (the `request` helper exempts `FormData` and `URLSearchParams`).
- `get_register_router`, `get_users_router`, `get_verify_router` in fastapi-users 14+ require schema arguments.
- Google Fonts loaded via `<link>` in `layout.tsx` — html-to-image sometimes needs two passes to embed.
- `transform: scale()` on preview doesn't affect layout — 1080×1080 inner element occupies layout space, clipped by `overflow: hidden`.
- When adding new slide features, every slide component type must be updated (Cover, ContentB1, ContentB2, List, CTA).
- `NEXT_BASE_PATH` env var for subdirectory deploys (must be set at build + runtime).

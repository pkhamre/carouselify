# carouselify — agent guidance

## Commands
- `cd frontend && npm run dev` — Turbopack dev server
- `cd frontend && npm run build` — production build (primary verification; no separate typecheck step)
- `cd frontend && npm run start` — production server
- `cd frontend && npm run lint` — ESLint via `next lint`
- `docker compose up --build` — Start all services (postgres, backend, frontend)
- `docker compose up --build -d backend` — Build and start backend only
- `docker compose down -v` — Wipe postgres volume (needed when models change since dev uses `create_all`)

## Architecture
- Monorepo: `frontend/` (Next.js 15 App Router) + `backend/` (FastAPI) + root `docker-compose.yml`.
- Frontend single-page editor at `/` → `frontend/src/app/page.tsx`.
- Public shared view at `/s/[id]` → `frontend/src/app/s/[id]/page.tsx`.
- Guests get auto-assigned JWT on first visit (no registration needed). Save works for guests.
- Tailwind `darkMode: "class"` — toggle `class="dark"` on `<html>` for app UI only (slides unaffected).
- UI accent color is `sky-600` everywhere.

## Slide system
- 5 slide types: `cover`, `content-b1`, `content-b2`, `list`, `cta` (typed as discriminated union `Slide`).
- All slide components accept `scheme`, `fonts`, `logo`, `slideNumber`, `totalSlides`, `readOnly`.
- Slide canvas: 1080×1080px, 72px margins, 8px accent bar at bottom (progress line).
- `punchline` spacer pattern: `.punchline-spacer-top` (flex-end) + `.punchline-spacer-bottom` (flex-start) with `flex: 1` each, punchline in middle with `padding: 60px 0`.
- Logo rendered via `{logo.showLogo && <div className="slide-logo slide-logo-${logo.position}">}` in each slide component. Supports custom uploaded URL (`logo.isCustom && logo.customUrl` → `<img>`).
- CTA button: `display: inline-flex; align-items: center; justify-content: center; height: 64px` (NOT line-height — html-to-image doesn't render line-height centering correctly).
- Color schemes are in `frontend/src/lib/themes.ts`; Ocean is index 0 (default). Custom scheme auto-derives `textOnAccent`/`bgOnAccent` from `background`.
- 10 schemes, 4 font pairings, 5 blob logo shapes.
- When adding new slide features, every slide component type must be updated (Cover, ContentB1, ContentB2, List, CTA).

## Preview rendering
- Preview scaled via CSS `transform: scale(0.5)` (desktop) / `scale(0.333)` (mobile) with `transform-origin: top left` on 1080×1080 inner div.
- Gray wrapper: `mx-auto max-w-[540px]` desktop / `max-w-[360px]` mobile — no flex centering.
- Desktop: 3-column grid (left sidebar + preview + right sidebar). Mobile below `lg` (1024px): tabbed layout with fixed bottom tab bar.
- Save/Export buttons in a floating bottom bar (desktop) / preview tab (mobile).

## Export (html-to-image)
- `getFontEmbedCSS()` called once per export batch, passed as `fontEmbedCSS` option to `toPng()`.
- Options: `width: 1080, height: 1080, pixelRatio: 1, cacheBust: true, preferredFontFormat: 'woff2'`.
- Capture source: hidden off-screen div (`position: fixed; left: -9999px; pointer-events: none`) at native 1080×1080.
- Output: `carouselify-01.png`, `carouselify-02.png`, etc.
- **PostHog analytics** (optional): export events tracked if `NEXT_PUBLIC_POSTHOG_KEY` is set.

## Keyboard shortcuts
- `Ctrl+Z` — Undo slide delete
- `Ctrl+S` — Save carousel
- Arrow keys — Navigate slides (up/left = previous, down/right = next)
- `Delete` / `Backspace` — Remove selected slide

## Undo system
- Slide deletes push to undo stack; Toast shows "Slide deleted" with Undo action button.
- Undo restores the deleted slide at its original position.

## Build & deploy
- `NEXT_BASE_PATH` env var for subdirectory deploys (must be set at build + runtime).
- `NEXT_OUTPUT=standalone` or `NEXT_OUTPUT=export` for those modes; otherwise no output config.
- Static export artifact is `frontend/out/`; `.next/` + `out/` are gitignored.
- Docker: multi-stage `frontend/Dockerfile` (node:24-alpine, non-root `nextjs` user).

## Backend (FastAPI + PostgreSQL)

### Dev
- Postgres runs in Docker (`postgres:18-alpine`). Volume mounts at `/var/lib/postgresql` (NOT `/var/lib/postgresql/data` — PG 18+ requires versioned subdir).
- Dev uses `Base.metadata.create_all` in lifespan (not Alembic migrations). Drop volume with `docker compose down -v` when models change.
- `docker compose up --build -d backend` after code changes.

### Auth
- `fastapi-users[sqlalchemy]` with JWT Bearer tokens, 30-day expiry.
- `POST /auth/guest` — Creates guest user, returns JWT (auto-called on frontend first visit).
- `POST /auth/link-guest` — Transfers carousels from guest user to registered user, deletes guest.
- `POST /auth/jwt/login` — Accepts `application/x-www-form-urlencoded` (username=email, password=...).
- Register creates new user; `POST /auth/link-guest` merges guest carousels afterward.
- `Depends(premium_user)` guards premium-only endpoints.

### Endpoints
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/auth/guest` | None | Create guest user |
| POST | `/auth/register` | None | Register |
| POST | `/auth/jwt/login` | None | Login (form-urlencoded) |
| POST | `/auth/jwt/logout` | Bearer | Logout |
| GET | `/auth/me` | Bearer | Current user |
| GET/POST/PUT/DELETE | `/api/carousels[/:id]` | Bearer | Carousel CRUD |
| POST/DELETE | `/api/carousels/:id/share` | Bearer | Share/revoke |
| GET | `/api/s/:token` | None | Public shared carousel |
| POST | `/api/billing/checkout` | Bearer | Lemon Squeezy checkout |
| POST | `/api/billing/portal` | Bearer | Customer portal |
| POST | `/api/billing/webhook` | Signature | Lemon Squeezy webhook |
| POST | `/api/upload/logo` | Bearer+Premium | Upload logo (2MB, PNG/JPEG/WebP/GIF) |
| GET | `/api/ai/credits` | Bearer | AI credits (50/mo, premium) |
| POST | `/api/ai/generate` | Bearer+Premium | Generate slides (gpt-4o-mini) |
| GET | `/health` | None | Health check |

### Premium
- User model has `is_premium`, `lemon_squeezy_*`, `ai_credits_*` fields.
- AI credits reset when `ai_credits_reset_at < now` (checked on `/api/ai/credits` and `/api/ai/generate`).
- Webhook handles `subscription_created` / `updated` / `cancelled` / `expired`.
- `Depends(premium_user)` in `backend/app/users.py` returns 402 if not premium.

## Files worth knowing
| File | Purpose |
|------|---------|
| `frontend/src/app/page.tsx` | All state, layout, tab bar, export, AiDialog, credit badge |
| `frontend/src/app/s/[id]/page.tsx` | Public shared carousel view + Clone & Edit |
| `frontend/src/lib/types.ts` | All slide/theme/logo types, `defaultLogo` |
| `frontend/src/lib/themes.ts` | `colorSchemes`, `fontPairings` |
| `frontend/src/lib/api.ts` | Full API client (auth, carousels, billing, upload, AI) |
| `frontend/src/lib/auth.tsx` | AuthProvider — guest auto-login, register, logout |
| `frontend/src/lib/export.ts` | `exportSlideAsPNG` — double-toPng workaround |
| `frontend/src/lib/analytics.ts` | PostHog analytics init + `captureExport` |
| `frontend/src/components/SaveButton.tsx` | Save carousel with title input |
| `frontend/src/components/ShareDialog.tsx` | Generate/copy/revoke share links |
| `frontend/src/components/AuthModal.tsx` | Login/Register tabbed modal |
| `frontend/src/components/Toast.tsx` | Auto-dismissing toasts with action buttons |
| `frontend/src/components/MyCarousels.tsx` | List/load/delete saved carousels |
| `frontend/src/components/UserMenu.tsx` | Guest Login/Register or avatar dropdown |
| `frontend/src/components/LogoSettings.tsx` | Logo config + premium upload UI |
| `frontend/src/components/UpgradePrompt.tsx` | Premium gate component |
| `frontend/src/components/AiDialog.tsx` | AI generation dialog (premium) |
| `frontend/src/components/slides/slideStyles.css` | All slide CSS |
| `backend/app/main.py` | FastAPI app assembly, CORS, lifespan, router includes |
| `backend/app/models.py` | User + Carousel SQLAlchemy models |
| `backend/app/schemas.py` | All Pydantic schemas |
| `backend/app/users.py` | fastapi-users setup, `premium_user` dep |
| `backend/app/routers/carousels.py` | CRUD, share, guest, public endpoints |
| `backend/app/routers/billing.py` | Checkout, portal, webhook |
| `backend/app/routers/upload.py` | Logo upload |
| `backend/app/routers/ai.py` | AI generation + credits |

## Gotchas
- `build` is the only verification command. Run from `frontend/` directory.
- Google Fonts loaded via `<link>` in `layout.tsx`; html-to-image sometimes needs two passes to embed.
- `transform: scale()` on slide doesn't affect layout — 1080×1080 inner element still occupies layout space, clipped by `overflow: hidden`.
- `URLSearchParams` body in `api.ts` must NOT have `Content-Type` overwritten (the `request` helper exempts `URLSearchParams` alongside `FormData`).
- Postgres 18+ volume must mount at `/var/lib/postgresql` (not `/var/lib/postgresql/data`). Old volume with wrong path needs `docker compose down -v`.
- `get_register_router`, `get_users_router`, `get_verify_router` in fastapi-users 14+ require schema arguments.
- PostHog is optional — only activates if `NEXT_PUBLIC_POSTHOG_KEY` is set.

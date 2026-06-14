# Save & Share — Design Specification

## Overview

Add backend persistence, user authentication, and public sharing to the Carouselify editor. Users can create accounts, save carousels, generate public share links, and others can view and clone shared carousels.

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌──────────┐
│  frontend/  │────▶│  backend/   │────▶│ postgres │
│  (Next.js)  │     │  (FastAPI)  │     │   :5432  │
│   :3000     │◀────│   :8000     │◀────│          │
└─────────────┘     └─────────────┘     └──────────┘
```

- JWT auth via fastapi-users (Bearer token in Authorization header)
- Frontend stores token in localStorage
- Public share page at `/s/[share_token]` — no auth required

## Repo Structure

```
/
├── frontend/                    # Moved from root
│   ├── src/app/
│   │   ├── page.tsx             # Editor (existing)
│   │   └── s/[id]/page.tsx      # Public shared view (new)
│   ├── src/components/
│   │   ├── AuthModal.tsx        # Login/register modal
│   │   ├── SaveButton.tsx       # Save carousel
│   │   └── ShareDialog.tsx      # Share link modal
│   ├── src/lib/
│   │   └── api.ts              # API client helpers
│   ├── Dockerfile
│   └── package.json
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py             # FastAPI app, CORS, lifespan
│   │   ├── database.py         # Async engine, session, Base
│   │   ├── models.py           # User (fastapi-users), Carousel
│   │   ├── schemas.py          # Pydantic models
│   │   ├── routers/
│   │   │   ├── __init__.py
│   │   │   └── carousels.py    # CRUD + share endpoints
│   │   ├── users.py            # UserManager, auth backend, fastapi_users init
│   │   └── config.py           # Settings from env
│   ├── alembic/
│   │   ├── env.py              # Async migration support
│   │   └── versions/
│   ├── alembic.ini
│   ├── Dockerfile
│   └── requirements.txt
├── docker-compose.yml
└── AGENTS.md
```

## Data Model

### User (via fastapi-users, UUID PK)

- `id` — UUID, primary key
- `email` — unique, indexed
- `hashed_password` — bcrypt
- `is_active`, `is_superuser`, `is_verified` — booleans

### Carousel

| Column | Type | Notes |
|---|---|---|
| `id` | UUID | PK, server-generated |
| `user_id` | UUID | FK → user.id, NOT NULL |
| `title` | VARCHAR(255) | User-facing name |
| `data` | JSONB | Full carousel state (slides, scheme, fonts, logo) |
| `is_public` | BOOLEAN | Default false |
| `share_token` | UUID | Unique, indexed, nullable. Generated when sharing. |
| `created_at` | TIMESTAMPTZ | Server default now() |
| `updated_at` | TIMESTAMPTZ | Server default now(), on-update |

**Indexes**: `(user_id)`, `(share_token)` unique, `(is_public)`.

## API Endpoints

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/auth/jwt/login` | No | Login (form data: username=email, password) |
| POST | `/auth/jwt/logout` | JWT | Logout |
| POST | `/auth/register` | No | Register |
| GET | `/auth/me` | JWT | Current user |
| PATCH | `/auth/me` | JWT | Update profile |
| POST | `/auth/forgot-password` | No | Request reset |
| POST | `/auth/reset-password` | No | Reset password |
| POST | `/api/carousels` | JWT | Create/save carousel |
| GET | `/api/carousels` | JWT | List user's carousels |
| GET | `/api/carousels/{id}` | JWT | Get one (own only) |
| PUT | `/api/carousels/{id}` | JWT | Update |
| DELETE | `/api/carousels/{id}` | JWT | Delete |
| POST | `/api/carousels/{id}/share` | JWT | Generate share token → returns URL |
| DELETE | `/api/carousels/{id}/share` | JWT | Revoke share (set is_public=false, null token) |
| GET | `/api/s/{share_token}` | No | Public carousel data |

## Auth Flow

1. User clicks "Save" → frontend checks for JWT token in localStorage
2. If not authenticated → `AuthModal` shows (login/register tabs)
3. Login: `POST /auth/jwt/login` with form data → returns `{access_token, token_type}`
4. Store token in localStorage, attach as `Authorization: Bearer <token>` on all subsequent requests
5. fastapi-users handles password hashing, token generation, user CRUD

## Share & Clone Flow

1. User clicks "Share" on their saved carousel → `POST /api/carousels/{id}/share`
2. Backend generates `uuid.uuid4()` as `share_token`, sets `is_public=true`
3. Returns `{url: "/s/<share_token>"}`
4. Frontend shows `ShareDialog` with copyable link
5. Visitor opens `/s/<share_token>` → page fetches `GET /api/s/{share_token}`
6. Renders carousel read-only — existing slide components accept `readOnly` prop
7. "Clone and Edit" button → copies data into editor state → navigates to `/`
8. If user wants to save the clone → prompted to login/register

## Frontend Changes

### New Files

- **`src/lib/api.ts`** — Client for all API calls (auth, carousels, share). Handles token storage/retrieval. Axios or fetch-based.
- **`src/components/AuthModal.tsx`** — Tabbed modal: Login / Register / Forgot Password. Calls `/auth/jwt/login` and `/auth/register`. Stores token.
- **`src/components/SaveButton.tsx`** — Triggers save/update. If not logged in, shows AuthModal first. Shows success/error toast.
- **`src/components/ShareDialog.tsx`** — Shows shareable URL with copy button. Option to revoke (unshare).
- **`src/app/s/[id]/page.tsx`** — Fetches data from `GET /api/s/{share_token}`, renders read-only view with "Clone and Edit" button.

### Modified Files

- **Slide components** — Accept optional `readOnly` prop. When true, disable editing controls (text inputs become static text, drag handles hidden, etc.).
- **Layout/App** — Wrap with AuthProvider context for global auth state.

### Read-Only Slide Rendering

Each slide component gets a `readOnly` prop:
- **Cover**: text renders as `<p>` instead of `<input>`/contentEditable
- **ContentB1/B2**: same pattern
- **List**: items render as `<li>` instead of editable fields
- **CTA**: button still renders but non-interactive

## Backend Details

### Dependencies

```
fastapi
fastapi-users[sqlalchemy]
uvicorn[standard]
asyncpg
sqlalchemy[asyncio]
alembic
pydantic-settings
python-multipart
```

### Database Connection

Async engine via `create_async_engine("postgresql+asyncpg://...")`, `async_sessionmaker` for session factory. URL from env via `pydantic-settings`.

### CORS

Allow `http://localhost:3000` (frontend dev) and production domain. Allow credentials, all methods, all headers.

### Carousel Data Format

The `data` JSONB column stores the full carousel editor state as a serialized JSON object:

```json
{
  "slides": [...],
  "schemeIndex": 0,
  "fontIndex": 1,
  "logo": { "showLogo": true, "position": "top-left", "blobShape": "circle" },
  "presentationTitle": "My Deck"
}
```

This is the exact state that the editor uses — simpler to store/restore without transformation.

## Error Handling

- **400** — Validation errors, bad credentials
- **401** — Missing/invalid JWT
- **403** — Trying to access another user's carousel
- **404** — Carousel/share_token not found
- **409** — Duplicate email on registration
- Backend returns `{"detail": "message"}` consistent with FastAPI convention

## Docker Compose

```yaml
services:
  postgres:
    image: postgres:18-alpine
    environment:
      POSTGRES_USER: carouselify
      POSTGRES_PASSWORD: carouselify
      POSTGRES_DB: carouselify
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    depends_on:
      - postgres
    environment:
      DATABASE_URL: postgresql+asyncpg://carouselify:carouselify@postgres:5432/carouselify
      SECRET: change-me-in-production
    ports:
      - "8000:8000"
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

  frontend:
    build: ./frontend
    depends_on:
      - backend
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:8000
    ports:
      - "3000:3000"

volumes:
  pgdata:
```

## Out of Scope (for this spec)

- File/image upload for carousel assets
- Rate limiting
- Analytics / PostHog events for save/share
- Pagination for carousel list (future if many carousels)
- OAuth providers (Google, GitHub, etc.)

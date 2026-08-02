## What is carouselify?

carouselify is a visual editor for LinkedIn carousels. Pick a theme, arrange slides, and export PNG or PDF — no design skills required.

## How it works

1. **Edit** — Click slides in the sidebar, write content in the right panel.
2. **Style** — Choose a color scheme, font pairing, and logo from the sidebar.
3. **Export** — Download individual PNGs or a multi-page PDF (1080×1080px).

## Getting Started

### Quick Start (Docker)

```bash
docker compose up --build
```

Open [http://localhost:4000](http://localhost:4000). The frontend runs on port 4000 and the backend API on port 8000.

### Local Development

**Frontend:**
```bash
cd frontend
npm install
npm run dev -- -p 4000
```

**Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Database is SQLite (file-based, no separate server). Override via `DATABASE_URL` env var (default: `sqlite+aiosqlite:///./carouselify.db`).

### Production

```bash
cd frontend
npm run build
npm start -- -p 4000
```

Set `NEXT_BASE_PATH` for subdirectory deploys:

```bash
NEXT_BASE_PATH=/carouselify npm run build
NEXT_BASE_PATH=/carouselify npm start
```

Static export:

```bash
NEXT_BASE_PATH=/carouselify NEXT_OUTPUT=export npm run build
```

Production Docker:

```bash
docker compose -f docker-compose-prod.yml up --build
```

## Features

| Domain | What you can do |
|--------|-----------------|
| **Slides** | 5 types (Cover, Content B1, Content B2, List, CTA). Up to 12 slides with add, remove, and reorder. |
| **Theming** | 10 color schemes, 4 font pairings, 56 curated Google Fonts (premium). Inverted color mode. Custom color schemes per account. |
| **Logo** | Configurable letter, blob shape, and position. Toggle visibility. Premium users can upload a custom image (PNG/JPEG/WebP/GIF, 2MB). |
| **Sharing** | Save carousels and share via a public link. Publish to the showcase gallery. Clone & Edit shared carousels. |
| **Account** | Guest mode on first visit (auto-assigned JWT, save works immediately). Register to keep carousels across devices. Guest carousels merge on register. |
| **AI** | Premium users generate slides with AI (gpt-4o-mini, 50 credits/month). Registered users get 5 credits; guests get 1 free use. |
| **Export** | Individual PNG files or a multi-page PDF. |
| **Premium** | Custom logo upload, AI generation, and custom Google Fonts via Polar.sh subscription. |

## Slide Types

| Type | Fields |
|------|--------|
| **Cover** | Headline, Punchline, Caption |
| **Content B1** | Intro, Punchline, Body |
| **Content B2** | Headline, Punchline, Body |
| **List** | Intro, Punchline, 3 Items |
| **CTA** | Headline, Button Text, Body |

## Design System

- **Canvas:** 1080×1080px, 72px outer margins
- **Punchlines:** 72px, vertically centered, 60px padding
- **Progress bar:** Bottom accent bar (8px), scales with slide position
- **Logo:** 110×110px, configurable position (top-left, top-center, top-right, bottom-right), toggle visibility
- **Slide counter:** "NN / TT" format on all slides except the cover
- **Brevity:** Max ~30 words per slide

## Usage

### Editing
1. Pick a theme from the sidebar (color scheme + font pairing).
2. Customize your logo — letter, shape, position, and visibility.
3. Click through slides in the sidebar and edit content in the right panel.
4. Switch slide types with the dropdown.
5. Add, remove, and reorder slides with the toolbar buttons or keyboard shortcuts (Ctrl+Z undo, Delete/Backspace remove, arrow keys navigate).

### Saving & Sharing
6. Save your carousel (works as a guest). Saved carousels can be updated.
7. Browse your saved carousels from the sidebar (My Carousels). Load or delete at any time.
8. Register an account to keep carousels across devices. Guest carousels merge automatically.
9. Share your carousel — click Share in the toolbar to generate a public link (copied to clipboard). Share links are permanent from the UI; a backend revoke endpoint exists for administrative use.
10. Publish your carousel to the public showcase gallery from the sidebar. Unpublish at any time. On a shared carousel page, click "Clone and Edit" to copy it into your editor.

### Export & AI
11. Generate slides with AI (premium only) — describe your presentation and the editor creates slides.
12. Export as individual PNGs or a combined PDF.

## API

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/guest` | No | Create guest account, returns JWT (rate-limited 10/hr) |
| POST | `/auth/register` | No | Create full account |
| POST | `/auth/jwt/login` | No | Login (form-urlencoded: `username=email&password=...`) |
| POST | `/auth/jwt/logout` | Yes | Invalidate token |
| GET | `/auth/me` | Yes | Current user info |
| POST | `/auth/link-guest` | Yes | Merge guest carousels into registered account |

### Carousels
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/carousels` | Yes | Create carousel |
| GET | `/api/carousels` | Yes | List your carousels |
| GET | `/api/carousels/{id}` | Yes | Get carousel |
| PUT | `/api/carousels/{id}` | Yes | Update carousel |
| DELETE | `/api/carousels/{id}` | Yes | Delete carousel |
| POST | `/api/carousels/{id}/share` | Yes | Generate share link |
| DELETE | `/api/carousels/{id}/share` | Yes | Revoke share link |
| POST | `/api/carousels/{id}/publish-showcase` | Yes | Publish to showcase gallery |
| POST | `/api/carousels/{id}/unpublish-showcase` | Yes | Remove from showcase gallery |
| GET | `/api/s/{token}` | No | Get shared carousel (public) |
| GET | `/api/showcase` | No | List showcase gallery |

### Other
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/schemes` | Yes | Save custom color scheme |
| GET | `/api/schemes` | Yes | List your schemes |
| POST | `/api/billing/checkout` | Yes | Create Polar.sh checkout |
| POST | `/api/billing/portal` | Yes | Polar.sh customer portal URL |
| POST | `/api/billing/webhook` | Signature | Polar.sh webhook |
| POST | `/api/upload/logo` | Yes+Premium | Upload custom logo (2MB, PNG/JPEG/WebP/GIF) |
| GET | `/api/ai/credits` | Yes | Check AI credits |
| POST | `/api/ai/generate` | Yes+Premium | Generate slides via gpt-4o-mini |
| GET | `/api/config` | No | Public config (`subscriptions_enabled`) |
| POST | `/api/track/event` | No | Public event tracking |
| GET | `/health` | No | Health check |

## Project Structure

```
frontend/src/
  app/
    page.tsx                    # Main editor + preview
    layout.tsx                  # Root layout with Google Fonts
    showcase/
      page.tsx                  # Showcase gallery
      [id]/page.tsx             # Public shared carousel view
    admin/page.tsx              # Admin dashboard
    faq/page.tsx                # FAQ
    privacy/page.tsx            # Privacy policy
  components/
    slides/
      CoverSlide.tsx
      ContentB1Slide.tsx
      ContentB2Slide.tsx
      ListSlide.tsx
      CtaSlide.tsx
      SlideCanvas.tsx
      slideStyles.css
    AiDialog.tsx               # AI slide generation (premium)
    AuthModal.tsx              # Login/register modal
    LogoSettings.tsx           # Logo config + premium upload UI
    LogoSVG.tsx                # Customizable logo SVG
    MyCarousels.tsx            # List/load/delete saved carousels
    SaveButton.tsx             # Save carousel with title input
    ShareDialog.tsx            # Exports ShareButton + ShowcaseButton
    SettingsDialog.tsx         # Account settings, dark mode, default letter
    SiteHeader.tsx             # Top navigation bar
    ThemePicker.tsx            # Color scheme + font pairing + custom fonts (premium)
    Toast.tsx                  # Auto-dismissing notifications
    UpgradePrompt.tsx          # Premium gate component
    UserMenu.tsx               # Guest Login/Register or avatar dropdown
  lib/
    types.ts                    # Slide, theme, logo types + defaults
    themes.ts                   # Color schemes + preset font pairings
    googleFonts.ts             # 56 curated Google Fonts + URL builders
    logoShapes.ts              # Blob SVG path data
    showcase.ts                # Seed carousel data
    api.ts                     # Full API client
    auth.tsx                   # Auth context (AuthProvider + useAuth)
    export.ts                  # PNG/PDF export (html-to-image)
    analytics.ts               # PostHog analytics (optional)
    utils.ts                   # Slide factory + helpers

backend/app/
  main.py                      # FastAPI app, CORS, lifespan
  config.py                    # Pydantic settings
  database.py                  # Async engine, session, Base (SQLite WAL)
  models.py                    # User + Carousel + Event + CustomScheme + CarouselLike
  schemas.py                   # Pydantic request/response models
  users.py                     # fastapi-users JWT auth + premium_user dep
  routers/
    carousels.py               # CRUD + share/guest/link-guest + public
    showcase.py                # Public gallery listing
    schemes.py                 # Custom color schemes
    billing.py                 # Polar.sh checkout, portal, webhook
    upload.py                  # Logo upload (premium)
    ai.py                      # AI generation + credits
    admin.py                   # Stats, showcase mgmt, contact messages
    config.py                  # Public config endpoint
    track.py                   # Public event tracking
  alembic/                     # Async migration support (prod)
  Dockerfile
  entrypoint.sh                # alembic upgrade head + uvicorn

docker-compose.yml             # Backend + frontend
docker-compose-prod.yml        # Production (external network, no port mapping for frontend)
AGENTS.md                      # Agent guidance
```

## Tech Stack

- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS, html-to-image, jspdf
- **Backend:** FastAPI, SQLAlchemy 2.0 (async), aiosqlite, Alembic, fastapi-users (JWT), OpenAI, Python Polar SDK
- **Payments:** Polar.sh (`polar-sdk`)
- **Database:** SQLite (WAL mode)
- **Infrastructure:** Docker Compose
- **Optional Analytics:** PostHog (`NEXT_PUBLIC_POSTHOG_KEY`)

## License

MIT

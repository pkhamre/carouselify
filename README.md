# carouselify

Create beautiful, design-consistent LinkedIn carousels in minutes. Built with a monorepo architecture: Next.js 15 frontend + FastAPI backend + SQLite.

## Features

- **5 slide types** - Cover, Content (Big Punchline / Two-part Headline), Bullet List, CTA/Closing
- **10 color schemes** - Original, Ocean, Forest, Citrus, Bubblegum, Electric Mint, Lavender Pop, Tangerine Dream, Cerulean, Custom
- **4 font pairings** by default; **56 curated Google Fonts** for premium subscribers (any display + body combination)
- **Customizable logo** - Choose any letter, blob shape, and position; toggle visibility on/off; premium users can upload their own image (PNG/JPEG/WebP/GIF, 2MB)
- **Inverted color mode** - Toggle to swap background and text colors
- **Flexible slide count** - Up to 12 slides with add, remove, and reorder
- **AI slide generation** - Premium users get 50 AI credits per month (gpt-4o-mini); registered users get 5; guests get 1 free use
- **Export** - Download as individual PNG files or a multi-page PDF (1080x1080px)
- **Progress bar** - Bottom accent bar scales with slide position
- **Guest mode** - Auto-assigned JWT on first visit; save and restore without registering
- **Save & Share** - Save carousels and share them via a permanent public link
- **Showcase gallery** - Publish your carousel to the public gallery at `/showcase`; Clone & Edit any shared carousel
- **My Carousels** - Browse, load, and delete your saved carousels from within the editor
- **Custom color schemes** - Save and reuse custom color schemes per account
- **Premium subscription** - Unlock custom logo upload, AI generation, and custom Google Fonts via Polar.sh

## Getting Started

### Prerequisites

- Docker and Docker Compose (recommended)
- Node.js 20.9+ and Python 3.12+ (for local dev without Docker)

### Quick Start (Docker)

```bash
docker compose up --build
```

Open [http://localhost:4000](http://localhost:4000). This starts the backend API on port 8000 and the frontend on port 4000.

### Local Development

**Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev -- -p 4000
```

**Database:** SQLite (file-based, no separate server). Override via `DATABASE_URL` env var (default: `sqlite+aiosqlite:///./carouselify.db`).

### Production Frontend Build

```bash
cd frontend
npm run build
npm start -- -p 4000
```

Set `NEXT_BASE_PATH` for subdirectory deploys (see below).

### Subdirectory Deployment

```bash
NEXT_BASE_PATH=/carouselify npm run build
NEXT_BASE_PATH=/carouselify npm start
```

Static export:
```bash
NEXT_BASE_PATH=/carouselify NEXT_OUTPUT=export npm run build
```

### Docker (Production)

```bash
docker compose -f docker-compose-prod.yml up --build
```

For individual service images:
```bash
docker build --target runner -t carouselify-frontend ./frontend
docker build -t carouselify-backend ./backend
```

## Usage

1. **Guest mode** - On first visit you are auto-assigned a guest account. Save works immediately.
2. **Pick a theme** - Choose a color scheme and font pairing from the sidebar
3. **Customize your logo** - Set the letter, shape, and position; toggle visibility (premium: upload your own image)
4. **Edit slides** - Click through slides in the sidebar and edit content in the right panel
5. **Change slide types** - Use the dropdown to switch between Cover, Content B1, Content B2, List, and CTA
6. **Add/remove slides** - Use the + Add button or x to manage slide count (max 12)
7. **Reorder** - Use Up/Down arrows to rearrange slides
8. **Keyboard shortcuts** - Ctrl+Z (undo delete), Ctrl+S (save), arrow keys (navigate), Delete/Backspace (remove)
9. **Save** - Save your carousel (always works, even as guest). Saved carousels can be updated.
10. **My Carousels** - Browse your saved carousels from the sidebar. Load or delete at any time.
11. **Register** - Create an account to keep your carousels across devices. Guest carousels merge automatically.
12. **Share** - Click Share in the toolbar to generate a permanent share link (copied to clipboard).
13. **Showcase** - Publish your saved carousel to the public gallery from the sidebar. Unpublish at any time.
14. **Clone & Edit** - On a shared carousel page, click "Clone and Edit" to copy it into your editor.
15. **AI Generation** - Premium users: describe your presentation and generate slides with AI (50 credits/month).
16. **Export** - Click "Export PNG" for individual images or "Export PDF" for a combined document.

## Slide Types

| Type | Description | Fields |
|------|-------------|--------|
| **Cover** | Opening hook (no counter) | Headline, Punchline, Caption |
| **Content (Punchline)** | Big accent statement | Intro, Punchline, Body |
| **Content (Two-part)** | Dark headline + accent payoff | Headline, Punchline, Body |
| **List** | Three bullet points | Intro, Punchline, 3 Items |
| **CTA** | Inverted closing slide | Headline, Button Text, Body |

## Design System

The carousel follows strict design rules for consistency:

- **1080x1080px** square canvas with 72px outer margins
- **Punchlines** (H2) are always 72px, vertically centered with 60px padding
- **Progress bar** at the bottom scales from first to last slide
- **Logo** configurable position (top-left, top-center, top-right, bottom-right), 110x110px, show/hide toggle
- **Slide counter** in "NN / TT" format on all slides except the cover
- **Max ~30 words per slide** - the design forces brevity

## Project Structure

```
frontend/
  src/
    app/
      layout.tsx                  # Root layout with Google Fonts
      page.tsx                    # Main editor + preview
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
      AiDialog.tsx               # AI slide generation dialog (premium)
      AuthModal.tsx               # Login/register modal
      LogoSettings.tsx            # Logo config + premium upload UI
      LogoSVG.tsx                 # Customizable logo SVG
      MyCarousels.tsx             # List/load/delete saved carousels
      SaveButton.tsx              # Save carousel with title input
      ShareDialog.tsx             # Exports ShareButton + ShowcaseButton (inline, no modal)
      SettingsDialog.tsx          # Account settings, dark mode, default letter
      SiteHeader.tsx              # Top navigation bar
      ThemePicker.tsx             # Color scheme + font pairing + custom fonts (premium)
      Toast.tsx                   # Auto-dismissing notifications
      UpgradePrompt.tsx           # Premium gate component
      UserMenu.tsx                # Guest Login/Register or avatar dropdown
    lib/
      types.ts                    # Slide, theme, logo types + defaults
      themes.ts                   # Color schemes + preset font pairings
      googleFonts.ts              # 56 curated Google Fonts + URL builders
      logoShapes.ts               # Blob SVG path data
      showcase.ts                 # Seed carousel data
      api.ts                      # Full API client
      auth.tsx                    # Auth context (AuthProvider + useAuth)
      export.ts                   # PNG/PDF export (html-to-image)
      analytics.ts                # PostHog analytics (optional)
      utils.ts                    # Slide factory + helpers

backend/
  app/
    main.py                       # FastAPI app, CORS, lifespan
    config.py                     # Pydantic settings
    database.py                   # Async engine, session, Base (SQLite WAL)
    models.py                     # User + Carousel + Event + CustomScheme + CarouselLike
    schemas.py                    # Pydantic request/response models
    users.py                      # fastapi-users JWT auth + premium_user dep
    routers/
      carousels.py                # CRUD + share/guest/link-guest + public
      showcase.py                 # Public gallery listing
      schemes.py                  # Custom color schemes
      billing.py                  # Polar.sh checkout, portal, webhook
      upload.py                   # Logo upload (premium)
      ai.py                       # AI generation + credits
      admin.py                    # Stats, showcase mgmt, contact messages
      config.py                   # Public config endpoint
      track.py                    # (in admin router) Public event tracking
  alembic/                        # Async migration support (prod)
  Dockerfile
  entrypoint.sh                   # alembic upgrade head + uvicorn

docker-compose.yml                # Backend + frontend
docker-compose-prod.yml           # Production (external network, no port mapping for frontend)
AGENTS.md                         # Agent guidance
```

## Tech Stack

- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS, html-to-image, jspdf
- **Backend:** FastAPI, SQLAlchemy 2.0 (async), aiosqlite, Alembic, fastapi-users (JWT), OpenAI, Python Polar SDK
- **Payments:** Polar.sh (`polar-sdk`)
- **Database:** SQLite (WAL mode)
- **Infrastructure:** Docker Compose
- **Optional Analytics:** PostHog (`NEXT_PUBLIC_POSTHOG_KEY`)

## API

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/guest` | No | Create guest account, returns JWT (rate-limited 10/hr) |
| POST | `/auth/register` | No | Create full account |
| POST | `/auth/jwt/login` | No | Login (form-urlencoded: `username=email&password=...`) |
| POST | `/auth/jwt/logout` | Yes | Invalidate token |
| GET | `/auth/me` | Yes | Current user info |
| POST | `/auth/link-guest` | Yes | Merge guest carousels into registered account |
| POST | `/api/carousels` | Yes | Create carousel |
| GET | `/api/carousels` | Yes | List your carousels |
| GET | `/api/carousels/{id}` | Yes | Get carousel |
| PUT | `/api/carousels/{id}` | Yes | Update carousel |
| DELETE | `/api/carousels/{id}` | Yes | Delete carousel |
| POST | `/api/carousels/{id}/share` | Yes | Generate share link (permanent) |
| DELETE | `/api/carousels/{id}/share` | Yes | Revoke share link |
| POST | `/api/carousels/{id}/publish-showcase` | Yes | Publish to showcase gallery (auto-creates share token) |
| POST | `/api/carousels/{id}/unpublish-showcase` | Yes | Remove from showcase gallery |
| GET | `/api/s/{token}` | No | Get shared carousel (public) |
| GET | `/api/showcase` | No | List showcase gallery |
| POST | `/api/schemes` | Yes | Save custom color scheme |
| GET | `/api/schemes` | Yes | List your schemes |
| POST | `/api/billing/checkout` | Yes | Create Polar.sh checkout |
| POST | `/api/billing/portal` | Yes | Polar.sh customer portal URL |
| POST | `/api/billing/webhook` | Signature | Polar.sh webhook |
| POST | `/api/upload/logo` | Yes+Premium | Upload custom logo (2MB, PNG/JPEG/WebP/GIF) |
| GET | `/api/ai/credits` | Yes | Check AI credits |
| POST | `/api/ai/generate` | Yes+Premium | Generate slides via gpt-4o-mini |
| GET | `/api/config` | No | Public config (subscriptions_enabled) |
| POST | `/api/track/event` | No | Public event tracking |
| GET | `/health` | No | Health check |

## License

MIT

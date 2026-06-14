# carouselify

Create beautiful, design-consistent LinkedIn carousels in minutes. Built with a monorepo architecture: Next.js 15 frontend + FastAPI backend + SQLite.

## Features

- **5 slide types** — Cover, Content (Big Punchline / Two-part Headline), Bullet List, CTA/Closing
- **10 color schemes** — Original, Ocean, Forest, Citrus, Bubblegum, Electric Mint, Lavender Pop, Tangerine Dream, Cerulean, Custom
- **4 font pairings** — Original, Classic Editorial, Friendly, Playful
- **Customizable logo** — Choose any letter, blob shape, and position; toggle visibility on/off
- **Inverted color mode** — Toggle to swap background and text colors
- **Flexible slide count** — Up to 12 slides with add, remove, and reorder
- **Export** — Download as individual PNG files or a multi-page PDF
- **1080×1080px canvas** — Optimized for LinkedIn's square format
- **Progress bar** — Bottom accent bar scales with slide position
- **Guest mode** — Auto-assigned JWT on first visit; save and restore without registering
- **Save & Share** — Save carousels to your account and share them via a public view-only link
- **Clone & Edit** — Open any shared carousel and clone it into your own editor session
- **My Carousels** — Browse, load, and delete your saved carousels from within the editor
- **Premium subscription** — Unlock custom logo upload + AI-powered slide generation via Lemon Squeezy
- **Custom logo upload** — Premium users can upload their own logo image (PNG/JPEG/WebP/GIF, 2MB max)
- **AI slide generation** — Premium users get 50 AI credits per month to generate slides via gpt-4o-mini

## Getting Started

### Prerequisites

- Docker and Docker Compose (recommended)
- Node.js 20.9+ and Python 3.12+ (for local dev without Docker)

## Quick Start (Docker)

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
docker compose -f docker-compose.yml up --build
```

For individual service images:
```bash
docker build -t carouselify-frontend ./frontend --target runner
docker build -t carouselify-backend ./backend
```

## Usage

1. **Guest mode** — On first visit you're auto-assigned a guest account. Save works immediately.
2. **Pick a theme** — Choose a color scheme and font pairing from the sidebar
3. **Customize your logo** — Set the letter, shape, and position; toggle visibility on/off (premium: upload your own)
4. **Edit slides** — Click through slides in the sidebar and edit content in the right panel
5. **Change slide types** — Use the dropdown to switch between Cover, Content B1, Content B2, List, and CTA
6. **Add/remove slides** — Use the + Add button or × to manage slide count (max 12)
7. **Reorder** — Use ↑/↓ arrows to rearrange slides
8. **Keyboard shortcuts** — Ctrl+Z (undo delete), Ctrl+S (save), arrow keys (navigate), Delete/Backspace (remove)
9. **Save** — Save your carousel (always works, even as guest). Saved carousels can be updated.
10. **My Carousels** — Browse your saved carousels from the sidebar. Load or delete at any time.
11. **Register** — Create an account to keep your carousels across devices. Guest carousels merge automatically.
12. **Share** — Generate a share link for any saved carousel. Anyone with the link can view it.
13. **Clone & Edit** — On a shared carousel page, click "Clone and Edit" to copy it into your editor.
14. **AI Generation** — Premium users: describe your presentation and generate slides with AI (50 credits/month).
15. **Export** — Click "Export PNG" for individual images or "Export PDF" for a combined document.

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

- **1080×1080px** square canvas with 72px outer margins
- **Punchlines** (H2) are always 72px, vertically centered with 60px padding
- **Progress bar** at the bottom scales from first to last slide
- **Logo** configurable position (top-left, top-center, top-right, bottom-right), 110×110px, show/hide toggle
- **Slide counter** in `NN / TT` format on all slides except the cover
- **Max ~30 words per slide** — the design forces brevity

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout with Google Fonts
│   │   ├── page.tsx                # Main editor + preview
│   │   └── s/[id]/page.tsx         # Public shared carousel view
│   ├── components/
│   │   ├── AiDialog.tsx            # AI slide generation dialog (premium)
│   │   ├── AuthModal.tsx           # Login/register modal
│   │   ├── LogoSettings.tsx        # Logo config + premium upload UI
│   │   ├── MyCarousels.tsx         # List/load/delete saved carousels
│   │   ├── SaveButton.tsx          # Save carousel with title input
│   │   ├── ShareDialog.tsx         # Generate/copy/revoke share link
│   │   ├── Toast.tsx               # Notification toasts with action buttons
│   │   ├── UpgradePrompt.tsx       # Premium gate component
│   │   ├── UserMenu.tsx            # Guest Login/Register or avatar dropdown
│   │   ├── LogoSVG.tsx             # Customizable logo component
│   │   ├── SlideEditor.tsx         # Per-slide form editor
│   │   ├── ThemePicker.tsx         # Color scheme + font + invert toggle
│   │   └── slides/
│   │       ├── CoverSlide.tsx
│   │       ├── ContentB1Slide.tsx
│   │       ├── ContentB2Slide.tsx
│   │       ├── ListSlide.tsx
│   │       ├── CtaSlide.tsx
│   │       ├── SlideCanvas.tsx
│   │       └── slideStyles.css
│   └── lib/
│       ├── types.ts                # TypeScript types
│       ├── themes.ts               # Color schemes + font pairings
│       ├── utils.ts                # Slide factory + helpers
│       ├── export.ts               # PNG/PDF export utilities
│       ├── api.ts                  # Backend API client
│       ├── auth.tsx                # Auth context (AuthProvider + useAuth)
│       └── analytics.ts            # PostHog analytics
│
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                     # FastAPI app, CORS, lifespan
│   ├── config.py                   # Pydantic settings
│   ├── database.py                 # Async engine, session, Base
│   ├── models.py                   # User (fastapi-users) + Carousel
│   ├── schemas.py                  # Pydantic request/response models
│   ├── users.py                    # fastapi-users JWT auth setup
│   └── routers/
│       ├── __init__.py
│       ├── ai.py                   # AI generation + credits (premium)
│       ├── billing.py              # Lemon Squeezy checkout, portal, webhook
│       ├── carousels.py            # CRUD + share/guest/link-guest + public
│       └── upload.py               # Logo upload (premium)
├── alembic/                        # Async migration support
├── alembic.ini
├── requirements.txt
└── Dockerfile

docker-compose.yml                  # Backend + frontend
AGENTS.md                           # Agent guidance
```

## Tech Stack

- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS, html-to-image
- **Backend:** FastAPI, SQLAlchemy 2.0 (async), aiosqlite, Alembic, fastapi-users (JWT), OpenAI, httpx
- **Payments:** Lemon Squeezy
- **Database:** SQLite
- **Infrastructure:** Docker Compose

## API

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/guest` | No | Create guest account, returns JWT |
| POST | `/auth/register` | No | Create full account |
| POST | `/auth/jwt/login` | No | Login (form-urlencoded, returns Bearer token) |
| POST | `/auth/jwt/logout` | Yes | Invalidate token |
| GET | `/auth/me` | Yes | Current user info |
| POST | `/auth/link-guest` | Yes | Merge guest carousels into registered account |
| POST | `/api/carousels` | Yes | Create carousel |
| GET | `/api/carousels` | Yes | List your carousels |
| GET | `/api/carousels/{id}` | Yes | Get carousel |
| PUT | `/api/carousels/{id}` | Yes | Update carousel |
| DELETE | `/api/carousels/{id}` | Yes | Delete carousel |
| POST | `/api/carousels/{id}/share` | Yes | Generate share link |
| DELETE | `/api/carousels/{id}/share` | Yes | Revoke share link |
| GET | `/api/s/{token}` | No | Get shared carousel (public) |
| POST | `/api/billing/checkout` | Yes | Create Lemon Squeezy checkout |
| POST | `/api/billing/portal` | Yes | Customer portal URL |
| POST | `/api/billing/webhook` | Signature | Lemon Squeezy webhook |
| POST | `/api/upload/logo` | Yes+Premium | Upload custom logo (2MB, PNG/JPEG/WebP/GIF) |
| GET | `/api/ai/credits` | Yes | Check AI credits (50/month) |
| POST | `/api/ai/generate` | Yes+Premium | Generate slides via gpt-4o-mini |
| GET | `/health` | No | Health check |

## License

MIT

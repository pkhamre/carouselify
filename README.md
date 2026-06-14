# carouselify

Create beautiful, design-consistent LinkedIn carousels in minutes. Built with a monorepo architecture: Next.js 15 frontend + FastAPI backend + PostgreSQL.

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
- **Save & Share** — Create an account, save your carousels, and share them via a public view-only link
- **Clone & Edit** — Open any shared carousel and clone it into your own editor session

## Getting Started

### Prerequisites

- Docker and Docker Compose (recommended)
- Node.js 20.9+ and Python 3.12+ (for local dev without Docker)

### Quick Start (Docker)

```bash
docker compose up --build
```

Open [http://localhost:3000](http://localhost:3000). This starts postgres, the backend API on port 8000, and the frontend on port 3000.

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
npm run dev
```

**Database:** Requires a PostgreSQL instance. Override via `DATABASE_URL` env var (default: `postgresql+asyncpg://carouselify:carouselify@localhost:5432/carouselify`).

### Production Frontend Build

```bash
cd frontend
npm run build
npm start
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

1. **Pick a theme** — Choose a color scheme and font pairing from the sidebar
2. **Customize your logo** — Set the letter, shape, and position; toggle visibility on/off
3. **Edit slides** — Click through slides in the sidebar and edit content in the right panel
4. **Change slide types** — Use the dropdown to switch between Cover, Content B1, Content B2, List, and CTA
5. **Add/remove slides** — Use the + Add button or × to manage slide count (max 12)
6. **Reorder** — Use ↑/↓ arrows to rearrange slides
7. **Save** — Create an account to save your carousel. Saved carousels can be updated.
8. **Share** — Generate a share link for your saved carousel. Anyone with the link can view it.
9. **Clone & Edit** — On a shared carousel page, click "Clone and Edit" to copy it into your editor.
10. **Export** — Click "Export PNG" for individual images or "Export PDF" for a combined document.

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
│   │   ├── AuthModal.tsx           # Login/register modal
│   │   ├── SaveButton.tsx          # Save carousel to backend
│   │   ├── ShareDialog.tsx         # Generate/copy/revoke share link
│   │   ├── Toast.tsx               # Notification toasts
│   │   ├── LogoSVG.tsx             # Customizable logo component
│   │   ├── LogoSettings.tsx        # Logo letter + shape picker
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
│       └── carousels.py            # CRUD + share/revoke + public endpoint
├── alembic/                        # Async migration support
├── alembic.ini
├── requirements.txt
└── Dockerfile

docker-compose.yml                  # Postgres + backend + frontend
AGENTS.md                           # Agent guidance
```

## Tech Stack

- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS, html-to-image
- **Backend:** FastAPI, SQLAlchemy 2.0 (async), asyncpg, Alembic, fastapi-users (JWT)
- **Database:** PostgreSQL 18
- **Infrastructure:** Docker Compose

## API

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | No | Create account |
| POST | `/auth/jwt/login` | No | Login (returns Bearer token) |
| POST | `/auth/jwt/logout` | Yes | Invalidate token |
| GET | `/auth/me` | Yes | Current user info |
| POST | `/api/carousels` | Yes | Create carousel |
| GET | `/api/carousels` | Yes | List your carousels |
| GET | `/api/carousels/{id}` | Yes | Get carousel |
| PUT | `/api/carousels/{id}` | Yes | Update carousel |
| DELETE | `/api/carousels/{id}` | Yes | Delete carousel |
| POST | `/api/carousels/{id}/share` | Yes | Generate share link |
| DELETE | `/api/carousels/{id}/share` | Yes | Revoke share link |
| GET | `/api/s/{token}` | No | Get shared carousel (public) |
| GET | `/health` | No | Health check |

## License

MIT

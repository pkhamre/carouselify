# carouselify

Create beautiful, design-consistent LinkedIn carousels in minutes. Built with Next.js 15, following a strict design system extracted from professional carousels.

## Features

- **4 slide types** — Cover, Content (Big Punchline / Two-part Headline), Bullet List, CTA/Closing
- **10 color schemes** — Original, Ocean, Forest, Citrus, Bubblegum, Electric Mint, Lavender Pop, Tangerine Dream, Cerulean, Custom
- **4 font pairings** — Original, Classic Editorial, Friendly, Playful
- **Customizable logo** — Choose any letter with a blob-shaped brand mark
- **Inverted color mode** — Toggle to swap background and text colors
- **Flexible slide count** — Up to 12 slides with add, remove, and reorder
- **Export** — Download as individual PNG files or a single PDF
- **1080×1080px canvas** — Optimized for LinkedIn's square format, exported at 2x for crisp display
- **Progress bar** — Bottom accent bar scales with slide position

## Getting Started

### Prerequisites

- Node.js 20.9+ (or Docker for containerized development)
- npm

### Installation

```bash
cd linkedin-carousel
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production Build

```bash
npm run build
npm start
```

### Production Build in a Subdirectory (recommended for `/carouselify`)

Set `NEXT_BASE_PATH` at build and runtime so routes and static assets are prefixed correctly.

```bash
NEXT_BASE_PATH=/carouselify npm run build
NEXT_BASE_PATH=/carouselify npm start
```

If you use a reverse proxy (Nginx/Caddy/Traefik), forward both:

- `/carouselify`
- `/carouselify/_next/*`

### Static Export Build (no Node.js server)

Generate a fully static site in `out/`:

```bash
NEXT_BASE_PATH=/carouselify NEXT_OUTPUT=export npm run build
```

Then deploy the `out/` directory to your static host or web server document root.

Notes:

- Keep `NEXT_BASE_PATH` the same between build and hosting path.
- For root hosting, omit `NEXT_BASE_PATH`.
- Static export artifact is `out/` (not `.next/`).

---

### Docker (Alternative)

#### Development (hot-reload)

```bash
docker compose up --build
```

Open [http://localhost:3000](http://localhost:3000). Code changes are reflected immediately via mounted volumes.

#### Production

```bash
docker build --target runner -t linkedin-carousel:latest .
docker run -p 3000:3000 -e NEXT_BASE_PATH=/carouselify linkedin-carousel:latest
```

The production image uses Next.js [standalone output](https://nextjs.org/docs/pages/building-your-application/deploying#docker-image) for a minimal footprint and runs as a non-root `nextjs` user.

| Stage | Purpose |
|-------|---------|
| `base` | `node:24-alpine` foundation |
| `deps` | Install dependencies (`npm ci`) |
| `dev` | Hot-reload dev server with source mounts |
| `builder` | Compile with `NEXT_OUTPUT=standalone` |
| `runner` | Minimal production image (non-root) |

## Usage

1. **Pick a theme** — Choose a color scheme and font pairing from the sidebar
2. **Customize your logo** — Set the letter and shape for the top-right brand mark
3. **Edit slides** — Click through slides in the sidebar and edit content in the right panel
4. **Change slide types** — Use the dropdown to switch between Cover, Content, List, and CTA
5. **Add/remove slides** — Use the + Add button or × to manage slide count (5–12)
6. **Reorder** — Use ↑/↓ arrows to rearrange slides
7. **Export** — Click "Export PNG" for individual images or "Export PDF" for a combined document

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
- **Logo** positioned top-right, 110×110px
- **Slide counter** in `NN / TT` format on all slides except the cover
- **Max ~30 words per slide** — the design forces brevity

See [DESIGN.md](DESIGN.md) for the full design specification.

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with Google Fonts
│   └── page.tsx            # Main app (editor + preview)
├── components/
│   ├── LogoSVG.tsx         # Customizable logo component
│   ├── LogoSettings.tsx    # Logo letter + shape picker
│   ├── SlideEditor.tsx     # Per-slide form editor
│   ├── ThemePicker.tsx     # Color scheme + font + invert toggle
│   └── slides/
│       ├── CoverSlide.tsx
│       ├── ContentB1Slide.tsx
│       ├── ContentB2Slide.tsx
│       ├── ListSlide.tsx
│       ├── CtaSlide.tsx
│       ├── SlideCanvas.tsx
│       └── slideStyles.css
└── lib/
    ├── types.ts            # TypeScript types
    ├── themes.ts           # Color schemes + font pairings
    ├── utils.ts            # Slide factory + helpers
    └── export.ts           # PNG + PDF export utilities
```

## Tech Stack

- **Next.js 15** — App Router, Turbopack
- **TypeScript** — Full type safety
- **Tailwind CSS** — App UI styling
- **html2canvas** — Canvas-to-image export
- **jsPDF** — PDF generation

## License

MIT

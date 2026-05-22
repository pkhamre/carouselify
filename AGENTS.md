# carouselify — agent guidance

## Commands
- `npm run dev` — Turbopack dev server
- `npm run build` — production build (primary verification)
- `npm run start` — production server
- `npm run lint` — ESLint via `next lint`

## Architecture
- Single-page Next.js 15 App Router app. Only route is `/` → `src/app/page.tsx`.
- No auth, no backend, no AI. Pure client-side carousel editor.
- Tailwind `darkMode: "class"` — toggle `class="dark"` on `<html>` for app UI only (slides unaffected).
- UI accent color is `sky-600` everywhere.

## Slide system
- 5 slide types: `cover`, `content-b1`, `content-b2`, `list`, `cta` (typed as discriminated union `Slide`).
- All slide components accept `scheme`, `fonts`, `logo`, `slideNumber`, `totalSlides`.
- Slide canvas: 1080×1080px, 72px margins, 8px accent bar at bottom (progress line).
- `punchline` spacer pattern: `.punchline-spacer-top` (flex-end) + `.punchline-spacer-bottom` (flex-start) with `flex: 1` each, punchline in middle with `padding: 60px 0`.
- Logo rendered via `{logo.showLogo && <div className="slide-logo slide-logo-${logo.position}">}` in each slide component.
- CTA button: `display: inline-flex; align-items: center; justify-content: center; height: 64px` (NOT line-height — html-to-image doesn't render line-height centering correctly).
- Color schemes are in `src/lib/themes.ts`; Ocean is index 0 (default). Custom scheme auto-derives `textOnAccent`/`bgOnAccent` from `background`.
- 10 schemes, 4 font pairings, 5 blob logo shapes.

## Preview rendering
- Preview is scaled via CSS `transform: scale(0.5)` (desktop) / `scale(0.333)` (mobile) with `transform-origin: top left` on a 1080×1080 inner div.
- Gray wrapper is a plain block (`mx-auto max-w-[540px]` desktop / `max-w-[360px]` mobile) — no flex centering to avoid height inflation.
- Desktop: 3-column grid (left + preview + right). Mobile below `lg` (1024px): tabbed layout with fixed bottom tab bar.

## Export (html-to-image)
- **Important: first call warms font cache, second call produces real output** — always call `toPng()` twice on the same element.
- Options used: `width: 1080, height: 1080, pixelRatio: 1, cacheBust: true, preferredFontFormat: 'woff2'`.
- Capture source: hidden off-screen div (`position: fixed; left: -9999px; pointer-events: none`) at native 1080×1080.
- Output: `carouselify-01.png`, `carouselify-02.png`, etc.

## Build & deploy
- `NEXT_BASE_PATH` env var for subdirectory deploys (must be set at build + runtime).
- `NEXT_OUTPUT=standalone` or `NEXT_OUTPUT=export` for those modes; otherwise no output config.
- Static export artifact is `out/`; `.next/` + `out/` are gitignored.
- Docker: multi-stage `Dockerfile` (base/deps/dev/builder/runner), `node:24-alpine`, non-root `nextjs` user.

## Files worth knowing
| File | Purpose |
|------|---------|
| `src/app/page.tsx` | All state, layout, tab bar, export hidden container |
| `src/lib/types.ts` | All types, `defaultLogo` |
| `src/lib/themes.ts` | `colorSchemes[0]` = Ocean, `fontPairings` |
| `src/lib/export.ts` | `exportSlideAsPNG` — the double-toPng workaround lives here |
| `src/components/slides/slideStyles.css` | All slide CSS (punchline, CTA pill, logo positions, etc.) |

## Gotchas
- `build` is the only verification command. No separate typecheck step.
- Google Fonts loaded via `<link>` in `layout.tsx`; html-to-image sometimes needs two passes to embed them (see export above).
- `transforms: scale()` on slide doesn't affect layout — the 1080×1080 inner element still occupies layout space, clipped by `overflow: hidden` on the wrapper.
- When adding new slide features, every slide component type must be updated (Cover, ContentB1, ContentB2, List, CTA).

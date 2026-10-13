# carouselify — domain model

Ubiquitous language for the carousel editor. Names here are the seams the code
is organized around; a module's interface lives at its seam.

## Core concepts

- **Carousel** — a user's saved deck. Owner-scoped (`user_id`); the editor's
  full content lives in a single JSON `data` column. This is the persisted
  envelope; see **CarouselDocument** for what's inside `data`.
- **CarouselDocument** — the typed content core of a Carousel (`frontend/src/lib/carouselDocument.ts`).
  Owns `slides`, `scheme`, `schemeIndex`, `fontIndex`, `logo`, `inverted`,
  `designVariant`, and a `version`. A pure module: `hydrate(data)` normalizes
  loose persisted JSON to a well-formed `CarouselContent` (defaulting missing
  fields, clamping out-of-range indices), and `serialize(content)` produces the
  persisted shape. Metadata (`id`, `title`, share state, showcase status) lives
  in the editor's React state, not the document. Persisted shape historically
  has no `version`; `hydrate` now stamps `version: 1` on load.
- **Slide** — one of 5 discriminated types (`cover`, `content-b1`, `content-b2`,
  `list`, `cta`) composing a CarouselDocument.
- **Scheme** — a color palette (name + 6 hex fields); one of 10 presets indexed
  by `schemeIndex`, or a custom scheme. **Fonts** are referenced by index into
  the 4 presets (the full pairing is never persisted).
- **CarouselStore** — fetch-only access to Carousels by ownership
  (`backend/app/carousel_store.py`). `get_owned(carousel_id, user_id)`
  returns the Carousel only if it belongs to the user, else `None`; handlers
  raise the 404. The single place the ownership predicate lives.
- **Entitlements** — the AI-credit tier policy (`backend/app/entitlements.py`):
  guest (5), registered (10), premium/admin (100/month with a reset window).
  `balance`, `check`, `deduct` centralize the policy that was once scattered.
  `deduct` mutates the user; the calling handler commits.
- **ShowcaseItem** — a public gallery row shaped from a showcased Carousel:
  id, title, showcase_author, share_token, created_at, slide_count, like_count.
  `list_showcase_items(session, include_unshared=False)`
  (`backend/app/showcase_items.py`) builds them in one pass (no N+1 like queries).

## Lifecycle

- **Guest** — an anonymous user created on first visit (email
  `@carouselify.app`), not shown as logged-in in the UI. Guest Carousels merge
  into a registered account on signup (`link-guest`).
- **Share** — publishing a Carousel to a public read-only URL keyed by
  `share_token`; the token is the access credential (no further ownership gate
  on `/api/s/{token}`).
- **Showcase** — a Carousel marked `showcased`, optionally with an author byline;
  appears in the public gallery. Publishing auto-creates a `share_token`.
- **Track event** — an analytics `Event` row written via `track_event`.
  `track_event` only `session.add`s; the calling handler owns the commit.

## Architecture vocabulary

- **Module / interface / implementation / depth / seam / adapter / leverage / locality**
  — see `.agents/skills/codebase-design`. Changes concentrate in these deep
  modules; callers stay thin.

# Carousel Content Prompt Guide

This document describes the 5 slide types in the carousel editor so you can ask an LLM to generate content for a complete carousel.

## Overall constraints

- Each slide is a **1080×1080px square** with **72px margins**
- **Max ~30 words per slide** — the design is spacious and typography-heavy
- Punchline (the big emphasis text) is **72px, bold**, vertically centered in the slide
- A **progress bar** at the bottom spans from first slide to last
- A **logo** sits in a configurable position (top-left, top-center, top-right, bottom-right), optionally hidden
- A **slide counter** (`01 / 05`) appears on every slide except the cover

---

## Slide types

### 1. Cover (opening slide)

| Field | Purpose | Length |
|-------|---------|--------|
| `h1` | Top headline (smaller, ~56px) | 3–6 words |
| `h2` | **Punchline** — big centered statement | 3–8 words, short |
| `caption` | Subtitle at the bottom | 5–12 words |

Cover is special: no slide counter. The accent bar still shows progress.

**Layout:** h1 at top → punchline centered → caption at bottom.

---

### 2. Content B1 — Big Punchline

| Field | Purpose | Length |
|-------|---------|--------|
| `intro` | Small intro line at top | 3–6 words |
| `h2` | **Big centered punchline** | 3–8 words, short |
| `body` | Supporting text at bottom | 10–20 words |

Punchline is the hero. Intro and body are smaller supporting text.

**Layout:** intro at top → punchline centered → body at bottom.

---

### 3. Content B2 — Two-part Headline

| Field | Purpose | Length |
|-------|---------|--------|
| `h1` | Dark headline at top (~56px) | 3–8 words |
| `h2` | **Accent-colored punchline** (contrast with h1) | 3–8 words |
| `body` | Supporting text at bottom | 10–20 words |

h1 + h2 form a two-line headline where the second line is the accent punchline.

**Layout:** h1 at top → punchline centered → body at bottom.

---

### 4. List — Three bullet points

| Field | Purpose | Length |
|-------|---------|--------|
| `intro` | Small intro line at top | 3–6 words |
| `h2` | **Section punchline** | 3–8 words |
| `items` | Exactly 3 bullet points | 4–8 words each |

Each bullet renders with a `●` accent-colored dot.

**Layout:** intro at top → punchline centered → 3 bullet points at bottom.

---

### 5. CTA — Closing call to action

| Field | Purpose | Length |
|-------|---------|--------|
| `h1` | **Big punchline** (the closing message) | 3–8 words |
| `ctaText` | Button text shown in a pill | 2–5 words |
| `body` | Small supporting text below button | 8–15 words |

CTA uses **inverted colors** (accent background, light text). The button pill has dark text.

**Layout:** (top spacer) → punchline centered → button pill → body text at bottom.

---

## Example carousel structure (7 slides)

| # | Type | Content |
|---|------|---------|
| 1 | Cover | Hook + punchline + subtitle |
| 2 | Content B1 | Problem statement |
| 3 | Content B2 | The big idea |
| 4 | List | 3 key points |
| 5 | Content B1 | Supporting argument |
| 6 | List | 3 action steps |
| 7 | CTA | Closing + call to action |

---

## Example LLM prompt

> Generate a 7-slide LinkedIn carousel about [TOPIC]. Use the following slide types in order: Cover, Content B1, Content B2, List, Content B1, List, CTA. For each slide, provide the exact field values based on the schema below. Keep text concise — max ~30 words per slide.
>
> **Cover**: { h1, h2, caption }
> **Content B1**: { intro, h2 (punchline), body }
> **Content B2**: { h1, h2 (punchline), body }
> **List**: { intro, h2 (punchline), items[] (exactly 3) }
> **CTA**: { h1 (punchline), ctaText (button text), body }

---
name: carouselify
description: Professional carousel editor with confident restraint and purposeful color
colors:
  accent: "#0A7EAD"
  accent-hover: "#086A92"
  surface: "#F9FAFB"
  surface-raised: "#FFFFFF"
  surface-sunken: "#F3F4F6"
  surface-dark: "#111827"
  surface-dark-raised: "#1F2937"
  surface-dark-sunken: "#030712"
  ink: "#111827"
  ink-muted: "#6B7280"
  ink-faint: "#9CA3AF"
  ink-inverse: "#F9FAFB"
  border: "#E5E7EB"
  border-strong: "#D1D5DB"
  border-dark: "#374151"
  border-dark-strong: "#4B5563"
  danger: "#DC2626"
  danger-surface: "#FEF2F2"
  success: "#16A34A"
  success-surface: "#F0FDF4"
  selection-bg: "#EFF6FF"
  selection-border: "#BFDBFE"
  selection-bg-dark: "#1E3A5F"
  selection-border-dark: "#2563EB"
typography:
  display:
    fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: "normal"
  body:
    fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "0.025em"
    textTransform: "uppercase"
  data:
    fontFamily: "ui-monospace, 'Cascadia Code', 'Fira Code', monospace"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  sm: "6px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  pill: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.ink-inverse}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
    textColor: "{colors.ink-inverse}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-secondary:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink-muted}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  input:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
  card:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    padding: "16px"
---

# Design System: carouselify

## 1. Overview

**Creative North Star: "The Design Instrument"**

A carousel editor is a tool for making visual work. The interface should feel like a well-built instrument: precise, responsive, confident. Every interaction is deliberate, nothing is decorative, and the output speaks for itself. The editor chrome disappears into the task, leaving the slide canvas as the hero.

The system explicitly rejects the generic SaaS admin template (identical card grids, gray-on-gray, sky-600 everywhere) and the Canva-style template browser (cluttered, everything-at-once, no clear path). Confidence comes from restraint: clean surfaces, one accent used with purpose, consistent component vocabulary.

**Key Characteristics:**
- Restrained palette: neutral surfaces, one accent for actions and selection
- System typography: no decorative fonts in the editor chrome
- Flat surfaces with subtle shadows only on elevated panels
- Consistent component vocabulary: same button, same input, same card everywhere
- Speed as feature: no loading screens between actions, no unnecessary confirmations

## 2. Colors

A restrained palette where neutral surfaces provide the stage and one accent color signals action.

### Primary

- **Accent Blue** (#0A7EAD): Primary action buttons, active tab indicators, selection borders, focus rings. Used on approximately 5-8% of any given screen. Its restraint is the point.

### Neutral

- **Surface** (#F9FAFB): Main content background in light mode. The canvas on which cards sit.
- **Surface Raised** (#FFFFFF): Cards, panels, inputs, dropdowns. The default container color.
- **Surface Sunken** (#F3F4F6): Inactive areas, disabled states, subtle background differentiation.
- **Ink** (#111827): Primary text. Headings, body copy, labels.
- **Ink Muted** (#6B7280): Secondary text. Descriptions, placeholders, timestamps.
- **Ink Faint** (#9CA3AF): Disabled text, tertiary labels. Minimum contrast for non-essential text.
- **Ink Inverse** (#F9FAFB): Text on accent or dark backgrounds.
- **Border** (#E5E7EB): Default borders on cards, inputs, dividers.
- **Border Strong** (#D1D5DB): Emphasized borders, hover states on bordered elements.

### Dark Mode

- **Surface Dark** (#111827): Main background in dark mode.
- **Surface Dark Raised** (#1F2937): Cards and panels in dark mode.
- **Surface Dark Sunken** (#030712): Deepest background layer.
- **Border Dark** (#374151): Default borders in dark mode.
- **Border Dark Strong** (#4B5563): Emphasized borders in dark mode.

### Semantic

- **Danger** (#DC2626): Delete actions, error states, destructive operations.
- **Danger Surface** (#FEF2F2): Background tints for error messages.
- **Success** (#16A34A): Confirmations, positive states.
- **Success Surface** (#F0FDF4): Background tints for success messages.

### Selection

- **Selection BG** (#EFF6FF): Light blue tint on selected slide list items.
- **Selection Border** (#BFDBFE): Blue border on selected slide list items.
- **Selection BG Dark** (#1E3A5F): Dark mode selection background.
- **Selection Border Dark** (#2563EB): Dark mode selection border.

### Named Rules

**The 8% Rule.** The accent color appears on no more than 8% of any given screen. Its rarity is what makes it signal action. If every element is accented, nothing is.

**The Two-Neutral Rule.** The editor uses exactly two neutral surface colors: one for the background, one for raised panels. A third neutral (sunken) exists but is used sparingly for disabled states and subtle differentiation. More than three neutral layers creates visual noise, not hierarchy.

## 3. Typography

**Display Font:** System UI stack (system-ui, -apple-system, 'Segoe UI', sans-serif)
**Body Font:** System UI stack (same family)
**Label Font:** System UI stack (same family, uppercase + letter-spacing for section labels)
**Mono Font:** ui-monospace, 'Cascadia Code', 'Fira Code', monospace

**Character:** One family, multiple weights. The editor uses system fonts for instant rendering and zero FOUT. Hierarchy comes from weight contrast (400 vs 500 vs 600) and size steps, not from competing typefaces. The slide output uses Google Fonts (Fraunces, Playfair Display, Bitter, Fredoka paired with DM Sans, Inter, Nunito Sans, Lexend Deca) but the editor chrome never does.

### Hierarchy

- **Panel Heading** (600, 1rem/1.5, normal): Section titles in sidebar panels ("Slides", "Theme", "Logo").
- **Label** (500, 0.75rem/1.5, 0.025em spacing, uppercase): Section eyebrows and field labels. Used sparingly.
- **Body** (400, 0.875rem/1.5, normal): Input text, descriptions, list items, general UI copy.
- **Data** (400, 0.8125rem/1.5, monospace): Slide counts, credit counters, technical values.
- **Button** (500, 0.875rem/1.5, normal): All button labels, both primary and secondary.

### Named Rules

**The System Font Rule.** The editor chrome uses system fonts exclusively. Google Fonts are loaded for slide output only. This eliminates FOUT, ensures instant rendering, and keeps the tool feeling like a native application.

**The Weight Hierarchy Rule.** Typography hierarchy is expressed through font weight (400 → 500 → 600), not through size alone. The size scale is tight (0.75 → 0.8125 → 0.875 → 1rem) because product UI needs density, not display drama.

## 4. Elevation

The system uses restrained shadows on elevated panels. Surfaces are flat at rest. Shadows appear only as a response to state (hover, focus, elevation above the content plane). The editor has three elevation layers: sunken (no shadow), default (no shadow), and raised (subtle shadow for cards, dropdowns, modals).

### Shadow Vocabulary

- **Panel** (`box-shadow: 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)`): Cards, sidebar panels, the preview container. Provides subtle lift above the content surface.
- **Dropdown** (`box-shadow: 0 4px 12px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.08)`): Dropdown menus, autocomplete popups, floating action bars. Floating above the panel layer.
- **Modal** (`box-shadow: 0 12px 40px rgba(0,0,0,0.2), 0 4px 12px rgba(0,0,0,0.1)`): Modal dialogs, toast notifications. Highest elevation, darkest shadow.

### Named Rules

**The Flat-By-Default Rule.** Surfaces are flat at rest. Shadows appear only as a response to state or elevation need. If an element doesn't float above its container, it has no shadow.

## 5. Components

### Buttons

- **Shape:** Gently curved edges (8px radius)
- **Primary:** Accent blue background (#0A7EAD), white text, 8px 16px padding, 500 weight. For the single primary action in any context (Save, Export PDF, Generate share link).
- **Secondary:** White background, gray border, dark text. For alternative actions (Export PNG, Update, Copy).
- **Ghost:** Transparent background, muted text. For tertiary actions (Cancel, close).
- **Hover:** Primary darkens to accent-hover (#086A92). Secondary gets gray-50 background. Ghost gets gray-100 background.
- **Focus:** 2px focus ring in accent blue with 2px offset. Visible on keyboard navigation.
- **Disabled:** 50% opacity, cursor not-allowed.

### Inputs / Fields

- **Style:** White background, gray-200 border (gray-700 in dark mode), 8px radius, 8px 12px padding.
- **Focus:** 2px focus ring in accent blue, border becomes transparent.
- **Error:** Red border, error message below in danger color.
- **Disabled:** Gray background, muted text.

### Cards / Containers

- **Corner Style:** 16px radius (rounded-xl).
- **Background:** White (surface-raised) in light mode, gray-900 in dark mode.
- **Shadow Strategy:** Panel-level shadow per Elevation section.
- **Border:** 1px solid gray-200 (gray-800 in dark mode).
- **Internal Padding:** 16px (spacing-md).

### Slide List Items

- **Default:** No background, hover shows gray-50 (gray-800 in dark mode).
- **Selected:** Light blue background (#EFF6FF), blue border (#BFDBFE). In dark mode: #1E3A5F background, #2563EB border.
- **Thumbnail:** 64px square, 6px radius, overflow hidden with scaled slide canvas inside.

### Toggle Switches

- **Track:** 48px wide, 28px tall, full radius (pill).
- **Active:** Accent blue background, white thumb shifted right.
- **Inactive:** Gray-300 background (gray-600 in dark mode), white thumb at left.

### Tabs (Mobile Bottom Bar)

- **Active:** Accent blue text, 2px top border in accent blue, light blue background.
- **Inactive:** Muted text, no border, transparent background.

## 6. Do's and Don'ts

### Do:

- **Do** use system fonts for all editor UI. Google Fonts are for slide output only.
- **Do** use the accent blue (#0A7EAD) only for primary actions, selection states, and focus rings. Nothing else.
- **Do** maintain the 8% accent rule. If a screen feels "blue", too many elements are accented.
- **Do** use weight contrast (400 → 500 → 600) for typographic hierarchy, not size alone.
- **Do** keep cards flat with subtle shadows. The shadow is ambient, not structural.
- **Do** use consistent button shapes: same radius (8px), same padding, same weight across all contexts.
- **Do** show keyboard shortcuts in tooltips and aria-labels. Power users rely on them.
- **Do** use skeleton states for loading, not spinners in the middle of content.
- **Do** use the slide canvas as the hero. The editor chrome should disappear around it.

### Don't:

- **Don't** use Fraunces, Playfair Display, or any decorative font in the editor chrome. System fonts only.
- **Don't** use gray text (gray-400, gray-500) on colored backgrounds (sky-50, red-50). Use the background's own darkened hue or a higher-contrast neutral.
- **Don't** make every card identical (white bg, gray border, rounded-xl, p-4). Vary surface temperature between panels to create hierarchy.
- **Don't** use gradient text, glassmorphism, or decorative blur effects anywhere in the editor.
- **Don't** add decorative motion that doesn't convey state change. Transitions are 150-250ms and purposeful.
- **Don't** use modal dialogs as the first thought. Inline and progressive alternatives first.
- **Don't** reinvent standard affordances. Native `<select>`, native `<dialog>`, native color picker.
- **Don't** use arbitrary z-index values (z-[100], z-[999]). Use a semantic scale: dropdown (z-40), sticky (z-30), modal-backdrop (z-50), modal (z-50), toast (z-[100]).
- **Don't** ship with missing interactive states. Every button, input, and toggle needs default, hover, focus, active, and disabled.

import type { Slide, SlideType } from "./types";

export function generateId(): string {
  return `slide-${crypto.randomUUID()}`;
}

export function createSlide(type: SlideType, index: number): Slide {
  const id = generateId();
  switch (type) {
    case "cover":
      return { id, type: "cover", h1: "", h2: "", caption: "" };
    case "content-b1":
      return {
        id, type: "content-b1",
        intro: "The golden rule:",
        h2: "One idea per slide",
        body: "Your audience's attention is limited. Each slide should communicate exactly one main idea — anything else is noise.",
      };
    case "content-b2":
      return {
        id, type: "content-b2",
        h1: "Typography",
        h2: "Choose fonts with purpose",
        body: "Pair a bold display font for headings with a clean body font. Two is enough; three is too many.",
      };
    case "list":
      return {
        id, type: "list",
        intro: "Three questions to ask yourself:",
        h2: "Before you publish",
        items: [
          "Does the headline grab attention?",
          "Is the message clear at a glance?",
          "Does the ending drive action?",
        ],
      };
    case "cta":
      return {
        id, type: "cta",
        h1: "Ready to make your own?",
        ctaText: "Start editing",
        body: "Change the text, pick a new color scheme, and export when you're done.",
      };
  }
}

export function createDefaultSlides(): Slide[] {
  return [createSlide("cover", 0)];
}

export function getSlideLabel(type: SlideType): string {
  const labels: Record<SlideType, string> = {
    cover: "Cover",
    "content-b1": "Content (Punchline)",
    "content-b2": "Content (Two-part)",
    list: "List",
    cta: "CTA / Closing",
  };
  return labels[type];
}

import type { Slide, SlideType } from "./types";

let idCounter = 0;

export function generateId(): string {
  idCounter++;
  return `slide-${Date.now()}-${idCounter}`;
}

export function createSlide(type: SlideType, index: number): Slide {
  const id = generateId();
  switch (type) {
    case "cover":
      return {
        id,
        type: "cover",
        h1: "Your headline goes here",
        h2: "The punchline hooks them",
        caption: "A brief caption that adds context and makes them want to read more.",
      };
    case "content-b1":
      return {
        id,
        type: "content-b1",
        intro: "Here's the thing nobody tells you:",
        h2: "It changes everything",
        body: "This is the supporting explanation that makes it click.",
      };
    case "content-b2":
      return {
        id,
        type: "content-b2",
        h1: "The setup topic",
        h2: "The bold payoff",
        body: "Supporting text that explains why this matters to the reader.",
      };
    case "list":
      return {
        id,
        type: "list",
        intro: "Three things you need to know:",
        h2: "The key insight",
        items: [
          "First important point",
          "Second important point",
          "Third important point",
        ],
      };
    case "cta":
      return {
        id,
        type: "cta",
        h1: "Ready to take action?",
        ctaText: "Follow for more",
        body: "Drop a comment if this resonated with you.",
      };
  }
}

export function createDefaultSlides(): Slide[] {
  return [
    createSlide("cover", 0),
    createSlide("content-b1", 1),
    createSlide("content-b2", 2),
    createSlide("list", 3),
    createSlide("cta", 4),
  ];
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

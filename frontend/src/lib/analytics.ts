import posthog from "posthog-js";

let initialized = false;

function initPostHog() {
  if (initialized) return;
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return;
  posthog.init(key, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com",
    capture_pageview: false,
    autocapture: false,
  });
  initialized = true;
}

function posthogCapture(event: string, properties?: Record<string, any>) {
  try {
    initPostHog();
    if (initialized) {
      posthog.capture(event, properties);
    }
  } catch {
    // analytics is optional
  }
}

export function captureExport(slideCount: number) {
  posthogCapture("export_completed", { slide_count: slideCount });
}

export function captureSave(slideCount: number) {
  posthogCapture("carousel_saved", { slide_count: slideCount });
}

export function captureShare() {
  posthogCapture("carousel_shared");
}

export function captureAiGenerate(slideCount: number) {
  posthogCapture("ai_generated", { slide_count: slideCount });
}

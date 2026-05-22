import posthog from "posthog-js";

let initialized = false;

function initPostHog() {
  if (initialized) return;
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key || typeof window === "undefined") return;
  posthog.init(key, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com",
    capture_pageview: false,
    autocapture: false,
  });
  initialized = true;
}

export function captureExport(slideCount: number) {
  try {
    initPostHog();
    if (initialized) {
      posthog.capture("export_completed", { slide_count: slideCount });
    }
  } catch {
    // analytics is optional
  }
}

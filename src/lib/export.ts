import { toPng, getFontEmbedCSS } from "html-to-image";

const PNG_OPTIONS = {
  width: 1080,
  height: 1080,
  pixelRatio: 1,
  cacheBust: true,
  preferredFontFormat: "woff2" as const,
};

let fontEmbedCSSPromise: Promise<string> | null = null;

export async function exportSlideAsPNG(element: HTMLElement, index: number): Promise<void> {
  // Pre-compute font embedding CSS once for the batch.
  // This fetches font files from Google Fonts and embeds them as base64 data URLs
  // so the export doesn't need to do it live (which can fail silently).
  if (!fontEmbedCSSPromise) {
    fontEmbedCSSPromise = getFontEmbedCSS(element);
  }
  const fontEmbedCSS = await fontEmbedCSSPromise;

  const dataUrl = await toPng(element, { ...PNG_OPTIONS, fontEmbedCSS });

  const filename = `carouselify-${String(index + 1).padStart(2, "0")}.png`;
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

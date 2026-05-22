import { toPng } from "html-to-image";

const PNG_OPTIONS = {
  width: 1080,
  height: 1080,
  pixelRatio: 1,
  cacheBust: true,
  preferredFontFormat: "woff2" as const,
};

export async function exportSlideAsPNG(element: HTMLElement, index: number): Promise<void> {
  // First call loads and caches external resources (fonts etc.) into the library's
  // internal cache. Second call uses the cache to produce the real output.
  await toPng(element, PNG_OPTIONS);
  const dataUrl = await toPng(element, PNG_OPTIONS);

  const filename = `carouselify-${String(index + 1).padStart(2, "0")}.png`;
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

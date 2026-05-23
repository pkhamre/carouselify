import { toPng, getFontEmbedCSS } from "html-to-image";
export { getFontEmbedCSS };

const PNG_OPTIONS = {
  width: 1080,
  height: 1080,
  pixelRatio: 1,
  cacheBust: true,
  preferredFontFormat: "woff2" as const,
};

export async function exportSlideAsPNG(
  element: HTMLElement,
  index: number,
  fontEmbedCSS: string,
): Promise<void> {
  const dataUrl = await toPng(element, { ...PNG_OPTIONS, fontEmbedCSS });

  const filename = `carouselify-${String(index + 1).padStart(2, "0")}.png`;
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

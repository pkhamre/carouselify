import type { Slide, ColorScheme, FontPairing, LogoConfig } from "@/lib/types";
import { SlideRenderer } from "./SlideRenderer";

interface SlideCanvasProps {
  slide: Slide;
  scheme: ColorScheme;
  fonts: FontPairing;
  logo: LogoConfig;
  slideNumber: number;
  totalSlides: number;
  readOnly?: boolean;
}

export function SlideCanvas(props: SlideCanvasProps) {
  return <SlideRenderer {...props} />;
}

import type { Slide, ColorScheme, FontPairing } from "@/lib/types";
import { CoverSlideComponent } from "./CoverSlide";
import { ContentB1SlideComponent } from "./ContentB1Slide";
import { ContentB2SlideComponent } from "./ContentB2Slide";
import { ListSlideComponent } from "./ListSlide";
import { CtaSlideComponent } from "./CtaSlide";

interface SlideCanvasProps {
  slide: Slide;
  scheme: ColorScheme;
  fonts: FontPairing;
  slideNumber: number;
  totalSlides: number;
}

export function SlideCanvas({
  slide,
  scheme,
  fonts,
  slideNumber,
  totalSlides,
}: SlideCanvasProps) {
  switch (slide.type) {
    case "cover":
      return (
        <CoverSlideComponent
          slide={slide}
          scheme={scheme}
          fonts={fonts}
          slideNumber={slideNumber}
          totalSlides={totalSlides}
        />
      );
    case "content-b1":
      return (
        <ContentB1SlideComponent
          slide={slide}
          scheme={scheme}
          fonts={fonts}
          slideNumber={slideNumber}
          totalSlides={totalSlides}
        />
      );
    case "content-b2":
      return (
        <ContentB2SlideComponent
          slide={slide}
          scheme={scheme}
          fonts={fonts}
          slideNumber={slideNumber}
          totalSlides={totalSlides}
        />
      );
    case "list":
      return (
        <ListSlideComponent
          slide={slide}
          scheme={scheme}
          fonts={fonts}
          slideNumber={slideNumber}
          totalSlides={totalSlides}
        />
      );
    case "cta":
      return (
        <CtaSlideComponent
          slide={slide}
          scheme={scheme}
          fonts={fonts}
          slideNumber={slideNumber}
          totalSlides={totalSlides}
        />
      );
  }
}

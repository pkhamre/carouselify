import type { Slide, ColorScheme, FontPairing, LogoConfig } from "@/lib/types";
import { CoverSlideComponent } from "./CoverSlide";
import { ContentB1SlideComponent } from "./ContentB1Slide";
import { ContentB2SlideComponent } from "./ContentB2Slide";
import { ListSlideComponent } from "./ListSlide";
import { CtaSlideComponent } from "./CtaSlide";

interface SlideCanvasProps {
  slide: Slide;
  scheme: ColorScheme;
  fonts: FontPairing;
  logo: LogoConfig;
  slideNumber: number;
  totalSlides: number;
  readOnly?: boolean;
}

export function SlideCanvas({
  slide,
  scheme,
  fonts,
  logo,
  slideNumber,
  totalSlides,
  readOnly,
}: SlideCanvasProps) {
  switch (slide.type) {
    case "cover":
      return (
        <CoverSlideComponent
          slide={slide}
          scheme={scheme}
          fonts={fonts}
          logo={logo}
          slideNumber={slideNumber}
          totalSlides={totalSlides}
          readOnly={readOnly}
        />
      );
    case "content-b1":
      return (
        <ContentB1SlideComponent
          slide={slide}
          scheme={scheme}
          fonts={fonts}
          logo={logo}
          slideNumber={slideNumber}
          totalSlides={totalSlides}
          readOnly={readOnly}
        />
      );
    case "content-b2":
      return (
        <ContentB2SlideComponent
          slide={slide}
          scheme={scheme}
          fonts={fonts}
          logo={logo}
          slideNumber={slideNumber}
          totalSlides={totalSlides}
          readOnly={readOnly}
        />
      );
    case "list":
      return (
        <ListSlideComponent
          slide={slide}
          scheme={scheme}
          fonts={fonts}
          logo={logo}
          slideNumber={slideNumber}
          totalSlides={totalSlides}
          readOnly={readOnly}
        />
      );
    case "cta":
      return (
        <CtaSlideComponent
          slide={slide}
          scheme={scheme}
          fonts={fonts}
          logo={logo}
          slideNumber={slideNumber}
          totalSlides={totalSlides}
          readOnly={readOnly}
        />
      );
  }
}

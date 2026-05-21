import type { CoverSlide, ColorScheme, FontPairing } from "@/lib/types";
import { LogoSVG } from "@/components/LogoSVG";

interface CoverSlideComponentProps {
  slide: CoverSlide;
  scheme: ColorScheme;
  fonts: FontPairing;
  slideNumber: number;
  totalSlides: number;
}

export function CoverSlideComponent({ slide, scheme, fonts, slideNumber, totalSlides }: CoverSlideComponentProps) {
  const progress = (slideNumber / totalSlides) * 100;

  return (
    <div
      className="slide-canvas"
      style={{
        backgroundColor: scheme.background,
        fontFamily: fonts.body,
      }}
    >
      <div className="slide-logo">
        <LogoSVG scheme={scheme} />
      </div>

      <div className="slide-content">
        <div className="punchline-spacer-top">
          <h1
            className="cover-h1"
            style={{
              fontFamily: fonts.display,
              color: scheme.textPrimary,
            }}
          >
            {slide.h1}
          </h1>
        </div>

        <h2
          className="punchline"
          style={{
            fontFamily: fonts.display,
            color: scheme.accent,
          }}
        >
          {slide.h2}
        </h2>

        <div className="punchline-spacer-bottom">
          <p
            className="cover-caption"
            style={{
              fontFamily: fonts.body,
              color: scheme.textPrimary,
            }}
          >
            {slide.caption}
          </p>
        </div>
      </div>

      <div
        className="accent-bar"
        style={{
          backgroundColor: scheme.accent,
          width: `${progress}%`,
        }}
      />
    </div>
  );
}

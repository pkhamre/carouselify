import type { CtaSlide, ColorScheme, FontPairing } from "@/lib/types";
import { LogoSVG } from "@/components/LogoSVG";

interface CtaSlideComponentProps {
  slide: CtaSlide;
  scheme: ColorScheme;
  fonts: FontPairing;
  slideNumber: number;
  totalSlides: number;
}

export function CtaSlideComponent({
  slide,
  scheme,
  fonts,
  slideNumber,
  totalSlides,
}: CtaSlideComponentProps) {
  const counter = `${String(slideNumber).padStart(2, "0")} / ${String(totalSlides).padStart(2, "0")}`;

  return (
    <div
      className="slide-canvas"
      style={{
        backgroundColor: scheme.accent,
        fontFamily: fonts.body,
      }}
    >
      <div className="slide-logo">
        <LogoSVG scheme={scheme} isInverted />
      </div>

      <div className="slide-content">
        <div className="cta-spacer-top" />

        <h1
          className="cta-h1"
          style={{
            fontFamily: fonts.display,
            color: scheme.textOnAccent,
          }}
        >
          {slide.h1}
        </h1>

        <div className="cta-spacer-mid" />

        <div
          className="cta-pill"
          style={{
            backgroundColor: scheme.bgOnAccent,
            color: scheme.textPrimary,
            fontFamily: fonts.body,
          }}
        >
          {slide.ctaText}
        </div>

        <div className="cta-spacer-bottom" />

        <p
          className="cta-body"
          style={{
            fontFamily: fonts.body,
            color: scheme.textOnAccent,
          }}
        >
          {slide.body}
        </p>
      </div>

      <div
        className="slide-counter"
        style={{
          fontFamily: fonts.body,
          color: scheme.textOnAccent,
        }}
      >
        {counter}
      </div>

      <div
        className="accent-bar"
        style={{ backgroundColor: scheme.textOnAccent }}
      />
    </div>
  );
}

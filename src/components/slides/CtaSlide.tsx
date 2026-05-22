import type { CtaSlide, ColorScheme, FontPairing, LogoConfig } from "@/lib/types";
import { LogoSVG } from "@/components/LogoSVG";

interface CtaSlideComponentProps {
  slide: CtaSlide;
  scheme: ColorScheme;
  fonts: FontPairing;
  logo: LogoConfig;
  slideNumber: number;
  totalSlides: number;
}

export function CtaSlideComponent({
  slide,
  scheme,
  fonts,
  logo,
  slideNumber,
  totalSlides,
}: CtaSlideComponentProps) {
  const counter = `${String(slideNumber).padStart(2, "0")} / ${String(totalSlides).padStart(2, "0")}`;
  const progress = (slideNumber / totalSlides) * 100;

  return (
    <div
      className="slide-canvas"
      style={{
        backgroundColor: scheme.accent,
        fontFamily: fonts.body,
      }}
    >
      {logo.showLogo && (
        <div className={`slide-logo slide-logo-${logo.position}`}>
          <LogoSVG scheme={scheme} fonts={fonts} letter={logo.letter} shape={logo.shape} isInverted />
        </div>
      )}

      <div className="slide-content">
        <div className="punchline-spacer-top" />

        <h1
          className="punchline cta-punchline"
          style={{
            fontFamily: fonts.display,
            color: scheme.textOnAccent,
          }}
        >
          {slide.h1}
        </h1>

        <div className="punchline-spacer-bottom">
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
        style={{
          backgroundColor: scheme.bgOnAccent,
          width: `${progress}%`,
        }}
      />
    </div>
  );
}

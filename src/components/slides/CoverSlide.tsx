import type { CoverSlide, ColorScheme, FontPairing } from "@/lib/types";
import { LogoSVG } from "@/components/LogoSVG";

interface CoverSlideComponentProps {
  slide: CoverSlide;
  scheme: ColorScheme;
  fonts: FontPairing;
}

export function CoverSlideComponent({ slide, scheme, fonts }: CoverSlideComponentProps) {
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
        <div className="cover-spacer-top" />

        <h1
          className="cover-h1"
          style={{
            fontFamily: fonts.display,
            color: scheme.textPrimary,
          }}
        >
          {slide.h1}
        </h1>

        <h2
          className="cover-h2"
          style={{
            fontFamily: fonts.display,
            color: scheme.accent,
          }}
        >
          {slide.h2}
        </h2>

        <div className="cover-spacer-mid" />

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

      <div
        className="accent-bar"
        style={{ backgroundColor: scheme.accent }}
      />
    </div>
  );
}

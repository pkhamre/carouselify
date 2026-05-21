import type { ContentB1Slide, ColorScheme, FontPairing } from "@/lib/types";
import { LogoSVG } from "@/components/LogoSVG";

interface ContentB1SlideComponentProps {
  slide: ContentB1Slide;
  scheme: ColorScheme;
  fonts: FontPairing;
  slideNumber: number;
  totalSlides: number;
}

export function ContentB1SlideComponent({
  slide,
  scheme,
  fonts,
  slideNumber,
  totalSlides,
}: ContentB1SlideComponentProps) {
  const counter = `${String(slideNumber).padStart(2, "0")} / ${String(totalSlides).padStart(2, "0")}`;

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
        <div className="content-spacer-top" />

        <p
          className="content-intro"
          style={{
            fontFamily: fonts.body,
            color: scheme.textPrimary,
          }}
        >
          {slide.intro}
        </p>

        <h2
          className="content-h2"
          style={{
            fontFamily: fonts.display,
            color: scheme.accent,
          }}
        >
          {slide.h2}
        </h2>

        <div className="content-spacer-mid" />

        <p
          className="content-body"
          style={{
            fontFamily: fonts.body,
            color: scheme.textPrimary,
          }}
        >
          {slide.body}
        </p>
      </div>

      <div
        className="slide-counter"
        style={{
          fontFamily: fonts.body,
          color: scheme.textPrimary,
        }}
      >
        {counter}
      </div>

      <div
        className="accent-bar"
        style={{ backgroundColor: scheme.accent }}
      />
    </div>
  );
}

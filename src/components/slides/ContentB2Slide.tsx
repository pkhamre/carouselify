import type { ContentB2Slide, ColorScheme, FontPairing } from "@/lib/types";
import { LogoSVG } from "@/components/LogoSVG";

interface ContentB2SlideComponentProps {
  slide: ContentB2Slide;
  scheme: ColorScheme;
  fonts: FontPairing;
  slideNumber: number;
  totalSlides: number;
}

export function ContentB2SlideComponent({
  slide,
  scheme,
  fonts,
  slideNumber,
  totalSlides,
}: ContentB2SlideComponentProps) {
  const counter = `${String(slideNumber).padStart(2, "0")} / ${String(totalSlides).padStart(2, "0")}`;
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
        <div className="content-spacer-top" />

        <h1
          className="content-h1"
          style={{
            fontFamily: fonts.display,
            color: scheme.textPrimary,
          }}
        >
          {slide.h1}
        </h1>

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
        style={{
          backgroundColor: scheme.accent,
          width: `${progress}%`,
        }}
      />
    </div>
  );
}

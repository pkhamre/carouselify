import type { ContentB1Slide, ColorScheme, FontPairing, LogoConfig } from "@/lib/types";
import { LogoSVG } from "@/components/LogoSVG";

interface ContentB1SlideComponentProps {
  slide: ContentB1Slide;
  scheme: ColorScheme;
  fonts: FontPairing;
  logo: LogoConfig;
  slideNumber: number;
  totalSlides: number;
}

export function ContentB1SlideComponent({
  slide,
  scheme,
  fonts,
  logo,
  slideNumber,
  totalSlides,
}: ContentB1SlideComponentProps) {
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
      {logo.showLogo && (
        <div className={`slide-logo slide-logo-${logo.position}`}>
          <LogoSVG scheme={scheme} fonts={fonts} letter={logo.letter} shape={logo.shape} />
        </div>
      )}

      <div className="slide-content">
        <div className="punchline-spacer-top">
          <p
            className="content-intro"
            style={{
              fontFamily: fonts.body,
              color: scheme.textPrimary,
            }}
          >
            {slide.intro}
          </p>
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
            className="content-body"
            style={{
              fontFamily: fonts.body,
              color: scheme.textPrimary,
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

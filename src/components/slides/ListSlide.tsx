import type { ListSlide, ColorScheme, FontPairing } from "@/lib/types";
import { LogoSVG } from "@/components/LogoSVG";

interface ListSlideComponentProps {
  slide: ListSlide;
  scheme: ColorScheme;
  fonts: FontPairing;
  slideNumber: number;
  totalSlides: number;
}

export function ListSlideComponent({
  slide,
  scheme,
  fonts,
  slideNumber,
  totalSlides,
}: ListSlideComponentProps) {
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

        <ul className="bullet-list">
          {slide.items.map((item, i) => (
            <li key={i} className="bullet-item">
              <span
                className="bullet-marker"
                style={{ backgroundColor: scheme.accent }}
              />
              <span
                className="bullet-text"
                style={{
                  fontFamily: fonts.body,
                  color: scheme.textPrimary,
                }}
              >
                {item}
              </span>
            </li>
          ))}
        </ul>
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

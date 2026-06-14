import type { ListSlide, ColorScheme, FontPairing, LogoConfig } from "@/lib/types";
import { LogoSVG } from "@/components/LogoSVG";

interface ListSlideComponentProps {
  slide: ListSlide;
  scheme: ColorScheme;
  fonts: FontPairing;
  logo: LogoConfig;
  slideNumber: number;
  totalSlides: number;
  readOnly?: boolean;
}

export function ListSlideComponent({
  slide,
  scheme,
  fonts,
  logo,
  slideNumber,
  totalSlides,
  readOnly,
}: ListSlideComponentProps) {
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
        <div className={`slide-logo slide-logo-${logo.position}`} style={{ width: 110 * (logo.size ?? 1), height: 110 * (logo.size ?? 1) }}>
          {logo.isCustom && logo.customUrl ? (
            <img src={logo.customUrl} alt="Logo" className="w-full h-full object-contain" />
          ) : (
            <LogoSVG scheme={scheme} fonts={fonts} letter={logo.letter} shape={logo.shape} />
          )}
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
          <ul className="bullet-list">
            {slide.items.map((item, i) => (
              <li key={i} className="bullet-item" style={{ color: scheme.accent }}>
                <span className="bullet-char">●</span>
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

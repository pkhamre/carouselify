import type { Slide, ColorScheme, FontPairing, LogoConfig } from "@/lib/types";
import { SlideLogo } from "./SlideLogo";

interface SlideRendererProps {
  slide: Slide;
  scheme: ColorScheme;
  fonts: FontPairing;
  logo: LogoConfig;
  slideNumber: number;
  totalSlides: number;
  readOnly?: boolean;
}

// ponytail: single SlideRenderer replaces 5 individual slide components (CoverSlide, ContentB1Slide, ContentB2Slide, ListSlide, CtaSlide)
// ponytail: inner switch is verbose but keeps each type's content independently readable
export function SlideRenderer({ slide, scheme, fonts, logo, slideNumber, totalSlides }: SlideRendererProps) {
  const progress = (slideNumber / totalSlides) * 100;
  const counter = `${String(slideNumber).padStart(2, "0")} / ${String(totalSlides).padStart(2, "0")}`;
  const isCover = slide.type === "cover";
  const isCta = slide.type === "cta";

  return (
    <div
      className="slide-canvas"
      style={{
        backgroundColor: isCta ? scheme.accent : scheme.background,
        fontFamily: fonts.body,
      }}
    >
      <SlideLogo logo={logo} scheme={scheme} fonts={fonts} isInverted={isCta} />

      <div className="slide-content">
        {slide.type === "cover" && (
          <>
            <div className="punchline-spacer-top">
              <h1 className="cover-h1" style={{ fontFamily: fonts.display, color: scheme.textPrimary, opacity: slide.h1 ? 1 : 0.35 }}>
                {slide.h1 || "Your headline here"}
              </h1>
            </div>
            <h2 className="punchline" style={{ fontFamily: fonts.display, color: scheme.accent, opacity: slide.h2 ? 1 : 0.35 }}>
              {slide.h2 || "What's the one thing people should remember?"}
            </h2>
            <div className="punchline-spacer-bottom">
              <p className="cover-caption" style={{ fontFamily: fonts.body, color: scheme.textPrimary, opacity: slide.caption ? 1 : 0.35 }}>
                {slide.caption || "Add a supporting line (optional)"}
              </p>
            </div>
          </>
        )}

        {slide.type === "content-b1" && (
          <>
            <div className="punchline-spacer-top">
              <p className="content-intro" style={{ fontFamily: fonts.body, color: scheme.textPrimary }}>{slide.intro}</p>
            </div>
            <h2 className="punchline" style={{ fontFamily: fonts.display, color: scheme.accent }}>{slide.h2}</h2>
            <div className="punchline-spacer-bottom">
              <p className="content-body" style={{ fontFamily: fonts.body, color: scheme.textPrimary }}>{slide.body}</p>
            </div>
          </>
        )}

        {slide.type === "content-b2" && (
          <>
            <div className="punchline-spacer-top">
              <h1 className="content-h1" style={{ fontFamily: fonts.display, color: scheme.textPrimary }}>{slide.h1}</h1>
            </div>
            <h2 className="punchline" style={{ fontFamily: fonts.display, color: scheme.accent }}>{slide.h2}</h2>
            <div className="punchline-spacer-bottom">
              <p className="content-body" style={{ fontFamily: fonts.body, color: scheme.textPrimary }}>{slide.body}</p>
            </div>
          </>
        )}

        {slide.type === "list" && (
          <>
            <div className="punchline-spacer-top">
              <p className="content-intro" style={{ fontFamily: fonts.body, color: scheme.textPrimary }}>{slide.intro}</p>
            </div>
            <h2 className="punchline" style={{ fontFamily: fonts.display, color: scheme.accent }}>{slide.h2}</h2>
            <div className="punchline-spacer-bottom">
              <ul className="bullet-list">
                {slide.items.map((item, i) => (
                  <li key={i} className="bullet-item" style={{ color: scheme.accent }}>
                    <span className="bullet-char">●</span>
                    <span className="bullet-text" style={{ fontFamily: fonts.body, color: scheme.textPrimary }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        {slide.type === "cta" && (
          <>
            <div className="punchline-spacer-top" />
            <h1 className="punchline cta-punchline" style={{ fontFamily: fonts.display, color: scheme.textOnAccent }}>{slide.h1}</h1>
            <div className="punchline-spacer-bottom">
              <div className="cta-pill" style={{ backgroundColor: scheme.bgOnAccent, color: scheme.textPrimary, fontFamily: fonts.body }}>
                {slide.ctaText}
              </div>
              <p className="cta-body" style={{ fontFamily: fonts.body, color: scheme.textOnAccent }}>{slide.body}</p>
            </div>
          </>
        )}
      </div>

      {!isCover && (
        <div className="slide-counter" style={{ fontFamily: fonts.body, color: isCta ? scheme.textOnAccent : scheme.textPrimary }}>
          {counter}
        </div>
      )}

      <div className="accent-bar" style={{ backgroundColor: isCta ? scheme.bgOnAccent : scheme.accent, width: `${progress}%` }} />
    </div>
  );
}

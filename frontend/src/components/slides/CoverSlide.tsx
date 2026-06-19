import type { CoverSlide, ColorScheme, FontPairing, LogoConfig } from "@/lib/types";
import { LogoSVG } from "@/components/LogoSVG";

interface CoverSlideComponentProps {
  slide: CoverSlide;
  scheme: ColorScheme;
  fonts: FontPairing;
  logo: LogoConfig;
  slideNumber: number;
  totalSlides: number;
  readOnly?: boolean;
}

export function CoverSlideComponent({ slide, scheme, fonts, logo, slideNumber, totalSlides, readOnly }: CoverSlideComponentProps) {
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
          <h1
            className="cover-h1"
            style={{
              fontFamily: fonts.display,
              color: scheme.textPrimary,
              opacity: slide.h1 ? 1 : 0.35,
            }}
          >
            {slide.h1 || "Your headline here"}
          </h1>
        </div>

        <h2
          className="punchline"
          style={{
            fontFamily: fonts.display,
            color: scheme.accent,
            opacity: slide.h2 ? 1 : 0.35,
          }}
        >
          {slide.h2 || "What's the one thing people should remember?"}
        </h2>

        <div className="punchline-spacer-bottom">
          <p
            className="cover-caption"
            style={{
              fontFamily: fonts.body,
              color: scheme.textPrimary,
              opacity: slide.caption ? 1 : 0.35,
            }}
          >
            {slide.caption || "Add a supporting line (optional)"}
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

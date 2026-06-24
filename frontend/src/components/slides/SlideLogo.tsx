import type { ColorScheme, FontPairing, LogoConfig } from "@/lib/types";
import { LogoSVG } from "@/components/LogoSVG";

interface SlideLogoProps {
  logo: LogoConfig;
  scheme: ColorScheme;
  fonts: FontPairing;
  isInverted?: boolean;
}

export function SlideLogo({ logo, scheme, fonts, isInverted }: SlideLogoProps) {
  if (!logo.showLogo) return null;
  return (
    <div className={`slide-logo slide-logo-${logo.position}`} style={{ width: 110 * logo.size, height: 110 * logo.size }}>
      {logo.isCustom && logo.customUrl ? (
        <img src={logo.customUrl} alt="Logo" className="w-full h-full object-contain" />
      ) : (
        <LogoSVG scheme={scheme} fonts={fonts} letter={logo.letter} shape={logo.shape} isInverted={isInverted} />
      )}
    </div>
  );
}

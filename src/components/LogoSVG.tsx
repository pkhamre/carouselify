import type { ColorScheme, FontPairing, LogoShape } from "@/lib/types";
import { logoShapePaths } from "@/lib/logoShapes";

interface LogoSVGProps {
  scheme: ColorScheme;
  fonts: FontPairing;
  letter: string;
  shape?: LogoShape;
  isInverted?: boolean;
}

export function LogoSVG({ scheme, fonts, letter, shape = "blob-1", isInverted = false }: LogoSVGProps) {
  const strokeColor = isInverted ? scheme.textOnAccent : scheme.accent;
  const letterColor = isInverted ? scheme.textOnAccent : scheme.accent;
  const blobPath = logoShapePaths[shape];

  return (
    <svg
      width="110"
      height="110"
      viewBox="0 0 110 110"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d={blobPath}
        stroke={strokeColor}
        strokeWidth="3"
        fill="none"
      />
      <text
        x="55"
        y="68"
        textAnchor="middle"
        fontFamily={fonts.display}
        fontSize="48"
        fontWeight="900"
        fill={letterColor}
      >
        {letter}
      </text>
    </svg>
  );
}

import type { ColorScheme } from "@/lib/types";

interface LogoSVGProps {
  scheme: ColorScheme;
  letter: string;
  shape?: string;
  isInverted?: boolean;
}

const shapePaths: Record<string, string> = {
  blob: "M55 8C35 8 18 22 15 42C12 62 22 82 38 92C54 102 78 98 92 82C106 66 102 38 82 22C72 14 63 8 55 8Z",
  circle: "M55 10A45 45 0 1 0 55 100A45 45 0 1 0 55 10Z",
  square: "M20 20L90 20L90 90L20 90Z",
  rounded: "M20 30C20 24.5 24.5 20 30 20L80 20C85.5 20 90 24.5 90 30L90 80C90 85.5 85.5 90 80 90L30 90C24.5 90 20 85.5 20 80Z",
  diamond: "M55 10L100 55L55 100L10 55Z",
  hexagon: "M55 8L95 30L95 80L55 102L15 80L15 30Z",
  star: "M55 5L65 38L100 38L72 58L82 92L55 72L28 92L38 58L10 38L45 38Z",
  heart: "M55 95C55 95 10 65 10 38C10 22 22 10 38 10C47 10 52 15 55 20C58 15 63 10 72 10C88 10 100 22 100 38C100 65 55 95 55 95Z",
};

export function LogoSVG({ scheme, letter, shape = "blob", isInverted = false }: LogoSVGProps) {
  const strokeColor = isInverted ? scheme.textOnAccent : scheme.accent;
  const letterColor = isInverted ? scheme.textOnAccent : scheme.accent;
  const path = shapePaths[shape] || shapePaths.blob;

  return (
    <svg
      width="110"
      height="110"
      viewBox="0 0 110 110"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d={path}
        stroke={strokeColor}
        strokeWidth="3"
        fill="none"
      />
      <text
        x="55"
        y="68"
        textAnchor="middle"
        fontFamily="Fraunces, serif"
        fontSize="48"
        fontWeight="900"
        fill={letterColor}
      >
        {letter}
      </text>
    </svg>
  );
}

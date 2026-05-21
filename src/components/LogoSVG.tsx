import type { ColorScheme } from "@/lib/types";

interface LogoProps {
  scheme: ColorScheme;
  isInverted?: boolean;
}

export function LogoSVG({ scheme, isInverted = false }: LogoProps) {
  const strokeColor = isInverted ? scheme.textOnAccent : scheme.accent;
  const letterColor = isInverted ? scheme.textOnAccent : scheme.accent;

  return (
    <svg
      width="110"
      height="110"
      viewBox="0 0 110 110"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M55 8C35 8 18 22 15 42C12 62 22 82 38 92C54 102 78 98 92 82C106 66 102 38 82 22C72 14 63 8 55 8Z"
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
        k
      </text>
    </svg>
  );
}

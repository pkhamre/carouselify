"use client";

import type { LogoConfig } from "@/lib/types";
import { defaultLogo } from "@/lib/types";

const shapes = [
  { value: "blob", label: "Blob" },
  { value: "circle", label: "Circle" },
  { value: "square", label: "Square" },
  { value: "rounded", label: "Rounded" },
  { value: "diamond", label: "Diamond" },
  { value: "hexagon", label: "Hexagon" },
  { value: "star", label: "Star" },
  { value: "heart", label: "Heart" },
];

interface LogoSettingsProps {
  logo: LogoConfig;
  onChange: (logo: LogoConfig) => void;
}

export function LogoSettings({ logo, onChange }: LogoSettingsProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <h3 className="font-semibold text-gray-900 mb-4">Logo</h3>

      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
          Letter
        </label>
        <input
          type="text"
          value={logo.letter}
          onChange={(e) => onChange({ ...logo, letter: e.target.value.slice(0, 2) })}
          maxLength={2}
          className="w-16 px-3 py-2 border border-gray-200 rounded-lg text-lg font-bold text-center focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
          Shape
        </label>
        <div className="grid grid-cols-4 gap-2">
          {shapes.map((s) => (
            <button
              key={s.value}
              onClick={() => onChange({ ...logo, shape: s.value })}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all text-xs ${
                logo.shape === s.value
                  ? "border-pink-500 bg-pink-50"
                  : "border-gray-100 hover:border-gray-200"
              }`}
            >
              <svg width="24" height="24" viewBox="0 0 110 110" fill="none">
                <path
                  d={
                    s.value === "blob"
                      ? "M55 8C35 8 18 22 15 42C12 62 22 82 38 92C54 102 78 98 92 82C106 66 102 38 82 22C72 14 63 8 55 8Z"
                      : s.value === "circle"
                        ? "M55 10A45 45 0 1 0 55 100A45 45 0 1 0 55 10Z"
                        : s.value === "square"
                          ? "M20 20L90 20L90 90L20 90Z"
                          : s.value === "rounded"
                            ? "M20 30C20 24.5 24.5 20 30 20L80 20C85.5 20 90 24.5 90 30L90 80C90 85.5 85.5 90 80 90L30 90C24.5 90 20 85.5 20 80Z"
                            : s.value === "diamond"
                              ? "M55 10L100 55L55 100L10 55Z"
                              : s.value === "hexagon"
                                ? "M55 8L95 30L95 80L55 102L15 80L15 30Z"
                                : s.value === "star"
                                  ? "M55 5L65 38L100 38L72 58L82 92L55 72L28 92L38 58L10 38L45 38Z"
                                  : "M55 95C55 95 10 65 10 38C10 22 22 10 38 10C47 10 52 15 55 20C58 15 63 10 72 10C88 10 100 22 100 38C100 65 55 95 55 95Z"
                  }
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="none"
                />
              </svg>
              <span className="text-[10px] text-gray-600">{s.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

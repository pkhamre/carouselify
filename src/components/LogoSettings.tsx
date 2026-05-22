"use client";

import type { LogoConfig } from "@/lib/types";
import { logoShapeOrder, logoShapePaths } from "@/lib/logoShapes";

const logoPositionOptions: Array<{ value: LogoConfig["position"]; label: string }> = [
  { value: "top-left", label: "Upper left" },
  { value: "top-center", label: "Upper center" },
  { value: "top-right", label: "Upper right" },
  { value: "bottom-right", label: "Bottom right" },
];

interface LogoSettingsProps {
  logo: LogoConfig;
  onChange: (logo: LogoConfig) => void;
}

export function LogoSettings({ logo, onChange }: LogoSettingsProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 transition-colors">
      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Logo</h3>

      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
        Letter
      </label>
      <input
        type="text"
        value={logo.letter}
        onChange={(e) => onChange({ ...logo, letter: e.target.value.slice(0, 2) })}
        maxLength={2}
        className="w-16 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-lg font-bold text-center text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-transparent"
      />

      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mt-4 mb-2">
        Shape
      </label>
      <div className="grid grid-cols-5 gap-2">
        {logoShapeOrder.map((shape) => (
          <button
            key={shape}
            type="button"
            onClick={() => onChange({ ...logo, shape })}
            className={`w-10 h-10 rounded-lg border-2 transition-colors flex items-center justify-center ${
              logo.shape === shape
                ? "border-sky-600 bg-sky-50 dark:bg-sky-900/30"
                : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
            }`}
            aria-label={`Select ${shape}`}
          >
            <svg width="24" height="24" viewBox="0 0 110 110" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d={logoShapePaths[shape]} stroke="currentColor" strokeWidth="8" className="text-gray-700 dark:text-gray-300" />
            </svg>
          </button>
        ))}
      </div>

      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mt-4 mb-2">
        Placement
      </label>
      <div className="grid grid-cols-2 gap-2">
        {logoPositionOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange({ ...logo, position: option.value })}
            className={`px-2.5 py-2 text-xs rounded-lg border transition-colors ${
              logo.position === option.value
                ? "border-sky-600 bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-200"
                : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

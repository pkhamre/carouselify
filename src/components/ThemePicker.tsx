"use client";

import type { ColorScheme, FontPairing } from "@/lib/types";
import { colorSchemes, fontPairings } from "@/lib/themes";

interface ThemePickerProps {
  selectedScheme: ColorScheme;
  selectedFonts: FontPairing;
  onSchemeChange: (scheme: ColorScheme) => void;
  onFontsChange: (fonts: FontPairing) => void;
}

export function ThemePicker({
  selectedScheme,
  selectedFonts,
  onSchemeChange,
  onFontsChange,
}: ThemePickerProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <h3 className="font-semibold text-gray-900 mb-4">Theme</h3>

      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
          Color Scheme
        </label>
        <div className="grid grid-cols-5 gap-2">
          {colorSchemes.map((scheme) => (
            <button
              key={scheme.name}
              onClick={() => onSchemeChange(scheme)}
              className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border-2 transition-all ${
                selectedScheme.name === scheme.name
                  ? "border-pink-500 bg-pink-50"
                  : "border-gray-100 hover:border-gray-200"
              }`}
            >
              <div className="flex gap-0.5">
                <div
                  className="w-5 h-5 rounded-full border border-gray-200"
                  style={{ backgroundColor: scheme.background }}
                />
                <div
                  className="w-5 h-5 rounded-full border border-gray-200"
                  style={{ backgroundColor: scheme.accent }}
                />
                <div
                  className="w-5 h-5 rounded-full border border-gray-200"
                  style={{ backgroundColor: scheme.textPrimary }}
                />
              </div>
              <span className="text-[10px] text-gray-600">{scheme.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
          Font Pairing
        </label>
        <select
          value={selectedFonts.name}
          onChange={(e) => {
            const fonts = fontPairings.find((f) => f.name === e.target.value);
            if (fonts) onFontsChange(fonts);
          }}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-pink-500"
        >
          {fontPairings.map((fonts) => (
            <option key={fonts.name} value={fonts.name}>
              {fonts.name} — {fonts.display} + {fonts.body}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

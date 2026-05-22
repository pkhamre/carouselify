"use client";

import { useState } from "react";
import type { ColorScheme, FontPairing } from "@/lib/types";
import { colorSchemes, fontPairings, defaultScheme } from "@/lib/themes";

interface ThemePickerProps {
  selectedScheme: ColorScheme;
  selectedFonts: FontPairing;
  inverted: boolean;
  onSchemeChange: (scheme: ColorScheme) => void;
  onFontsChange: (fonts: FontPairing) => void;
  onInvertChange: (inverted: boolean) => void;
}

export function ThemePicker({
  selectedScheme,
  selectedFonts,
  inverted,
  onSchemeChange,
  onFontsChange,
  onInvertChange,
}: ThemePickerProps) {
  const isCustom = selectedScheme.name === "Custom";
  const [customBg, setCustomBg] = useState("#EDEAE3");
  const [customAccent, setCustomAccent] = useState("#F23D6D");
  const [customText, setCustomText] = useState("#1E1B18");

  const updateCustom = (bg: string, accent: string, text: string) => {
    setCustomBg(bg);
    setCustomAccent(accent);
    setCustomText(text);
    onSchemeChange({
      name: "Custom",
      background: bg,
      accent: accent,
      textPrimary: text,
      textOnAccent: bg,
      bgOnAccent: bg,
    });
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 transition-colors">
      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Theme</h3>

      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
          Color Scheme
        </label>
        <div className="grid grid-cols-5 gap-2">
          {colorSchemes.map((scheme) => (
            <button
              key={scheme.name}
              onClick={() => {
                if (scheme.name === "Custom") {
                  updateCustom(customBg, customAccent, customText);
                } else {
                  onSchemeChange(scheme);
                }
              }}
              className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border-2 transition-all ${
                selectedScheme.name === scheme.name
                  ? "border-pink-500 bg-pink-50 dark:bg-pink-900/30"
                  : "border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600"
              }`}
            >
              <div
                className="w-7 h-2.5 rounded-sm overflow-hidden border border-gray-200 dark:border-gray-600 flex"
              >
                <div className="flex-1" style={{ backgroundColor: scheme.name === "Custom" ? customBg : scheme.background }} />
                <div className="flex-1" style={{ backgroundColor: scheme.name === "Custom" ? customAccent : scheme.accent }} />
                <div className="flex-1" style={{ backgroundColor: scheme.name === "Custom" ? customText : scheme.textPrimary }} />
              </div>
              <span className="text-[10px] text-gray-600 dark:text-gray-400">{scheme.name}</span>
            </button>
          ))}
        </div>

        {isCustom && (
          <div className="mt-3 space-y-2">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
              Custom Colors
            </label>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={customBg}
                  onChange={(e) => updateCustom(e.target.value, customAccent, customText)}
                  className="w-8 h-8 rounded cursor-pointer border border-gray-300 dark:border-gray-600"
                />
                <span className="text-xs text-gray-600 dark:text-gray-400">Background</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={customAccent}
                  onChange={(e) => updateCustom(customBg, e.target.value, customText)}
                  className="w-8 h-8 rounded cursor-pointer border border-gray-300 dark:border-gray-600"
                />
                <span className="text-xs text-gray-600 dark:text-gray-400">Accent</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={customText}
                  onChange={(e) => updateCustom(customBg, customAccent, e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer border border-gray-300 dark:border-gray-600"
                />
                <span className="text-xs text-gray-600 dark:text-gray-400">Text</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
          Font Pairing
        </label>
        <select
          value={selectedFonts.name}
          onChange={(e) => {
            const fonts = fontPairings.find((f) => f.name === e.target.value);
            if (fonts) onFontsChange(fonts);
          }}
          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
        >
          {fontPairings.map((fonts) => (
            <option key={fonts.name} value={fonts.name}>
              {fonts.name} — {fonts.display} + {fonts.body}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4">
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
          Colors
        </label>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onInvertChange(!inverted)}
            className={`relative w-12 h-7 rounded-full transition-colors ${
              inverted ? "bg-pink-500" : "bg-gray-300 dark:bg-gray-600"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                inverted ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {inverted ? "Inverted" : "Normal"}
          </span>
        </div>
      </div>
    </div>
  );
}

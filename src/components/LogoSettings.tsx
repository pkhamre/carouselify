"use client";

import type { LogoConfig } from "@/lib/types";

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
        className="w-16 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-lg font-bold text-center text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
      />
    </div>
  );
}

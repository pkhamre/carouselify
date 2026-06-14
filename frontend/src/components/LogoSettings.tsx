"use client";

import { useState } from "react";
import type { LogoConfig } from "@/lib/types";
import { logoShapeOrder, logoShapePaths } from "@/lib/logoShapes";
import { useAuth } from "@/lib/auth";
import { uploadLogo } from "@/lib/api";
import { UpgradePrompt } from "./UpgradePrompt";

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
  const { user } = useAuth();
  const isPremium = user?.is_premium ?? false;
  const [uploadBusy, setUploadBusy] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadBusy(true);
    setUploadError("");
    try {
      const res = await uploadLogo(file);
      onChange({ ...logo, customUrl: res.url, isCustom: true });
    } catch (err: any) {
      setUploadError(err.message || "Upload failed");
    }
    setUploadBusy(false);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">Logo</h3>
        <button
          type="button"
          onClick={() => onChange({ ...logo, showLogo: !logo.showLogo })}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
            logo.showLogo ? "bg-sky-600" : "bg-gray-300 dark:bg-gray-600"
          }`}
          aria-label={logo.showLogo ? "Disable logo" : "Enable logo"}
        >
          <span
            className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${
              logo.showLogo ? "translate-x-[18px]" : "translate-x-[3px]"
            }`}
          />
        </button>
      </div>

      {logo.showLogo && (
        <>
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

          {isPremium ? (
            <>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mt-4 mb-2">
                Custom Image
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={handleUpload}
                  disabled={uploadBusy}
                  className="block w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-sky-50 dark:file:bg-sky-900/30 file:text-sky-700 dark:file:text-sky-200 hover:file:bg-sky-100 dark:hover:file:bg-sky-900/50"
                />
              </div>
              {uploadBusy && <p className="text-xs text-gray-500 mt-1">Uploading...</p>}
              {uploadError && <p className="text-xs text-red-500 mt-1">{uploadError}</p>}
              {logo.isCustom && logo.customUrl && (
                <div className="mt-2">
                  <img src={logo.customUrl} alt="Custom logo" className="h-10 w-auto object-contain" />
                  <button
                    onClick={() => onChange({ ...logo, customUrl: null, isCustom: false })}
                    className="text-xs text-red-600 hover:text-red-700 mt-1"
                  >
                    Remove
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="mt-4">
              <UpgradePrompt feature="Custom logo upload" compact />
            </div>
          )}

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
        </>
      )}
    </div>
  );
}

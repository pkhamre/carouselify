"use client";

import type { DesignVariant } from "@/lib/types";

const variants: { id: DesignVariant; name: string; description: string }[] = [
  { id: "signal", name: "Signal", description: "Big type, sharp rhythm" },
  { id: "studio", name: "Studio", description: "Framed, tactile, composed" },
  { id: "index", name: "Index", description: "Structured, bold, memorable" },
];

export function DesignPicker({ value, onChange }: { value: DesignVariant; onChange: (value: DesignVariant) => void }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
        Design direction
      </label>
      <div className="grid grid-cols-3 gap-2">
        {variants.map((variant) => (
          <button
            key={variant.id}
            type="button"
            onClick={() => onChange(variant.id)}
            aria-pressed={value === variant.id}
            className={`text-left p-2.5 rounded-lg border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 ${
              value === variant.id
                ? "border-sky-600 bg-sky-50 dark:bg-sky-900/30"
                : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
            }`}
          >
            <span className="block text-xs font-semibold text-gray-900 dark:text-gray-100">{variant.name}</span>
            <span className="block mt-1 text-[10px] leading-tight text-gray-500 dark:text-gray-400">{variant.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { generateSlides, getCredits } from "@/lib/api";
import { UpgradePrompt } from "./UpgradePrompt";

interface AiDialogProps {
  open: boolean;
  onClose: () => void;
  onGenerate: (slides: any[]) => void;
  openAuth?: (mode: "login" | "register") => void;
}

export function AiDialog({ open, onClose, onGenerate, openAuth }: AiDialogProps) {
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const [credits, setCredits] = useState<{ used: number; remaining: number; limit: number } | null>(null);
  const [error, setError] = useState("");

  useState(() => {
    if (open) {
      getCredits().then(setCredits).catch(() => {});
      setError("");
    }
  });

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setBusy(true);
    setError("");
    try {
      const res = await generateSlides(prompt, 5);
      onGenerate(res.slides);
      setCredits({ used: (credits?.used ?? 0) + res.credits_used, remaining: res.credits_remaining, limit: credits?.limit ?? 0 });
      onClose();
    } catch (e: any) {
      setError(e.message);
    }
    setBusy(false);
  };

  if (!open) return null;

  const isGuest = credits?.limit === 1;
  const noCredits = credits !== null && credits.remaining <= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-md w-full mx-4 space-y-4" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Generate with AI
        </h2>
        {credits && (
          <p className="text-xs text-gray-500">
            {isGuest
              ? credits.remaining > 0
                ? "1 free AI credit remaining"
                : "Free · Create a free account to get 5 more AI credits"
              : `${credits.remaining} / ${credits.limit} credits remaining`
            }
          </p>
        )}
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your presentation..."
          rows={4}
          className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 resize-none"
        />
        {error && (
          <div className="space-y-2">
            <p className="text-xs text-red-500">{error}</p>
            {error.includes("free account") && (
              <button
                onClick={() => { onClose(); openAuth?.("register"); }}
                className="w-full py-2 text-sm font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-700 transition-colors"
              >
                Register for free
              </button>
            )}
          </div>
        )}
        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            Cancel
          </button>
          {!error && (noCredits ? (
            isGuest ? (
              <button
                onClick={() => { onClose(); openAuth?.("register"); }}
                className="px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-700 transition-colors"
              >
                Register for free
              </button>
            ) : (
              <UpgradePrompt feature="AI content generation" compact />
            )
          ) : (
            <button
              onClick={handleGenerate}
              disabled={busy || !prompt.trim()}
              className="px-4 py-2 text-sm bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50 transition-colors"
            >
              {busy ? "Generating..." : "Generate"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

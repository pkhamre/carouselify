"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { generateSlides, getCredits } from "@/lib/api";
import { UpgradePrompt } from "./UpgradePrompt";

interface AiDialogProps {
  open: boolean;
  onClose: () => void;
  onGenerate: (slides: any[]) => void;
}

export function AiDialog({ open, onClose, onGenerate }: AiDialogProps) {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const [credits, setCredits] = useState<{ used: number; remaining: number } | null>(null);

  useState(() => {
    if (open) getCredits().then(setCredits).catch(() => {});
  });

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setBusy(true);
    try {
      const res = await generateSlides(prompt);
      onGenerate(res.slides);
      setCredits({ used: (credits?.used ?? 0) + res.credits_used, remaining: res.credits_remaining });
      onClose();
    } catch (e: any) {
      alert(e.message);
    }
    setBusy(false);
  };

  if (!open) return null;

  if (!user?.is_premium) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
          <UpgradePrompt feature="AI content generation" />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-md w-full mx-4 space-y-4" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Generate with AI
        </h2>
        {credits && (
          <p className="text-xs text-gray-500">
            {credits.remaining} / 50 credits remaining
          </p>
        )}
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your presentation..."
          rows={4}
          className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 resize-none"
        />
        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={busy || !prompt.trim()}
            className="px-4 py-2 text-sm bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50 transition-colors"
          >
            {busy ? "Generating..." : "Generate"}
          </button>
        </div>
      </div>
    </div>
  );
}

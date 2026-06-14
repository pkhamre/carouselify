"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { getCredits, createCheckout, createPortal } from "@/lib/api";

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsDialog({ open, onClose }: SettingsDialogProps) {
  const { user } = useAuth();
  const [credits, setCredits] = useState<{ remaining: number; limit: number; resets_at: string | null } | null>(null);
  const [busy, setBusy] = useState(false);

  const isPremium = user?.is_premium;

  useEffect(() => {
    if (open && isPremium) {
      getCredits().then(setCredits).catch(() => {});
    }
  }, [open, isPremium]);

  const handleUpgrade = async () => {
    setBusy(true);
    try {
      const res = await createCheckout(window.location.origin);
      window.location.href = res.url;
    } catch {}
    setBusy(false);
  };

  const handleManage = async () => {
    setBusy(true);
    try {
      const res = await createPortal(window.location.origin);
      window.location.href = res.url;
    } catch {}
    setBusy(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl w-full max-w-sm mx-4 p-6 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Settings</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Close settings"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-800">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Account</label>
          <p className="mt-1 text-sm text-gray-900 dark:text-gray-100 truncate">{user?.email}</p>
        </div>

        <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-800">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Subscription</label>
          <div className="mt-2 flex items-center gap-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isPremium ? "bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300" : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"}`}>
              {isPremium ? "Premium" : "Free"}
            </span>
            {isPremium && credits && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {credits.remaining}/{credits.limit} AI credits remaining
              </span>
            )}
          </div>
          <div className="mt-3">
            {isPremium ? (
              <button
                onClick={handleManage}
                disabled={busy}
                className="text-sm text-sky-600 hover:text-sky-700 underline disabled:opacity-50"
              >
                {busy ? "Redirecting..." : "Manage subscription"}
              </button>
            ) : (
              <button
                onClick={handleUpgrade}
                disabled={busy}
                className="px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-700 transition-colors disabled:opacity-50"
              >
                {busy ? "Redirecting..." : "Upgrade to Premium"}
              </button>
            )}
          </div>
        </div>

        <p className="text-xs text-gray-400 dark:text-gray-500">
          Premium unlocks custom logo uploads and AI-powered slide generation.
        </p>
      </div>
    </div>
  );
}

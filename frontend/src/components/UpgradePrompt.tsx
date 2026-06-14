"use client";

import { useState } from "react";
import { createCheckout } from "@/lib/api";
import { useAuth } from "@/lib/auth";

interface UpgradePromptProps {
  feature: string;
  compact?: boolean;
}

export function UpgradePrompt({ feature, compact }: UpgradePromptProps) {
  const [busy, setBusy] = useState(false);
  const { subscriptionsEnabled } = useAuth();

  const handleUpgrade = async () => {
    setBusy(true);
    try {
      const res = await createCheckout(window.location.origin);
      window.location.href = res.url;
    } catch {}
    setBusy(false);
  };

  if (!subscriptionsEnabled) {
    if (compact) {
      return (
        <span className="text-xs text-gray-400 dark:text-gray-500">
          Coming soon!
        </span>
      );
    }

    return (
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          {feature} is a premium feature
        </p>
        <button
          disabled
          className="px-6 py-2 bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-lg cursor-not-allowed"
        >
          Coming soon!
        </button>
      </div>
    );
  }

  if (compact) {
    return (
      <button
        onClick={handleUpgrade}
        disabled={busy}
        className="text-xs text-sky-600 hover:text-sky-700 underline"
      >
        Upgrade to Premium
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-6 text-center">
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
        {feature} is a premium feature
      </p>
      <button
        onClick={handleUpgrade}
        disabled={busy}
        className="px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors disabled:opacity-50"
      >
        {busy ? "Redirecting..." : "Upgrade to Premium"}
      </button>
    </div>
  );
}

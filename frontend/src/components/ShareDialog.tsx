"use client";

import { useState, useCallback } from "react";
import { shareCarousel, revokeShare } from "@/lib/api";

interface ShareDialogProps {
  carouselId: string;
  shareUrl: string | null;
  onShared: (url: string) => void;
  onRevoked: () => void;
}

export function ShareDialog({ carouselId, shareUrl, onShared, onRevoked }: ShareDialogProps) {
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(async () => {
    setBusy(true);
    try {
      const res = await shareCarousel(carouselId);
      onShared(res.url);
    } finally {
      setBusy(false);
    }
  }, [carouselId, onShared]);

  const handleRevoke = useCallback(async () => {
    setBusy(true);
    try {
      await revokeShare(carouselId);
      onRevoked();
    } finally {
      setBusy(false);
    }
  }, [carouselId, onRevoked]);

  const handleCopy = useCallback(async () => {
    if (!shareUrl) return;
    const fullUrl = `${window.location.origin}${shareUrl}`;
    await navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [shareUrl]);

  if (!shareUrl) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 transition-colors">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Share</h3>
        <button
          onClick={handleShare}
          disabled={busy}
          className="w-full py-2 text-sm font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-700 disabled:opacity-50 transition-colors"
        >
          {busy ? "Generating..." : "Generate share link"}
        </button>
      </div>
    );
  }

  const fullUrl = typeof window !== "undefined" ? `${window.location.origin}${shareUrl}` : shareUrl;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 transition-colors">
      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Share</h3>
      <div className="flex items-center gap-2">
        <input
          type="text"
          readOnly
          value={fullUrl}
          className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        />
        <button
          onClick={handleCopy}
          className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <button
        onClick={handleRevoke}
        disabled={busy}
        className="mt-2 w-full py-1.5 text-xs font-medium text-red-600 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 transition-colors"
      >
        Revoke share link
      </button>
    </div>
  );
}

"use client";

import { useState, useCallback } from "react";
import { publishShowcase, unpublishShowcase } from "@/lib/api";

interface ShareButtonProps {
  carouselId: string;
  shareUrl: string | null;
  onShare: () => Promise<void>;
}

export function ShareButton({ shareUrl, onShare, carouselId: _carouselId }: ShareButtonProps) {
  const [busy, setBusy] = useState(false);

  const handleClick = useCallback(async () => {
    setBusy(true);
    try {
      await onShare();
    } finally {
      setBusy(false);
    }
  }, [onShare]);

  return (
    <button
      onClick={handleClick}
      disabled={busy}
      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
    >
      {busy ? "..." : shareUrl ? "Shared" : "Share"}
    </button>
  );
}

interface ShowcaseButtonProps {
  carouselId: string;
  showcaseStatus: "none" | "showcased";
  showcaseAuthor?: string;
  onShowcasePublish?: (author?: string) => Promise<void>;
  onShowcaseUnpublish?: () => Promise<void>;
}

export function ShowcaseButton({
  showcaseStatus,
  showcaseAuthor = "",
  onShowcasePublish,
  onShowcaseUnpublish,
}: ShowcaseButtonProps) {
  const [busy, setBusy] = useState(false);
  const [authorName, setAuthorName] = useState(showcaseAuthor);

  const handlePublish = useCallback(async () => {
    if (!onShowcasePublish) return;
    setBusy(true);
    try {
      await onShowcasePublish(authorName || undefined);
    } finally {
      setBusy(false);
    }
  }, [onShowcasePublish, authorName]);

  const handleUnpublish = useCallback(async () => {
    if (!onShowcaseUnpublish) return;
    setBusy(true);
    try {
      await onShowcaseUnpublish();
    } finally {
      setBusy(false);
    }
  }, [onShowcaseUnpublish]);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 transition-colors">
      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Showcase</h3>
      {showcaseStatus === "showcased" ? (
        <div className="space-y-3">
          <p className="text-sm text-green-600 dark:text-green-400">
            Published in the showcase gallery.
          </p>
          {onShowcaseUnpublish && (
            <button
              onClick={handleUnpublish}
              disabled={busy}
              className="w-full py-2 text-sm font-medium text-red-600 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 transition-colors"
            >
              {busy ? "Removing..." : "Remove from showcase"}
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Publish your carousel to the public gallery.
          </p>
          <input
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="Your name (optional)"
            maxLength={100}
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
          />
          <button
            onClick={handlePublish}
            disabled={busy}
            className="w-full py-2 text-sm font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-700 disabled:opacity-50 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
          >
            {busy ? "Publishing..." : "Publish to showcase"}
          </button>
        </div>
      )}
    </div>
  );
}

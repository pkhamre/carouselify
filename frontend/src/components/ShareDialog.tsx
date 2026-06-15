"use client";

import { useState, useCallback } from "react";
import { shareCarousel, revokeShare, publishShowcase, unpublishShowcase } from "@/lib/api";
import { captureShare } from "@/lib/analytics";

interface ShareDialogProps {
  carouselId: string;
  shareUrl: string | null;
  onShared: (url: string) => void;
  onRevoked: () => void;
  showcaseStatus?: "none" | "showcased";
  showcaseAuthor?: string;
  onShowcasePublish?: (author?: string) => Promise<void>;
  onShowcaseUnpublish?: () => Promise<void>;
}

export function ShareDialog({
  carouselId,
  shareUrl,
  onShared,
  onRevoked,
  showcaseStatus = "none",
  showcaseAuthor = "",
  onShowcasePublish,
  onShowcaseUnpublish,
}: ShareDialogProps) {
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [authorName, setAuthorName] = useState(showcaseAuthor);
  const [actionBusy, setActionBusy] = useState(false);

  const handleShare = useCallback(async () => {
    setBusy(true);
    try {
      const res = await shareCarousel(carouselId);
      onShared(res.url);
      captureShare();
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

  const handlePublish = useCallback(async () => {
    if (!onShowcasePublish) return;
    setActionBusy(true);
    try {
      await onShowcasePublish(authorName || undefined);
    } finally {
      setActionBusy(false);
    }
  }, [onShowcasePublish, authorName]);

  const handleUnpublish = useCallback(async () => {
    if (!onShowcaseUnpublish) return;
    setActionBusy(true);
    try {
      await onShowcaseUnpublish();
    } finally {
      setActionBusy(false);
    }
  }, [onShowcaseUnpublish]);

  if (!shareUrl) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 transition-colors">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Share</h3>
        <button
          onClick={handleShare}
          disabled={busy}
          className="w-full py-2 text-sm font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-700 disabled:opacity-50 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
        >
          {busy ? "Generating..." : "Generate share link"}
        </button>
      </div>
    );
  }

  const fullUrl = typeof window !== "undefined" ? `${window.location.origin}${shareUrl}` : shareUrl;

  return (
    <div className="space-y-4">
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
            className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <button
          onClick={handleRevoke}
          disabled={busy}
          className="mt-2 w-full py-1.5 text-xs font-medium text-red-600 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
        >
          Revoke share link
        </button>
      </div>

      {onShowcasePublish && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 transition-colors">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Showcase</h3>
          {showcaseStatus === "showcased" ? (
            <div className="space-y-3">
              <p className="text-sm text-green-600 dark:text-green-400">
                Your carousel is published in the showcase gallery.
              </p>
              {onShowcaseUnpublish && (
                <button
                  onClick={handleUnpublish}
                  disabled={actionBusy}
                  className="w-full py-2 text-sm font-medium text-red-600 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 transition-colors"
                >
                  {actionBusy ? "Removing..." : "Remove from showcase"}
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Publish your carousel to the public showcase gallery.
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
                disabled={actionBusy}
                className="w-full py-2 text-sm font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-700 disabled:opacity-50 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
              >
                {actionBusy ? "Publishing..." : "Publish to showcase"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

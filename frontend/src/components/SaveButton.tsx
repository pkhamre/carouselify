"use client";

import { useState, useCallback, useEffect } from "react";
import { createCarousel, updateCarousel } from "@/lib/api";

interface SaveButtonProps {
  carouselData: any;
  savedId: string | null;
  defaultTitle?: string;
  onSaved: (id: string, title: string) => void;
}

export function SaveButton({ carouselData, savedId, defaultTitle, onSaved }: SaveButtonProps) {
  const [busy, setBusy] = useState(false);
  const [title, setTitle] = useState(defaultTitle || "Untitled");

  useEffect(() => {
    if (defaultTitle) setTitle(defaultTitle);
  }, [defaultTitle]);

  const handleSave = useCallback(async () => {
    setBusy(true);
    try {
      if (savedId) {
        await updateCarousel(savedId, { title, data: carouselData });
      } else {
        const created = await createCarousel(title, carouselData);
        onSaved(created.id, created.title);
      }
    } finally {
      setBusy(false);
    }
  }, [savedId, carouselData, title, onSaved]);

  return (
    <div className="flex items-center gap-2 flex-1 min-w-0">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Carousel title"
        aria-label="Carousel title"
        className="flex-1 min-w-0 px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-600 transition-colors"
      />
      <button
        onClick={handleSave}
        disabled={busy}
        data-save-btn
        aria-label="Save carousel"
        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
      >
        {busy ? "Saving..." : savedId ? "Update" : "Save"}
      </button>
    </div>
  );
}

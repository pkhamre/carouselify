"use client";

import { useState, useCallback } from "react";
import { createCarousel, updateCarousel } from "@/lib/api";

interface SaveButtonProps {
  carouselData: any;
  savedId: string | null;
  onSaved: (id: string, title: string) => void;
}

export function SaveButton({ carouselData, savedId, onSaved }: SaveButtonProps) {
  const [busy, setBusy] = useState(false);
  const [title, setTitle] = useState("Untitled");

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
    <button
      onClick={handleSave}
      disabled={busy}
      data-save-btn
      aria-label="Save carousel"
      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
    >
      {busy ? "Saving..." : "Save"}
    </button>
  );
}

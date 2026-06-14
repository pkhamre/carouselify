"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { createCarousel, updateCarousel } from "@/lib/api";
import { AuthModal } from "./AuthModal";

interface SaveButtonProps {
  carouselData: any;
  savedId: string | null;
  onSaved: (id: string, title: string) => void;
}

export function SaveButton({ carouselData, savedId, onSaved }: SaveButtonProps) {
  const { user, isAuthenticated } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [busy, setBusy] = useState(false);
  const [title, setTitle] = useState("Untitled");

  const handleSave = useCallback(async () => {
    if (!isAuthenticated) {
      setShowAuth(true);
      return;
    }
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
  }, [isAuthenticated, savedId, carouselData, title, onSaved]);

  return (
    <>
      <button
        onClick={handleSave}
        disabled={busy}
        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
      >
        {busy ? "Saving..." : savedId ? "Save" : "Save"}
      </button>

      {showAuth && isAuthenticated === false && (
        <AuthModal open={showAuth} onClose={() => setShowAuth(false)} />
      )}
    </>
  );
}

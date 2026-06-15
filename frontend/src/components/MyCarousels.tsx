"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { listCarousels, getCarousel, deleteCarousel } from "@/lib/api";
import type { CarouselListItem, CarouselData } from "@/lib/api";

interface MyCarouselsProps {
  onLoad: (data: CarouselData) => void;
  refreshKey?: number;
}

export function MyCarousels({ onLoad, refreshKey }: MyCarouselsProps) {
  const { isAuthenticated } = useAuth();
  const [carousels, setCarousels] = useState<CarouselListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const fetchList = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      setCarousels(await listCarousels());
    } catch {}
    setLoading(false);
  }, [isAuthenticated]);

  useEffect(() => {
    if (open) fetchList();
  }, [open, fetchList, refreshKey]);

  const handleLoad = async (id: string) => {
    try {
      const data = await getCarousel(id);
      onLoad(data);
    } catch {}
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCarousel(id);
      setCarousels((prev) => prev.filter((c) => c.id !== id));
      setConfirmDeleteId(null);
    } catch {}
  };

  if (!isAuthenticated) return null;

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
      >
        <span className="text-gray-500 dark:text-gray-400">{open ? "▼" : "▶"}</span> My Carousels
      </button>
      {open && (
        <div className="mt-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-3 space-y-2 max-h-[300px] overflow-y-auto transition-colors">
          {loading && (
            <div className="flex items-center gap-2 py-3 text-sm text-gray-500 dark:text-gray-400">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Loading carousels...
            </div>
          )}
          {!loading && carousels.length === 0 && (
            <div className="py-4 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">No saved carousels yet</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Save your current work to find it here later
              </p>
            </div>
          )}
          {carousels.map((c) => (
            <div key={c.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
              <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 truncate">{c.title}</span>
              <button
                onClick={() => handleLoad(c.id)}
                className="text-xs px-2 py-1 bg-sky-600 text-white rounded-md hover:bg-sky-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
              >
                Load
              </button>
              {confirmDeleteId === c.id ? (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="text-xs px-2 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(null)}
                    className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDeleteId(c.id)}
                  className="text-xs px-2 py-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                  aria-label={`Delete ${c.title}`}
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { listCarousels, getCarousel, deleteCarousel } from "@/lib/api";
import type { CarouselListItem, CarouselData } from "@/lib/api";
import { useToast } from "./Toast";
import { WelcomePanel } from "./WelcomePanel";

interface MyCarouselsProps {
  onLoad: (data: CarouselData) => void;
  refreshKey?: number;
  showWelcome?: boolean;
  onDismissWelcome?: () => void;
}

export function MyCarousels({ onLoad, refreshKey, showWelcome, onDismissWelcome }: MyCarouselsProps) {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [carousels, setCarousels] = useState<CarouselListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const fetchList = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      setCarousels(await listCarousels());
    } catch {
      toast("Failed to load carousels", "error");
    }
    setLoading(false);
  }, [isAuthenticated, toast]);

  useEffect(() => {
    fetchList();
  }, [fetchList, refreshKey]);

  const handleLoad = async (id: string) => {
    setLoadingId(id);
    try {
      const data = await getCarousel(id);
      onLoad(data);
    } catch {
      toast("Failed to load carousel", "error");
    }
    setLoadingId(null);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCarousel(id);
      setCarousels((prev) => prev.filter((c) => c.id !== id));
      setConfirmDeleteId(null);
    } catch {
      toast("Failed to delete carousel", "error");
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 transition-colors">
      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">My Carousels</h3>
      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {loading && (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded-lg animate-pulse">
                <div className="flex-1 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="w-10 h-6 bg-gray-200 dark:bg-gray-700 rounded-md" />
                <div className="w-10 h-6 bg-gray-200 dark:bg-gray-700 rounded-md" />
              </div>
            ))}
          </div>
        )}
        {!loading && carousels.length === 0 && (
          showWelcome ? (
            <WelcomePanel onDismiss={onDismissWelcome!} />
          ) : (
            <div className="py-4 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">No saved carousels yet</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Save your current work to find it here later
              </p>
            </div>
          )
        )}
        {carousels.map((c) => (
          <div key={c.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
            <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 truncate">{c.title}</span>
            <button
              onClick={() => handleLoad(c.id)}
              disabled={loadingId === c.id}
              className="text-xs px-2 py-1 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
            >
              {loadingId === c.id ? "Loading..." : "Load"}
            </button>
            {confirmDeleteId === c.id ? (
              <div className="flex items-center gap-2">
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
    </div>
  );
}

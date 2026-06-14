"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { listCarousels, getCarousel, deleteCarousel } from "@/lib/api";
import type { CarouselListItem, CarouselData } from "@/lib/api";

interface MyCarouselsProps {
  onLoad: (data: CarouselData) => void;
  show?: boolean;
  onClose?: () => void;
  refreshKey?: number;
}

export function MyCarousels({ onLoad, show, onClose, refreshKey }: MyCarouselsProps) {
  const { isAuthenticated } = useAuth();
  const [carousels, setCarousels] = useState<CarouselListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

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

  useEffect(() => {
    if (show) setOpen(true);
  }, [show]);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (!next && onClose) onClose();
  };

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
    } catch {}
  };

  if (!isAuthenticated) return null;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 transition-colors">
      <button
        onClick={toggle}
        className={`w-full px-4 py-3 text-sm font-medium text-left transition-colors ${
          open
            ? "rounded-t-xl border-b border-gray-200 dark:border-gray-800"
            : "rounded-xl"
        } hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200`}
      >
        My Carousels
      </button>
      {open && (
        <div className="p-3 space-y-2 max-h-[300px] overflow-y-auto">
          {loading && <p className="text-sm text-gray-500">Loading...</p>}
          {!loading && carousels.length === 0 && (
            <p className="text-sm text-gray-500">No saved carousels</p>
          )}
          {carousels.map((c) => (
            <div key={c.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
              <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 truncate">{c.title}</span>
              <button
                onClick={() => handleLoad(c.id)}
                className="text-xs px-2 py-1 bg-sky-600 text-white rounded-md hover:bg-sky-700"
              >
                Load
              </button>
              <button
                onClick={() => handleDelete(c.id)}
                className="text-xs px-2 py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from "react";

interface ToastAction {
  label: string;
  onClick: () => void;
}

interface ToastItem {
  id: number;
  message: string;
  type: "success" | "error";
  action?: ToastAction;
}

interface ToastContextType {
  toast: (message: string, type?: "success" | "error", action?: ToastAction) => void;
}

const defaultToast: ToastContextType = { toast: () => {} };
const ToastContext = createContext<ToastContextType>(defaultToast);

let toastId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const toast = useCallback((message: string, type: "success" | "error" = "success", action?: ToastAction) => {
    const id = ++toastId;
    setItems((prev) => [...prev, { id, message, type, action }]);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] space-y-2">
        {items.map((item) => (
          <ToastItem key={item.id} item={item} onDone={() => setItems((prev) => prev.filter((i) => i.id !== item.id))} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ item, onDone }: { item: ToastItem; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium shadow-lg transition-colors motion-reduce:transition-none ${
        item.type === "success"
          ? "bg-green-600 text-white"
          : "bg-red-600 text-white"
      }`}
    >
      <span className="flex-1">{item.message}</span>
      {item.action && (
        <button
          onClick={() => { item.action!.onClick(); onDone(); }}
          className="text-xs font-semibold uppercase underline underline-offset-2 hover:opacity-80"
        >
          {item.action.label}
        </button>
      )}
    </div>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

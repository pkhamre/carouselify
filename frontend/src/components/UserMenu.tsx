"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { AuthModal } from "./AuthModal";

interface UserMenuProps {
  onShowMyCarousels?: () => void;
}

export function UserMenu({ onShowMyCarousels }: UserMenuProps) {
  const { user, logout, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (!isAuthenticated || user?.isGuest) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowAuth(true)}
          className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Log in
        </button>
        <button
          onClick={() => setShowAuth(true)}
          className="px-3 py-1.5 text-sm font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-700 transition-colors"
        >
          Register
        </button>
        {showAuth && <AuthModal open={showAuth} onClose={() => setShowAuth(false)} />}
      </div>
    );
  }

  const initials = user!.email.charAt(0).toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="w-9 h-9 flex items-center justify-center text-sm font-semibold text-white bg-sky-600 rounded-full hover:bg-sky-700 transition-colors"
        aria-label="User menu"
      >
        {initials}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-lg py-1 z-50 transition-colors">
          <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800 truncate">
            {user!.email}
          </div>
          {onShowMyCarousels && (
            <button
              onClick={() => { setOpen(false); onShowMyCarousels(); }}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              My Carousels
            </button>
          )}
          <button
            onClick={() => { setOpen(false); logout(); }}
            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}

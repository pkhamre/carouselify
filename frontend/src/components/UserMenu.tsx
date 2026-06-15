"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { AuthModal } from "./AuthModal";

interface UserMenuProps {
  onShowSettings?: () => void;
}

export function UserMenu({ onShowSettings }: UserMenuProps) {
  const { user, logout, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [showAuth, setShowAuth] = useState<"login" | "register" | null>(null);
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

  const close = () => setOpen(false);

  const helpLinks = (
    <>
      <Link
        href="/faq"
        onClick={close}
        className="block px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        FAQ
      </Link>
      <Link
        href="/showcase"
        onClick={close}
        className="block px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        Showcase
      </Link>
      <Link
        href="/privacy"
        onClick={close}
        className="block px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        Privacy Policy
      </Link>
    </>
  );

  if (!isAuthenticated || user?.isGuest) {
    return (
      <>
        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen(!open)}
            className="w-9 h-9 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            aria-label="Menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>
          {open && (
            <div className="absolute right-0 top-full mt-2 w-44 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-lg py-1 z-50 transition-colors">
              <button
                onClick={() => { close(); setShowAuth("login"); }}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Log in
              </button>
              <button
                onClick={() => { close(); setShowAuth("register"); }}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Register
              </button>
              <div className="border-t border-gray-100 dark:border-gray-800 my-1" />
              {helpLinks}
            </div>
          )}
        </div>
        {showAuth && <AuthModal mode={showAuth} open={!!showAuth} onClose={() => setShowAuth(null)} />}
      </>
    );
  }

  const initials = user!.email.charAt(0).toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="w-9 h-9 flex items-center justify-center text-sm font-semibold text-white bg-sky-600 rounded-full hover:bg-sky-700 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
        aria-label="User menu"
      >
        {initials}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-lg py-1 z-50 transition-colors">
          <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800 truncate">
            {user!.email}
          </div>
          <button
            onClick={() => { close(); onShowSettings?.(); }}
            className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Settings
          </button>
          <button
            onClick={() => { close(); logout(); }}
            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Log out
          </button>
          <div className="border-t border-gray-100 dark:border-gray-800 my-1" />
          {helpLinks}
        </div>
      )}
    </div>
  );
}

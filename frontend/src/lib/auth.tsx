"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { login as apiLogin, register as apiRegister, logout as apiLogout, getMe, setToken, createGuest, linkGuestAccount } from "./api";

interface AuthUser {
  id: string;
  email: string;
  isGuest?: boolean;
  isPremium?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

function getGuestUserId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("guest_user_id");
}

function setGuestUserId(id: string | null) {
  if (typeof window === "undefined") return;
  if (id) {
    localStorage.setItem("guest_user_id", id);
  } else {
    localStorage.removeItem("guest_user_id");
  }
}

function getTokenValue(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const existingToken = getTokenValue();
    if (existingToken) {
      getMe()
        .then((u) => setUser({ id: u.id, email: u.email, isPremium: u.isPremium }))
        .catch(() => setToken(null))
        .finally(() => setLoading(false));
    } else {
      createGuest()
        .then((res) => {
          setToken(res.access_token);
          setGuestUserId(res.user_id);
          setUser({ id: res.user_id, email: "guest", isGuest: true });
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiLogin(email, password);
    setToken(res.access_token);
    const me = await getMe();
    setUser({ id: me.id, email: me.email });
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    const guestId = getGuestUserId();
    await apiRegister(email, password);
    const res = await apiLogin(email, password);
    setToken(res.access_token);
    const me = await getMe();
    setUser({ id: me.id, email: me.email });
    if (guestId) {
      try {
        await linkGuestAccount(guestId);
      } catch {}
      setGuestUserId(null);
    }
  }, []);

  const logout = useCallback(async () => {
    try { await apiLogout(); } catch {}
    setToken(null);
    setGuestUserId(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

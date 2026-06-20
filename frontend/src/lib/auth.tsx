"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { login as apiLogin, register as apiRegister, logout as apiLogout, getMe, setToken, createGuest, linkGuestAccount, getConfig } from "./api";

interface AuthUser {
  id: string;
  email: string;
  isGuest?: boolean;
  is_premium?: boolean;
  is_admin?: boolean;
  ai_free_used?: boolean;
  polar_subscription_status?: string;
  polar_subscription_period_end?: string;
  polar_cancel_at_period_end?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  subscriptionsEnabled: boolean;
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

function setUserFromMe(u: any, setUser: (u: AuthUser) => void) {
  setUser({ id: u.id, email: u.email, is_premium: u.is_premium, is_admin: u.is_admin, ai_free_used: u.ai_free_used, polar_subscription_status: u.polar_subscription_status, polar_subscription_period_end: u.polar_subscription_period_end, polar_cancel_at_period_end: u.polar_cancel_at_period_end });
}

export function setPendingUpgrade() {
  if (typeof window === "undefined") return;
  sessionStorage.setItem("pending_upgrade", "1");
}

async function pollPremium(getMe: () => Promise<any>, setUser: (u: AuthUser) => void) {
  for (let i = 0; i < 10; i++) {
    await new Promise((r) => setTimeout(r, 1500));
    try {
      const u = await getMe();
      if (u.is_premium) {
        setUserFromMe(u, setUser);
        sessionStorage.removeItem("pending_upgrade");
        return true;
      }
    } catch {}
  }
  sessionStorage.removeItem("pending_upgrade");
  return false;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionsEnabled, setSubscriptionsEnabled] = useState(true);

  useEffect(() => {
    const wasPending = typeof window !== "undefined" && sessionStorage.getItem("pending_upgrade");

    getMe()
      .then((u) => {
        setUserFromMe(u, setUser);
        if (wasPending && u.is_premium) {
          sessionStorage.removeItem("pending_upgrade");
        }
      })
      .catch(() => {
        const existingToken = getTokenValue();
        if (existingToken) setToken(null);
        createGuest().then((res) => {
          setGuestUserId(res.user_id);
          setToken(res.access_token);
        }).catch(() => {});
      })
      .finally(() => {
        if (wasPending) {
          pollPremium(getMe, setUser).finally(() => setLoading(false));
        } else {
          setLoading(false);
        }
      });
  }, []);

  useEffect(() => {
    getConfig()
      .then((c) => setSubscriptionsEnabled(c.subscriptions_enabled))
      .catch(() => {});
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    await apiLogin(email, password);
    const me = await getMe();
    setUser({ id: me.id, email: me.email });
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    const guestId = getGuestUserId();
    await apiRegister(email, password);
    await apiLogin(email, password);
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
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user, subscriptionsEnabled }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

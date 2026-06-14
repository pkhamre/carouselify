"use client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export { API_URL };

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem("token", token);
  } else {
    localStorage.removeItem("token");
  }
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  if (!(options.body instanceof FormData || options.body instanceof URLSearchParams)) {
    headers["Content-Type"] = "application/json";
  }
  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(body.detail || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// Auth
export function login(email: string, password: string): Promise<{ access_token: string; token_type: string }> {
  const form = new URLSearchParams();
  form.append("username", email);
  form.append("password", password);
  return request("/auth/jwt/login", {
    method: "POST",
    body: form,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
}

export function register(email: string, password: string): Promise<any> {
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function logout(): Promise<void> {
  return request("/auth/jwt/logout", { method: "POST" });
}

export function getMe(): Promise<{ id: string; email: string; is_active: boolean; is_superuser: boolean; is_verified: boolean; is_premium?: boolean }> {
  return request("/auth/me");
}

// Carousels
export interface CarouselListItem {
  id: string;
  title: string;
  is_public: boolean;
  share_token: string | null;
  created_at: string;
  updated_at: string;
}

export interface CarouselData {
  id: string;
  user_id: string;
  title: string;
  data: any;
  is_public: boolean;
  share_token: string | null;
  created_at: string;
  updated_at: string;
}

export function createCarousel(title: string, data: any): Promise<CarouselData> {
  return request("/api/carousels", {
    method: "POST",
    body: JSON.stringify({ title, data }),
  });
}

export function listCarousels(): Promise<CarouselListItem[]> {
  return request("/api/carousels");
}

export function getCarousel(id: string): Promise<CarouselData> {
  return request(`/api/carousels/${id}`);
}

export function updateCarousel(id: string, data: { title?: string; data?: any }): Promise<CarouselData> {
  return request(`/api/carousels/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteCarousel(id: string): Promise<void> {
  return request(`/api/carousels/${id}`, { method: "DELETE" });
}

export function shareCarousel(id: string): Promise<{ url: string; share_token: string }> {
  return request(`/api/carousels/${id}/share`, { method: "POST" });
}

export function revokeShare(id: string): Promise<void> {
  return request(`/api/carousels/${id}/share`, { method: "DELETE" });
}

export function createGuest(): Promise<{ access_token: string; token_type: string; user_id: string }> {
  return request("/auth/guest", { method: "POST" });
}

export function linkGuestAccount(guestUserId: string): Promise<{ transferred: number }> {
  return request("/auth/link-guest", {
    method: "POST",
    body: JSON.stringify({ guest_user_id: guestUserId }),
  });
}

export function getSharedCarousel(shareToken: string): Promise<CarouselData> {
  return request(`/api/s/${shareToken}`);
}

export function createCheckout(returnUrl: string): Promise<{ url: string }> {
  return request("/api/billing/checkout", {
    method: "POST",
    body: JSON.stringify({ return_url: returnUrl }),
  });
}

export function createPortal(returnUrl: string): Promise<{ url: string }> {
  return request("/api/billing/portal", {
    method: "POST",
    body: JSON.stringify({ return_url: returnUrl }),
  });
}

export function uploadLogo(file: File): Promise<{ url: string }> {
  const form = new FormData();
  form.append("file", file);
  return request("/api/upload/logo", { method: "POST", body: form });
}

export function getCredits(): Promise<{ used: number; limit: number; remaining: number; resets_at: string | null }> {
  return request("/api/ai/credits");
}

export function generateSlides(prompt: string, slideCount: number = 5): Promise<{ slides: any[]; credits_used: number; credits_remaining: number }> {
  return request("/api/ai/generate", {
    method: "POST",
    body: JSON.stringify({ prompt, slide_count: slideCount }),
  });
}

// Custom Color Schemes
export interface CustomSchemeOut {
  id: string;
  name: string;
  background: string;
  accent: string;
  text_primary: string;
  text_on_accent: string;
  bg_on_accent: string;
  created_at: string;
}

export interface CustomSchemeCreate {
  name: string;
  background: string;
  accent: string;
  text_primary: string;
  text_on_accent: string;
  bg_on_accent: string;
}

export function listSchemes(): Promise<CustomSchemeOut[]> {
  return request("/api/schemes");
}

export function createScheme(data: CustomSchemeCreate): Promise<CustomSchemeOut> {
  return request("/api/schemes", { method: "POST", body: JSON.stringify(data) });
}

export function updateScheme(id: string, data: Partial<CustomSchemeCreate>): Promise<CustomSchemeOut> {
  return request(`/api/schemes/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export function deleteScheme(id: string): Promise<void> {
  return request(`/api/schemes/${id}`, { method: "DELETE" });
}

export function getConfig(): Promise<{ subscriptions_enabled: boolean }> {
  return request("/api/config");
}

"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getAdminStats, type AdminStats } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { AuthProvider } from "@/lib/auth";

function StatSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 transition-colors animate-pulse">
      <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
      <div className="space-y-2">
        <div className="h-3.5 w-24 bg-gray-100 dark:bg-gray-800 rounded" />
        <div className="h-3.5 w-20 bg-gray-100 dark:bg-gray-800 rounded" />
        <div className="h-3.5 w-28 bg-gray-100 dark:bg-gray-800 rounded" />
        <div className="h-3.5 w-16 bg-gray-100 dark:bg-gray-800 rounded" />
      </div>
    </div>
  );
}

function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminStats();
      setStats(data);
    } catch (err: any) {
      if (err.message?.includes("403") || err.message?.toLowerCase().includes("forbidden")) {
        setError("Not authorized. Only the configured admin user can view this page.");
      } else {
        setError(err.message || "Failed to load stats");
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) fetchStats();
  }, [authLoading, fetchStats]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
        <div className="max-w-4xl mx-auto p-6">
          <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center transition-colors">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-8 text-center max-w-sm transition-colors">
          <p className="text-gray-900 dark:text-gray-100 font-medium mb-1">Sign in required</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Log in with the admin account to access this page.</p>
          <Link
            href="/"
            className="mt-4 inline-block px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-700 transition-colors"
          >
            Back to editor
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 transition-colors">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              &larr; Editor
            </Link>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Admin</h1>
          </div>
          <span className="text-sm text-gray-400 dark:text-gray-500">carouselify</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center transition-colors">
            <p className="text-red-800 dark:text-red-200 font-medium mb-1">Access denied</p>
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
          </div>
        )}

        {stats && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 transition-colors">
              <h2 className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                Users
              </h2>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Total accounts</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100 tabular-nums">{stats.users.total.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Registered</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100 tabular-nums">{stats.users.registered.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Guests</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100 tabular-nums">{stats.users.guests.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Premium</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100 tabular-nums">{stats.users.premium.toLocaleString()}</span>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 transition-colors">
              <h2 className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                Carousels
              </h2>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Total created</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100 tabular-nums">{stats.carousels.total.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Shared</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100 tabular-nums">{stats.carousels.shared.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Created this month</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100 tabular-nums">{stats.carousels.this_month.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Average slides</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100 tabular-nums">{stats.carousels.avg_slides}</span>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 transition-colors">
              <h2 className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                AI
              </h2>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Generations</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100 tabular-nums">{stats.ai.total_generations.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Credits consumed</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100 tabular-nums">{stats.ai.total_credits_used.toLocaleString()}</span>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 transition-colors">
              <h2 className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                Events
              </h2>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Total views</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100 tabular-nums">{stats.events.total_views.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Views this month</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100 tabular-nums">{stats.events.views_this_month.toLocaleString()}</span>
                </div>
                <div className="border-t border-gray-100 dark:border-gray-800 my-1.5" />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Total exports</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100 tabular-nums">{stats.events.total_exports.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Exports this month</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100 tabular-nums">{stats.events.exports_this_month.toLocaleString()}</span>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

export default function Admin() {
  return (
    <AuthProvider>
      <AdminPage />
    </AuthProvider>
  );
}

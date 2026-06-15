"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getAdminStats, adminListShowcase, adminRemoveShowcase, getContactMessages, toggleArchiveContactMessage, deleteContactMessage, type AdminStats, type ShowcaseItem, type ContactMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { AuthProvider } from "@/lib/auth";
import { SiteHeader } from "@/components/SiteHeader";

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

function ShowcasedSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 animate-pulse">
      <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
      <div className="h-3 w-32 bg-gray-100 dark:bg-gray-800 rounded mb-2" />
      <div className="h-3 w-24 bg-gray-100 dark:bg-gray-800 rounded" />
    </div>
  );
}

function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [showcased, setShowcased] = useState<ShowcaseItem[]>([]);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [contactsLoading, setContactsLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showcasedLoading, setShowcasedLoading] = useState(true);
  const [actionBusy, setActionBusy] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const [statsData, showcasedData, contactsData] = await Promise.all([
        getAdminStats(),
        adminListShowcase(),
        getContactMessages(showArchived),
      ]);
      setStats(statsData);
      setShowcased(showcasedData);
      setContactMessages(contactsData);
    } catch (err: any) {
      if (err.message?.includes("403") || err.message?.toLowerCase().includes("forbidden")) {
        setError("Not authorized. Only the configured admin user can view this page.");
      } else {
        setError(err.message || "Failed to load stats");
      }
    } finally {
      setLoading(false);
      setShowcasedLoading(false);
      setContactsLoading(false);
    }
  }, [user, showArchived]);

  useEffect(() => {
    if (!authLoading) fetchData();
  }, [authLoading, fetchData]);

  const handleRemove = useCallback(async (id: string) => {
    setActionBusy(id);
    try {
      await adminRemoveShowcase(id);
      setShowcased((prev) => prev.filter((p) => p.id !== id));
    } finally {
      setActionBusy(null);
    }
  }, []);

  const [contactActionBusy, setContactActionBusy] = useState<string | null>(null);

  const handleArchive = useCallback(async (id: string) => {
    setContactActionBusy(id);
    try {
      await toggleArchiveContactMessage(id);
      await fetchData();
    } finally {
      setContactActionBusy(null);
    }
  }, [fetchData]);

  const handleDeleteContact = useCallback(async (id: string) => {
    setContactActionBusy(id);
    try {
      await deleteContactMessage(id);
      setContactMessages((prev) => prev.filter((m) => m.id !== id));
    } finally {
      setContactActionBusy(null);
    }
  }, []);

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
      <SiteHeader />

      <main className="max-w-4xl mx-auto p-6 space-y-8">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Admin</h1>
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
          <>
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

            <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 transition-colors">
              <h2 className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                Showcase
              </h2>
              <div className="space-y-1.5 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Total likes</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100 tabular-nums">{stats.showcase.total_likes.toLocaleString()}</span>
                </div>
              </div>

              {showcasedLoading ? (
                <div className="space-y-2">
                  <ShowcasedSkeleton />
                  <ShowcasedSkeleton />
                </div>
              ) : showcased.length === 0 ? (
                <p className="text-sm text-gray-400 dark:text-gray-500">No carousels in the showcase.</p>
              ) : (
                <div className="space-y-2">
                  {showcased.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.title}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {item.showcase_author || "Anonymous"} &middot; {item.slide_count} slides &middot; {item.like_count} like{item.like_count !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/showcase/${item.share_token}`}
                          className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => handleRemove(item.id)}
                          disabled={actionBusy === item.id}
                          className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 transition-colors"
                        >
                          {actionBusy === item.id ? "Removing..." : "Remove"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  Contact Messages
                </h2>
                <button
                  onClick={() => setShowArchived((v) => !v)}
                  className="text-xs px-2 py-1 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  {showArchived ? "Hide archived" : "Show archived"}
                </button>
              </div>
              {contactsLoading ? (
                <div className="space-y-2">
                  <ShowcasedSkeleton />
                  <ShowcasedSkeleton />
                </div>
              ) : contactMessages.length === 0 ? (
                <p className="text-sm text-gray-400 dark:text-gray-500">No messages yet.</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {contactMessages.map((msg) => (
                    <div key={msg.id} className={`p-3 rounded-lg border ${msg.archived ? "border-gray-50 dark:border-gray-800/50 opacity-60" : "border-gray-100 dark:border-gray-800"}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{msg.name}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-gray-400">{new Date(msg.created_at).toLocaleDateString()}</span>
                          <button
                            onClick={() => handleArchive(msg.id)}
                            disabled={contactActionBusy === msg.id}
                            className="text-xs px-2 py-1 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"
                            title={msg.archived ? "Unarchive" : "Archive"}
                          >
                            {msg.archived ? "Unarchive" : "Archive"}
                          </button>
                          <button
                            onClick={() => handleDeleteContact(msg.id)}
                            disabled={contactActionBusy === msg.id}
                            className="text-xs px-2 py-1 rounded-md text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{msg.email}</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{msg.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
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

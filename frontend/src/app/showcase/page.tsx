"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { seedCarousels, type SeedCarousel } from "@/lib/showcase";
import { getShowcaseCarousels, type ShowcaseItem } from "@/lib/api";
import { AuthProvider } from "@/lib/auth";
import { SiteHeader } from "@/components/SiteHeader";

function SeedCard({ carousel }: { carousel: SeedCarousel }) {
  return (
    <Link
      href={`/showcase/${carousel.id}`}
      className="block bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 transition-all duration-200 ease-out motion-reduce:transition-none hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md hover:-translate-y-0.5"
    >
      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 leading-snug hover:text-sky-600 dark:hover:text-sky-400 transition-colors">{carousel.title}</h3>
      <p className="text-sm text-gray-400 dark:text-gray-500 mb-3">by {carousel.showcaseAuthor}</p>
      <p className="text-xs text-gray-400 dark:text-gray-500">{carousel.slideCount} slides</p>
    </Link>
  );
}

function ShowcaseCard({ item }: { item: ShowcaseItem }) {
  return (
    <Link
      href={`/showcase/${item.share_token}`}
      className="block bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 transition-all duration-200 ease-out motion-reduce:transition-none hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md hover:-translate-y-0.5"
    >
      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 leading-snug hover:text-sky-600 dark:hover:text-sky-400 transition-colors">{item.title}</h3>
      <p className="text-sm text-gray-400 dark:text-gray-500 mb-3">by {item.showcase_author || "Anonymous"}</p>
      <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
        <span>{item.slide_count} slides</span>
        {item.like_count !== undefined && item.like_count > 0 && (
          <span>{item.like_count} like{item.like_count !== 1 ? "s" : ""}</span>
        )}
      </div>
    </Link>
  );
}

function ShowcasePage() {
  const [community, setCommunity] = useState<ShowcaseItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getShowcaseCarousels()
      .then(setCommunity)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <SiteHeader />

      <main className="max-w-4xl mx-auto p-6">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">Showcase</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 max-w-lg">
          Discover carousels created by the community. Featured examples to inspire your next project.
        </p>

        <section className="mb-10">
          <h2 className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">
            Community showcase
          </h2>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 animate-pulse transition-colors">
                  <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
                  <div className="h-3 w-20 bg-gray-100 dark:bg-gray-800 rounded mb-3" />
                  <div className="h-3 w-16 bg-gray-100 dark:bg-gray-800 rounded" />
                </div>
              ))}
            </div>
          ) : community.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500">No community carousels yet. Be the first to submit one!</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {community.map((item) => (
                <ShowcaseCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">
            Featured examples
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {seedCarousels.map((c) => (
              <SeedCard key={c.id} carousel={c} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default function Showcase() {
  return (
    <AuthProvider>
      <ShowcasePage />
    </AuthProvider>
  );
}

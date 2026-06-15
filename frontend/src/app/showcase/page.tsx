"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { seedCarousels, type SeedCarousel } from "@/lib/showcase";
import { getShowcaseCarousels, type ShowcaseItem } from "@/lib/api";

function SeedCard({ carousel }: { carousel: SeedCarousel }) {
  const router = useRouter();

  const handleClone = () => {
    sessionStorage.setItem("clone-data", JSON.stringify({
      slides: carousel.slides,
      schemeIndex: carousel.schemeIndex,
      fontIndex: carousel.fontIndex,
      logo: carousel.logo,
      inverted: carousel.inverted,
      presentationTitle: carousel.presentationTitle,
    }));
    router.push("/");
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 transition-colors hover:border-gray-300 dark:hover:border-gray-700">
      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 leading-snug">{carousel.title}</h3>
      <p className="text-sm text-gray-400 dark:text-gray-500 mb-3">by {carousel.showcaseAuthor}</p>
      <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">{carousel.slideCount} slides</p>
      <div className="flex items-center gap-2">
        <Link
          href={`/showcase/${carousel.id}`}
          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-sky-600 border border-sky-200 dark:border-sky-800 rounded-lg hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-colors"
        >
          Preview
        </Link>
        <button
          onClick={handleClone}
          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Clone & Edit
        </button>
      </div>
    </div>
  );
}

function ShowcaseCard({ item }: { item: ShowcaseItem }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 transition-colors hover:border-gray-300 dark:hover:border-gray-700">
      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 leading-snug">{item.title}</h3>
      <p className="text-sm text-gray-400 dark:text-gray-500 mb-3">by {item.showcase_author || "Anonymous"}</p>
      <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">{item.slide_count} slides</p>
      <Link
        href={`/showcase/${item.share_token}`}
        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-sky-600 border border-sky-200 dark:border-sky-800 rounded-lg hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-colors"
      >
        View
      </Link>
    </div>
  );
}

export default function ShowcasePage() {
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
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 transition-colors">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              &larr; Editor
            </Link>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Showcase</h1>
          </div>
          <span className="text-sm text-gray-400 dark:text-gray-500">carouselify</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 max-w-lg">
          Discover carousels created by the community. Featured examples to inspire your next project.
        </p>

        <section className="mb-10">
          <h2 className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">
            Featured examples
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {seedCarousels.map((c) => (
              <SeedCard key={c.id} carousel={c} />
            ))}
          </div>
        </section>

        <section>
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
      </main>
    </div>
  );
}

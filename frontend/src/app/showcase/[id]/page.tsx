"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSharedCarousel } from "@/lib/api";
import { seedCarousels } from "@/lib/showcase";
import { SlideCanvas } from "@/components/slides/SlideCanvas";
import type { Slide, ColorScheme, FontPairing, LogoConfig } from "@/lib/types";
import { colorSchemes, fontPairings } from "@/lib/themes";
import "@/components/slides/slideStyles.css";

interface SharedCarouselData {
  slides: Slide[];
  scheme?: ColorScheme;
  schemeIndex: number;
  fontIndex: number;
  logo: LogoConfig;
  inverted: boolean;
  presentationTitle: string;
}

export default function ShowcasePreviewPage() {
  const params = useParams();
  const router = useRouter();
  const shareToken = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<SharedCarouselData | null>(null);
  const [showcaseAuthor, setShowcaseAuthor] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<"left" | "right">("right");
  const [darkMode, setDarkMode] = useState(() => typeof window !== "undefined" && localStorage.getItem("darkMode") === "true");
  const slideRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    if (!shareToken) return;
    setLoading(true);

    if (shareToken.startsWith("seed-")) {
      const seed = seedCarousels.find((s) => s.id === shareToken);
      if (seed) {
        setData({
          slides: seed.slides as Slide[],
          schemeIndex: seed.schemeIndex,
          fontIndex: seed.fontIndex,
          logo: seed.logo,
          inverted: seed.inverted,
          presentationTitle: seed.presentationTitle,
        });
        setShowcaseAuthor(seed.showcaseAuthor);
        setLoading(false);
        return;
      }
    }

    getSharedCarousel(shareToken)
      .then((res) => {
        setData(res.data as SharedCarouselData);
        setShowcaseAuthor((res as any).showcase_author || null);
      })
      .catch((err) => {
        setError(err.message || "Failed to load carousel");
      })
      .finally(() => setLoading(false));
  }, [shareToken]);

  const goNext = useCallback(() => {
    if (!data) return;
    setDirection("right");
    setCurrentIndex((prev) => (prev + 1) % data.slides.length);
  }, [data]);

  const goPrev = useCallback(() => {
    if (!data) return;
    setDirection("left");
    setCurrentIndex((prev) => (prev - 1 + data.slides.length) % data.slides.length);
  }, [data]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        goPrev();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goNext, goPrev]);

  const handleClone = () => {
    if (!data) return;
    sessionStorage.setItem("clone-data", JSON.stringify(data));
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors flex flex-col">
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 transition-colors">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="h-5 w-28 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-[600px] aspect-square bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
        </main>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors flex items-center justify-center">
        <div className="text-center max-w-sm">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Carousel not found</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{error || "This carousel doesn't exist or has been unshared."}</p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => router.push("/showcase")}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Back to Showcase
            </button>
            <button
              onClick={() => router.push("/")}
              className="px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-700 transition-colors"
            >
              Go to Editor
            </button>
          </div>
        </div>
      </div>
    );
  }

  const scheme: ColorScheme = data.scheme?.background ? data.scheme : data.schemeIndex !== undefined ? colorSchemes[data.schemeIndex] || colorSchemes[0] : colorSchemes[0];
  const fonts: FontPairing = data.fontIndex !== undefined ? fontPairings[data.fontIndex] || fontPairings[0] : fontPairings[0];
  const effectiveScheme: ColorScheme = data.inverted
    ? { ...scheme, background: scheme.textPrimary, textPrimary: scheme.background, textOnAccent: scheme.bgOnAccent, bgOnAccent: scheme.textPrimary }
    : scheme;

  const slide = data.slides[currentIndex];
  const totalSlides = data.slides.length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors flex flex-col">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4 transition-colors">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => router.push("/showcase")}
              className="flex-shrink-0 flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <span className="hidden sm:block text-sm text-gray-300 dark:text-gray-600">|</span>
            <div className="min-w-0">
              <h1 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                {data.presentationTitle || "Shared Carousel"}
              </h1>
              {showcaseAuthor && (
                <p className="text-xs text-gray-400 dark:text-gray-500">by {showcaseAuthor}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => {
                const next = !darkMode;
                setDarkMode(next);
                localStorage.setItem("darkMode", String(next));
                document.documentElement.classList.toggle("dark", next);
              }}
              className="w-9 h-9 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              )}
            </button>
            {showcaseAuthor && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20 rounded-full border border-amber-200 dark:border-amber-800">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                Featured
              </span>
            )}
            <button
              onClick={handleClone}
              className="px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-700 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
            >
              Clone & Edit
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-[600px]">
          <div className="relative" ref={slideRef}>
            <div
              className="rounded-xl overflow-hidden shadow-lg"
              style={{ backgroundColor: effectiveScheme.background }}
            >
              <div style={{ aspectRatio: "1", position: "relative", overflow: "hidden" }}>
                <div
                  key={slide.id + currentIndex}
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    width: 1080,
                    height: 1080,
                    transform: "translate(-50%, -50%) scale(0.5)",
                    transformOrigin: "center center",
                  }}
                >
                  <SlideCanvas
                    slide={slide}
                    scheme={effectiveScheme}
                    fonts={fonts}
                    logo={data.logo}
                    slideNumber={currentIndex + 1}
                    totalSlides={totalSlides}
                    readOnly
                  />
                </div>
              </div>
            </div>

            <button
              onClick={goPrev}
              className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/90 dark:bg-gray-900/90 hover:bg-white dark:hover:bg-gray-900 rounded-full shadow-md text-gray-700 dark:text-gray-200 transition-all hover:scale-105 border border-gray-200 dark:border-gray-700"
              aria-label="Previous slide"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={goNext}
              className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/90 dark:bg-gray-900/90 hover:bg-white dark:hover:bg-gray-900 rounded-full shadow-md text-gray-700 dark:text-gray-200 transition-all hover:scale-105 border border-gray-200 dark:border-gray-700"
              aria-label="Next slide"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 mt-4">
            {data.slides.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setDirection(i > currentIndex ? "right" : "left");
                  setCurrentIndex(i);
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentIndex
                    ? "bg-gray-800 dark:bg-gray-200 w-5"
                    : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

          <p className="text-center text-sm text-gray-400 dark:text-gray-500 mt-2">
            {currentIndex + 1} / {totalSlides}
          </p>
        </div>
      </main>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSharedCarousel } from "@/lib/api";
import { SlideCanvas } from "@/components/slides/SlideCanvas";
import type { Slide, ColorScheme, FontPairing, LogoConfig } from "@/lib/types";
import { colorSchemes, fontPairings } from "@/lib/themes";
import "@/components/slides/slideStyles.css";

interface SharedCarouselData {
  slides: Slide[];
  schemeIndex: number;
  fontIndex: number;
  logo: LogoConfig;
  inverted: boolean;
  presentationTitle: string;
}

export default function SharedCarouselPage() {
  const params = useParams();
  const router = useRouter();
  const shareToken = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<SharedCarouselData | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (!shareToken) return;
    setLoading(true);
    getSharedCarousel(shareToken)
      .then((res) => {
        setData(res.data as SharedCarouselData);
      })
      .catch((err) => {
        setError(err.message || "Failed to load carousel");
      })
      .finally(() => setLoading(false));
  }, [shareToken]);

  const handleClone = () => {
    if (!data) return;
    sessionStorage.setItem("clone-data", JSON.stringify(data));
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <p className="text-gray-500">Loading carousel...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Not found</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-4">{error || "This carousel doesn't exist or has been unshared."}</p>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-700 transition-colors"
          >
            Go to editor
          </button>
        </div>
      </div>
    );
  }

  const scheme: ColorScheme = data.schemeIndex !== undefined ? colorSchemes[data.schemeIndex] || colorSchemes[0] : colorSchemes[0];
  const fonts: FontPairing = data.fontIndex !== undefined ? fontPairings[data.fontIndex] || fontPairings[0] : fontPairings[0];
  const effectiveScheme: ColorScheme = data.inverted
    ? { ...scheme, background: scheme.textPrimary, textPrimary: scheme.background, textOnAccent: scheme.bgOnAccent, bgOnAccent: scheme.textPrimary }
    : scheme;

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors ${darkMode ? "dark" : ""}`}>
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 transition-colors">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">carouselify</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{data.presentationTitle || "Shared Carousel"}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setDarkMode(!darkMode);
                document.documentElement.classList.toggle("dark");
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
            <button
              onClick={handleClone}
              className="px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-700 transition-colors"
            >
              Clone and Edit
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-[600px] mx-auto p-6 space-y-6">
        {data.slides.map((slide: Slide, index: number) => (
          <div
            key={slide.id}
            className="rounded-xl overflow-hidden shadow-lg"
            style={{ backgroundColor: effectiveScheme.background }}
          >
            <div style={{ aspectRatio: "1", position: "relative", overflow: "hidden" }}>
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: 1080,
                  height: 1080,
                  transform: "scale(0.5)",
                  transformOrigin: "top left",
                }}
              >
                <SlideCanvas
                  slide={slide}
                  scheme={effectiveScheme}
                  fonts={fonts}
                  logo={data.logo}
                  slideNumber={index + 1}
                  totalSlides={data.slides.length}
                  readOnly
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

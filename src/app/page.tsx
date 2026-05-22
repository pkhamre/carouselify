"use client";

import { useState, useRef, useCallback } from "react";
import type { Slide, SlideType, ColorScheme, FontPairing, LogoConfig } from "@/lib/types";
import { defaultScheme, defaultFonts } from "@/lib/themes";
import { defaultLogo } from "@/lib/types";
import { createDefaultSlides, createSlide } from "@/lib/utils";
import { SlideCanvas } from "@/components/slides/SlideCanvas";
import { SlideEditor } from "@/components/SlideEditor";
import { ThemePicker } from "@/components/ThemePicker";
import { LogoSettings } from "@/components/LogoSettings";
import { ComingSoonCard } from "@/components/ComingSoonCard";
import { exportSlideAsPNG } from "@/lib/export";
import "@/components/slides/slideStyles.css";

export default function Home() {
  const [slides, setSlides] = useState<Slide[]>(createDefaultSlides);
  const [scheme, setScheme] = useState<ColorScheme>(defaultScheme);
  const [fonts, setFonts] = useState<FontPairing>(defaultFonts);
  const [logo, setLogo] = useState<LogoConfig>(defaultLogo);
  const [inverted, setInverted] = useState(false);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const [mobileTab, setMobileTab] = useState<"preview" | "edit" | "design">("preview");
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

  const updateSlide = useCallback((index: number, updatedSlide: Slide) => {
    setSlides((prev) => {
      const newSlides = [...prev];
      newSlides[index] = updatedSlide;
      return newSlides;
    });
  }, []);

  const changeSlideType = useCallback(
    (index: number, newType: SlideType) => {
      const newSlide = createSlide(newType, index);
      updateSlide(index, newSlide);
    },
    [updateSlide]
  );

  const addSlide = useCallback(() => {
    if (slides.length >= 12) return;
    const newSlide = createSlide("content-b1", slides.length);
    setSlides((prev) => [...prev, newSlide]);
    setActiveSlideIndex(slides.length);
  }, [slides.length]);

  const removeSlide = useCallback(
    (index: number) => {
      setSlides((prev) => prev.filter((_, i) => i !== index));
      setActiveSlideIndex((prev) => {
        if (prev === index) return Math.max(0, index - 1);
        if (prev > index) return prev - 1;
        return prev;
      });
    },
    []
  );

  const reorderSlide = useCallback(
    (index: number, direction: "up" | "down") => {
      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= slides.length) return;
      setSlides((prev) => {
        const newSlides = [...prev];
        [newSlides[index], newSlides[newIndex]] = [newSlides[newIndex], newSlides[index]];
        return newSlides;
      });
      setActiveSlideIndex(newIndex);
    },
    [slides.length]
  );

  const handleExportPNG = async () => {
    if (slides.length < 1) return;
    for (let i = 0; i < slideRefs.current.length; i++) {
      const el = slideRefs.current[i];
      if (!el) continue;
      await exportSlideAsPNG(el, i);
    }
  };

  const activeSlide = slides[activeSlideIndex];

  const effectiveScheme: ColorScheme = inverted
    ? {
        ...scheme,
        background: scheme.textPrimary,
        textPrimary: scheme.background,
        textOnAccent: scheme.bgOnAccent,
        bgOnAccent: scheme.textPrimary,
      }
    : scheme;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 transition-colors">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">carouselify</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Create beautiful carousels in minutes</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setDarkMode(!darkMode);
                document.documentElement.classList.toggle("dark");
              }}
              className="w-9 h-9 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              title="Toggle dark mode"
            >
              {darkMode ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              )}
            </button>
            <button
              onClick={handleExportPNG}
              className="px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-700 transition-colors"
            >
              Export PNG
            </button>
          </div>
        </div>
      </header>

      <div className="hidden lg:block max-w-[1600px] mx-auto p-6 pb-6">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-3 space-y-4">
            <ThemePicker
              selectedScheme={scheme}
              selectedFonts={fonts}
              inverted={inverted}
              onSchemeChange={setScheme}
              onFontsChange={setFonts}
              onInvertChange={setInverted}
            />

            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  Slides ({slides.length})
                </h3>
                <button
                  onClick={addSlide}
                  disabled={slides.length >= 12}
                  className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700 dark:text-gray-300"
                >
                  + Add
                </button>
              </div>
              <div className="space-y-1 max-h-[400px] overflow-y-auto">
                {slides.map((slide, index) => (
                  <div
                    key={slide.id}
                    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                      index === activeSlideIndex
                        ? "bg-sky-50 dark:bg-sky-900/30 border border-sky-200 dark:border-sky-800"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                    onClick={() => setActiveSlideIndex(index)}
                  >
                    <span className="text-xs font-mono text-gray-400 dark:text-gray-500 w-5">
                      {index + 1}
                    </span>
                    <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 truncate">
                      {slide.type === "cover" && slide.h1}
                      {slide.type === "content-b1" && slide.h2}
                      {slide.type === "content-b2" && slide.h2}
                      {slide.type === "list" && slide.h2}
                      {slide.type === "cta" && slide.h1}
                    </span>
                    <div className="flex items-center gap-0.5">
                      {index > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            reorderSlide(index, "up");
                          }}
                          className="w-5 h-5 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          ↑
                        </button>
                      )}
                      {index < slides.length - 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            reorderSlide(index, "down");
                          }}
                          className="w-5 h-5 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          ↓
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeSlide(index);
                        }}
                        className="w-5 h-5 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-red-500"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-span-5">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sticky top-6 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Preview</h3>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {slides.length > 0
                    ? `Slide ${activeSlideIndex + 1} of ${slides.length}`
                    : "No slides"}
                </span>
              </div>
              <div className="mx-auto max-w-[540px] bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden transition-colors">
                {slides.length > 0 ? (
                  <div style={{ aspectRatio: "1" }}>
                    <div
                      style={{
                        width: 1080,
                        height: 1080,
                        transform: "scale(0.5)",
                        transformOrigin: "top left",
                      }}
                    >
                      <SlideCanvas
                        slide={activeSlide}
                        scheme={effectiveScheme}
                        fonts={fonts}
                        logo={logo}
                        slideNumber={activeSlideIndex + 1}
                        totalSlides={slides.length}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[270px] text-gray-400 dark:text-gray-500 text-sm">
                    Add a slide to get started
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-span-4">
            <div className="sticky top-6 space-y-4">
              <ComingSoonCard />
              <LogoSettings
                logo={logo}
                onChange={setLogo}
              />
              {slides.length > 0 ? (
                <SlideEditor
                  slide={activeSlide}
                  onUpdate={(slide) => updateSlide(activeSlideIndex, slide)}
                  onTypeChange={(type) => changeSlideType(activeSlideIndex, type)}
                  slideIndex={activeSlideIndex}
                />
              ) : (
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 text-center text-gray-400 dark:text-gray-500 text-sm transition-colors">
                  Add a slide above to start editing
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile content */}
      <div className="lg:hidden space-y-4 p-6 pb-24">
        {mobileTab === "preview" && (
          <>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Preview</h3>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {slides.length > 0 ? `Slide ${activeSlideIndex + 1} of ${slides.length}` : "No slides"}
                </span>
              </div>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setActiveSlideIndex((p) => Math.max(0, p - 1))}
                  disabled={activeSlideIndex <= 0}
                  className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed bg-white dark:bg-gray-800 shrink-0"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <div className="mx-auto max-w-[360px] bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden transition-colors">
                  {slides.length > 0 ? (
                    <div style={{ aspectRatio: "1" }}>
                      <div style={{ width: 1080, height: 1080, transform: "scale(0.333)", transformOrigin: "top left" }}>
                        <SlideCanvas
                          slide={activeSlide}
                          scheme={effectiveScheme}
                          fonts={fonts}
                          logo={logo}
                          slideNumber={activeSlideIndex + 1}
                          totalSlides={slides.length}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-[120px] text-gray-400 dark:text-gray-500 text-sm">
                      Add a slide to get started
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setActiveSlideIndex((p) => Math.min(slides.length - 1, p + 1))}
                  disabled={activeSlideIndex >= slides.length - 1}
                  className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed bg-white dark:bg-gray-800 shrink-0"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
              <div className="mt-3">
                <button
                  onClick={handleExportPNG}
                  disabled={slides.length < 1}
                  className="w-full px-4 py-3 text-sm font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Export PNG
                </button>
              </div>
            </div>
            <ComingSoonCard />
          </>
        )}

        {mobileTab === "edit" && (
          <>
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 transition-colors">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Slides</h3>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Total: {slides.length}</span>
                  <button
                    onClick={addSlide}
                    disabled={slides.length >= 12}
                    className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700 dark:text-gray-300"
                  >
                    + Add
                  </button>
                </div>
                <div className="space-y-1 max-h-[200px] overflow-y-auto">
                  {slides.map((slide, index) => (
                    <div
                      key={slide.id}
                      className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                        index === activeSlideIndex
                          ? "bg-sky-50 dark:bg-sky-900/30 border border-sky-200 dark:border-sky-800"
                          : "hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                      onClick={() => { setActiveSlideIndex(index); setMobileTab("edit"); }}
                    >
                      <span className="text-xs font-mono text-gray-400 dark:text-gray-500 w-5">{index + 1}</span>
                      <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 truncate">
                        {slide.type === "cover" && slide.h1}
                        {slide.type === "content-b1" && slide.h2}
                        {slide.type === "content-b2" && slide.h2}
                        {slide.type === "list" && slide.h2}
                        {slide.type === "cta" && slide.h1}
                      </span>
                      <div className="flex items-center gap-0.5">
                        {index > 0 && (
                          <button onClick={(e) => { e.stopPropagation(); reorderSlide(index, "up"); }} className="w-5 h-5 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">↑</button>
                        )}
                        {index < slides.length - 1 && (
                          <button onClick={(e) => { e.stopPropagation(); reorderSlide(index, "down"); }} className="w-5 h-5 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">↓</button>
                        )}
                        <button onClick={(e) => { e.stopPropagation(); removeSlide(index); }} className="w-5 h-5 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-red-500">×</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {slides.length > 0 ? (
                <SlideEditor
                  slide={activeSlide}
                  onUpdate={(slide) => updateSlide(activeSlideIndex, slide)}
                  onTypeChange={(type) => changeSlideType(activeSlideIndex, type)}
                  slideIndex={activeSlideIndex}
                />
              ) : (
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 text-center text-gray-400 dark:text-gray-500 text-sm transition-colors">
                  Add a slide above to start editing
                </div>
              )}
            </div>
            <ComingSoonCard />
          </>
        )}

        {mobileTab === "design" && (
          <>
            <div className="space-y-4">
              <ThemePicker
                selectedScheme={scheme}
                selectedFonts={fonts}
                inverted={inverted}
                onSchemeChange={setScheme}
                onFontsChange={setFonts}
                onInvertChange={setInverted}
              />
              <LogoSettings logo={logo} onChange={setLogo} />
            </div>
            <ComingSoonCard />
          </>
        )}
      </div>

      {/* Mobile bottom tab bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="flex">
          {(["preview", "edit", "design"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setMobileTab(tab)}
              className={`flex-1 py-3 text-xs font-medium text-center transition-colors ${
                mobileTab === tab
                  ? "text-sky-600 border-t-2 border-sky-600 bg-sky-50 dark:bg-sky-900/20"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              {tab === "preview" && "Preview"}
              {tab === "edit" && "Edit"}
              {tab === "design" && "Design"}
            </button>
          ))}
        </div>
      </div>

      <div
        style={{
          position: "fixed",
          left: "-9999px",
          top: 0,
          pointerEvents: "none",
        }}
        aria-hidden="true"
      >
        {slides.map((slide, index) => (
          <div
            key={`export-${slide.id}`}
            ref={(el) => {
              slideRefs.current[index] = el;
            }}
            style={{ width: 1080, height: 1080 }}
          >
            <SlideCanvas
              slide={slide}
              scheme={effectiveScheme}
              fonts={fonts}
              logo={logo}
              slideNumber={index + 1}
              totalSlides={slides.length}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

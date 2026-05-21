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
import { exportAsPNG, exportAsPDF, downloadBlob } from "@/lib/export";
import "@/components/slides/slideStyles.css";

export default function Home() {
  const [slides, setSlides] = useState<Slide[]>(createDefaultSlides);
  const [scheme, setScheme] = useState<ColorScheme>(defaultScheme);
  const [fonts, setFonts] = useState<FontPairing>(defaultFonts);
  const [logo, setLogo] = useState<LogoConfig>(defaultLogo);
  const [inverted, setInverted] = useState(false);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
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
      if (slides.length <= 5) return;
      if (index === 0 || index === slides.length - 1) return;
      setSlides((prev) => prev.filter((_, i) => i !== index));
      if (activeSlideIndex >= index && activeSlideIndex > 0) {
        setActiveSlideIndex((prev) => prev - 1);
      }
    },
    [slides.length, activeSlideIndex]
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
    for (let i = 0; i < slideRefs.current.length; i++) {
      const el = slideRefs.current[i];
      if (!el) continue;
      const blob = await exportAsPNG(el);
      downloadBlob(blob, `carousel-slide-${i + 1}.png`);
    }
  };

  const handleExportPDF = async () => {
    const elements = slideRefs.current.filter(Boolean) as HTMLElement[];
    if (elements.length === 0) return;
    const blob = await exportAsPDF(elements);
    downloadBlob(blob, "linkedin-carousel.pdf");
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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">LinkedIn Carousel Generator</h1>
            <p className="text-sm text-gray-500 mt-0.5">Create beautiful carousels in minutes</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportPNG}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Export PNG
            </button>
            <button
              onClick={handleExportPDF}
              className="px-4 py-2 text-sm font-medium text-white bg-pink-600 rounded-lg hover:bg-pink-700 transition-colors"
            >
              Export PDF
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto p-6">
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

            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">
                  Slides ({slides.length})
                </h3>
                <button
                  onClick={addSlide}
                  disabled={slides.length >= 12}
                  className="text-xs px-2 py-1 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                        ? "bg-pink-50 border border-pink-200"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => setActiveSlideIndex(index)}
                  >
                    <span className="text-xs font-mono text-gray-400 w-5">
                      {index + 1}
                    </span>
                    <span className="flex-1 text-sm text-gray-700 truncate">
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
                          className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600"
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
                          className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600"
                        >
                          ↓
                        </button>
                      )}
                      {index > 0 && index < slides.length - 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeSlide(index);
                          }}
                          className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-red-500"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-span-5">
            <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">Preview</h3>
                <span className="text-xs text-gray-500">
                  Slide {activeSlideIndex + 1} of {slides.length}
                </span>
              </div>
              <div className="flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden">
                <div
                  style={{
                    width: "100%",
                    maxWidth: 540,
                    aspectRatio: "1",
                  }}
                >
                  <div
                    style={{
                      width: 1080,
                      height: 1080,
                      transform: "scale(0.5)",
                      transformOrigin: "top left",
                    }}
                    ref={(el) => {
                      slideRefs.current[activeSlideIndex] = el;
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
              </div>
            </div>
          </div>

          <div className="col-span-4">
            <div className="sticky top-6 space-y-4">
              <LogoSettings
                logo={logo}
                onChange={setLogo}
              />
              <SlideEditor
                slide={activeSlide}
                onUpdate={(slide) => updateSlide(activeSlideIndex, slide)}
                onTypeChange={(type) => changeSlideType(activeSlideIndex, type)}
                slideIndex={activeSlideIndex}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="sr-only" aria-hidden="true">
        {slides.map((slide, index) => (
          <div
            key={`export-${slide.id}`}
            ref={(el) => {
              if (index !== activeSlideIndex) {
                slideRefs.current[index] = el;
              }
            }}
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

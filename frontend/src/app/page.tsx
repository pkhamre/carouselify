"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { Slide, SlideType, ColorScheme, FontPairing, LogoConfig } from "@/lib/types";
import { defaultScheme, defaultFonts, colorSchemes, fontPairings } from "@/lib/themes";
import { defaultLogo } from "@/lib/types";
import { createDefaultSlides, createSlide } from "@/lib/utils";
import { SlideCanvas } from "@/components/slides/SlideCanvas";
import { SlideEditor } from "@/components/SlideEditor";
import { ThemePicker } from "@/components/ThemePicker";
import { LogoSettings } from "@/components/LogoSettings";
import { AuthProvider } from "@/lib/auth";
import { SaveButton } from "@/components/SaveButton";
import { MyCarousels } from "@/components/MyCarousels";
import { ShareDialog } from "@/components/ShareDialog";
import { UserMenu } from "@/components/UserMenu";
import { SiteHeader } from "@/components/SiteHeader";
import { ToastProvider, useToast } from "@/components/Toast";
import { exportSlideAsPNG, exportSlidesAsPDF, getFontEmbedCSS } from "@/lib/export";
import { captureExport, captureSave, captureAiGenerate } from "@/lib/analytics";
import { trackEvent, publishShowcase, unpublishShowcase, getCarousel } from "@/lib/api";
import { AiDialog } from "@/components/AiDialog";
import { SettingsDialog } from "@/components/SettingsDialog";
import { getCredits } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import "@/components/slides/slideStyles.css";

const THUMBNAIL_SIZE = 64;

function SaveButtonWithToast({ carouselData, savedId, defaultTitle, onSaved }: Parameters<typeof SaveButton>[0]) {
  const { toast } = useToast();
  const slideCount = (carouselData?.slides?.length) || 0;
  return (
    <SaveButton
      carouselData={carouselData}
      savedId={savedId}
      defaultTitle={defaultTitle}
      onSaved={(id, title) => {
        onSaved(id, title);
        captureSave(slideCount);
        toast("Carousel saved!");
      }}
    />
  );
}

export default function Home() {
  return (
    <ToastProvider>
      <AuthProvider>
        <HomeContent />
      </AuthProvider>
    </ToastProvider>
  );
}

function HomeContent() {
  const [slides, setSlides] = useState<Slide[]>(createDefaultSlides);
  const { toast } = useToast();
  const [scheme, setScheme] = useState<ColorScheme>(defaultScheme);
  const [fonts, setFonts] = useState<FontPairing>(defaultFonts);
  const [logo, setLogo] = useState<LogoConfig>(defaultLogo);
  const [inverted, setInverted] = useState(false);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [mobileTab, setMobileTab] = useState<"preview" | "edit" | "design">("preview");
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [savedCarouselId, setSavedCarouselId] = useState<string | null>(null);
  const [savedTitle, setSavedTitle] = useState("");
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [showcaseStatus, setShowcaseStatus] = useState<"none" | "showcased">("none");
  const [showcaseAuthor, setShowcaseAuthor] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [undoStack, setUndoStack] = useState<Slide[][]>([]);
  const [exportProgress, setExportProgress] = useState<{ current: number; total: number } | null>(null);
  const [carouselRefreshKey, setCarouselRefreshKey] = useState(0);
  const [showAiDialog, setShowAiDialog] = useState(false);
  const [credits, setCredits] = useState<{ remaining: number; limit: number } | null>(null);
  const [hasSeenWelcome, setHasSeenWelcome] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("has_seen_welcome") === "true";
    return false;
  });

  const handleDismissWelcome = useCallback(() => {
    localStorage.setItem("has_seen_welcome", "true");
    setHasSeenWelcome(true);
  }, []);

  useEffect(() => {
    if (!savedCarouselId) return;
    getCarousel(savedCarouselId).then(c => {
      setShowcaseStatus(c.showcased ? "showcased" : "none");
      setShowcaseAuthor(c.showcase_author || "");
    }).catch(() => {});
  }, [savedCarouselId, carouselRefreshKey]);

  const handlePublishShowcase = useCallback(async (author?: string) => {
    if (!savedCarouselId) return;
    try {
      await publishShowcase(savedCarouselId, author);
      setShowcaseStatus("showcased");
      setShowcaseAuthor(author || "");
      toast("Published to showcase!");
    } catch (err: any) {
      toast(err.message || "Failed to publish");
    }
  }, [savedCarouselId, toast]);

  const handleUnpublishShowcase = useCallback(async () => {
    if (!savedCarouselId) return;
    try {
      await unpublishShowcase(savedCarouselId);
      setShowcaseStatus("none");
      setShowcaseAuthor("");
      toast("Removed from showcase");
    } catch (err: any) {
      toast(err.message || "Failed to remove");
    }
  }, [savedCarouselId, toast]);

  useEffect(() => {
    const cloneData = sessionStorage.getItem("clone-data");
    if (cloneData) {
      try {
        const parsed = JSON.parse(cloneData);
        if (parsed.slides) setSlides(parsed.slides);
        if (parsed.scheme?.background) setScheme(parsed.scheme);
        else if (parsed.schemeIndex !== undefined) setScheme(colorSchemes[parsed.schemeIndex] || defaultScheme);
        if (parsed.fontIndex !== undefined) setFonts(fontPairings[parsed.fontIndex] || defaultFonts);
        if (parsed.logo) setLogo(parsed.logo);
        if (parsed.inverted !== undefined) setInverted(parsed.inverted);
      } catch {}
      sessionStorage.removeItem("clone-data");
    }
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const isCtrl = e.ctrlKey || e.metaKey;
      if (isCtrl && e.key === "z") {
        e.preventDefault();
        undoDelete();
      } else if (isCtrl && e.key === "s") {
        e.preventDefault();
        const btn = document.querySelector("[data-save-btn]");
        (btn as HTMLButtonElement)?.click();
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        setActiveSlideIndex((p) => Math.max(0, p - 1));
      } else if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault();
        setActiveSlideIndex((p) => Math.min(slides.length - 1, p + 1));
      } else if (e.key === "Delete" || e.key === "Backspace") {
        if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") return;
        e.preventDefault();
        if (slides.length > 1) {
          removeSlideWithUndo(activeSlideIndex);
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

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
    const firstEl = slideRefs.current[0];
    if (!firstEl) return;
    try {
      const fontEmbedCSS = await getFontEmbedCSS(firstEl);
      setExportProgress({ current: 0, total: slides.length });
      for (let i = 0; i < slideRefs.current.length; i++) {
        const el = slideRefs.current[i];
        if (!el) continue;
        await exportSlideAsPNG(el, i, fontEmbedCSS);
        setExportProgress({ current: i + 1, total: slides.length });
      }
      setExportProgress(null);
      captureExport(slides.length);
      trackEvent("carousel_exported", { slide_count: slides.length }).catch(() => {});
      if (!hasSeenWelcome) {
        localStorage.setItem("has_seen_welcome", "true");
        setHasSeenWelcome(true);
      }
    } catch (err) {
      setExportProgress(null);
      toast("Export failed. Please try again.", "error");
    }
  };

  const handleExportPDF = async () => {
    if (slides.length < 1) return;
    const firstEl = slideRefs.current[0];
    if (!firstEl) return;
    try {
      const fontEmbedCSS = await getFontEmbedCSS(firstEl);
      setExportProgress({ current: 0, total: slides.length });
      const elements = slideRefs.current.filter(Boolean) as HTMLElement[];
      await exportSlidesAsPDF(elements, fontEmbedCSS);
      setExportProgress(null);
      captureExport(slides.length);
      trackEvent("carousel_exported", { slide_count: slides.length }).catch(() => {});
      if (!hasSeenWelcome) {
        localStorage.setItem("has_seen_welcome", "true");
        setHasSeenWelcome(true);
      }
    } catch (err) {
      setExportProgress(null);
      toast("PDF export failed. Please try again.", "error");
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

  const undoDelete = useCallback(() => {
    setUndoStack((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      setSlides(last);
      return prev.slice(0, -1);
    });
  }, []);

  const removeSlideWithUndo = useCallback((index: number) => {
    setUndoStack((prev) => [...prev, slides]);
    setSlides((prev) => prev.filter((_, i) => i !== index));
    setActiveSlideIndex((prev) => {
      if (prev === index) return Math.max(0, index - 1);
      if (prev > index) return prev - 1;
      return prev;
    });
    toast("Slide deleted", "success", { label: "Undo", onClick: undoDelete });
  }, [slides, toast, undoDelete]);

  const handleLoadCarousel = useCallback((data: any) => {
    const d = data.data;
    if (d.slides) setSlides(d.slides);
    if (d.scheme?.background) setScheme(d.scheme);
    else if (d.schemeIndex !== undefined) setScheme(colorSchemes[d.schemeIndex] || defaultScheme);
    if (d.fontIndex !== undefined) setFonts(fontPairings[d.fontIndex] || defaultFonts);
    if (d.logo) setLogo(d.logo);
    if (d.inverted !== undefined) setInverted(d.inverted);
    setSavedCarouselId(data.id);
    setSavedTitle(data.title || "");
    setShareUrl(data.share_token ? `/showcase/${data.share_token}` : null);
  }, []);

  const { user } = useAuth();

  useEffect(() => {
    if (user?.is_premium) {
      getCredits().then(setCredits).catch(() => {});
    }
  }, [user?.is_premium]);

  const handleAiGenerated = useCallback((newSlides: any[]) => {
    setSlides(newSlides);
    setActiveSlideIndex(0);
    captureAiGenerate(newSlides.length);
    if (user?.is_premium) {
      getCredits().then(setCredits).catch(() => {});
    }
  }, [user?.is_premium]);

  const carouselData = {
    slides,
    scheme,
    schemeIndex: colorSchemes.indexOf(scheme),
    fontIndex: fontPairings.indexOf(fonts),
    logo,
    inverted,
    presentationTitle: "My Deck",
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <SiteHeader onShowSettings={() => setShowSettings(true)} />

      <div className="hidden lg:block max-w-[1600px] mx-auto p-6 pb-24">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-3 space-y-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  Slides ({slides.length})
                </h3>
                <button
                  onClick={addSlide}
                  disabled={slides.length >= 12}
                  aria-label="Add slide"
                  className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700 dark:text-gray-300"
                >
                  + Add
                </button>
              </div>
              <div className="space-y-2 max-h-[400px] overflow-y-auto" role="listbox" aria-label="Slide list">
                {slides.map((slide, index) => (
                  <div
                    key={slide.id}
                    role="option"
                    aria-selected={index === activeSlideIndex}
                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                      index === activeSlideIndex
                        ? "bg-sky-50 dark:bg-sky-900/30 border border-sky-200 dark:border-sky-800"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                    onClick={() => setActiveSlideIndex(index)}
                  >
                    <div
                      style={{ width: THUMBNAIL_SIZE, height: THUMBNAIL_SIZE, position: "relative", overflow: "hidden", borderRadius: 6, flexShrink: 0 }}
                    >
                      <div
                        style={{ position: "absolute", top: 0, left: 0, width: 1080, height: 1080, transform: `scale(${THUMBNAIL_SIZE / 1080})`, transformOrigin: "top left", pointerEvents: "none" }}
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
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {slide.type === "cover" && (slide.h1 || "Cover")}
                        {slide.type === "content-b1" && (slide.h2 || "Content")}
                        {slide.type === "content-b2" && (slide.h2 || "Content")}
                        {slide.type === "list" && (slide.h2 || "List")}
                        {slide.type === "cta" && (slide.h1 || "CTA")}
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                        Slide {index + 1} · {slide.type.replace("content-b", "Content ").replace("cta", "CTA").replace("cover", "Cover").replace("list", "List")}
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {index > 0 && (
                        <button
                          onClick={(e) => { e.stopPropagation(); reorderSlide(index, "up"); }}
                          aria-label="Move slide up"
                          className="w-6 h-6 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          ↑
                        </button>
                      )}
                      {index < slides.length - 1 && (
                        <button
                          onClick={(e) => { e.stopPropagation(); reorderSlide(index, "down"); }}
                          aria-label="Move slide down"
                          className="w-6 h-6 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          ↓
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); removeSlideWithUndo(index); }}
                        aria-label="Delete slide"
                        className="w-6 h-6 flex items-center justify-center text-red-400 dark:text-red-500 hover:text-red-600 dark:hover:text-red-400 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        ×
                      </button>
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

            <MyCarousels
              onLoad={handleLoadCarousel}
              refreshKey={carouselRefreshKey}
              showWelcome={!hasSeenWelcome}
              onDismissWelcome={handleDismissWelcome}
            />
          </div>

          <div className="col-span-5">
            <div className="bg-slate-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sticky top-6 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Preview</h3>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {slides.length > 0
                    ? `Slide ${activeSlideIndex + 1} of ${slides.length}`
                    : "No slides"}
                </span>
              </div>
              <div className="mx-auto max-w-[540px] bg-gray-100 dark:bg-gray-800 rounded-lg transition-colors" style={{ aspectRatio: "1", position: "relative", overflow: "hidden" }}>
                {slides.length > 0 ? (
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
                        slide={activeSlide}
                        scheme={effectiveScheme}
                        fonts={fonts}
                        logo={logo}
                        slideNumber={activeSlideIndex + 1}
                        totalSlides={slides.length}
                      />
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
              <ThemePicker
                selectedScheme={scheme}
                selectedFonts={fonts}
                inverted={inverted}
                onSchemeChange={setScheme}
                onFontsChange={setFonts}
                onInvertChange={setInverted}
              />
              <LogoSettings
                logo={logo}
                onChange={setLogo}
              />
              {savedCarouselId && (
                <ShareDialog
                  carouselId={savedCarouselId}
                  shareUrl={shareUrl}
                  onShared={setShareUrl}
                  onRevoked={() => setShareUrl(null)}
                  showcaseStatus={showcaseStatus}
                  showcaseAuthor={showcaseAuthor}
                  onShowcasePublish={handlePublishShowcase}
                  onShowcaseUnpublish={handleUnpublishShowcase}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop floating bottom bar */}
      <div className="hidden lg:block fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-6 py-3 transition-colors">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {user?.is_premium && credits !== null && (
              <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                AI: {credits.remaining}/{credits.limit}
              </span>
            )}
            <button
              onClick={() => setShowAiDialog(true)}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              aria-label="Generate slides with AI"
            >
              Generate with AI
            </button>
          </div>
          <div className="flex items-center gap-3">
            <SaveButtonWithToast
              carouselData={carouselData}
              savedId={savedCarouselId}
              defaultTitle={savedTitle}
              onSaved={(id, title) => { setSavedCarouselId(id); setSavedTitle(title); setCarouselRefreshKey(k => k + 1); }}
            />
            <button
              onClick={handleExportPNG}
              disabled={!!exportProgress}
              aria-label="Export all slides as PNG images"
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
            >
              {exportProgress ? `${exportProgress.current}/${exportProgress.total}` : "Export PNG"}
            </button>
            <button
              onClick={handleExportPDF}
              disabled={!!exportProgress}
              aria-label="Export all slides as PDF"
              className="px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-700 disabled:opacity-50 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
            >
              {exportProgress ? `${exportProgress.current}/${exportProgress.total}` : "Export PDF"}
            </button>
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
                  aria-label="Previous slide"
                  className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed bg-white dark:bg-gray-800 shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <div className="flex-1 max-w-[360px] bg-slate-50 dark:bg-gray-800 rounded-lg transition-colors" style={{ aspectRatio: "1", position: "relative", overflow: "hidden" }}>
                  {slides.length > 0 ? (
                    <div style={{ position: "absolute", top: 0, left: 0, width: 1080, height: 1080, transform: "scale(0.333)", transformOrigin: "top left" }}>
                        <SlideCanvas
                          slide={activeSlide}
                          scheme={effectiveScheme}
                          fonts={fonts}
                          logo={logo}
                          slideNumber={activeSlideIndex + 1}
                          totalSlides={slides.length}
                        />
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
                  aria-label="Next slide"
                  className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed bg-white dark:bg-gray-800 shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
              <div className="mt-3 flex flex-col gap-2">
                <SaveButtonWithToast
                  carouselData={carouselData}
                  savedId={savedCarouselId}
                  defaultTitle={savedTitle}
                   onSaved={(id, title) => { setSavedCarouselId(id); setSavedTitle(title); setCarouselRefreshKey(k => k + 1); }}
                />
                <button
                  onClick={() => setShowAiDialog(true)}
                  className="w-full px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Generate slides with AI"
                >
                  Generate with AI
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={handleExportPNG}
                    disabled={slides.length < 1 || !!exportProgress}
                    aria-label="Export all slides as PNG images"
                    className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
                  >
                    {exportProgress ? `${exportProgress.current}/${exportProgress.total}` : "Export PNG"}
                  </button>
                  <button
                    onClick={handleExportPDF}
                    disabled={slides.length < 1 || !!exportProgress}
                    aria-label="Export all slides as PDF"
                    className="flex-1 px-4 py-3 text-sm font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
                  >
                    {exportProgress ? `${exportProgress.current}/${exportProgress.total}` : "Export PDF"}
                  </button>
                </div>
              </div>
            </div>
            {savedCarouselId && (
              <ShareDialog
                carouselId={savedCarouselId}
                shareUrl={shareUrl}
                onShared={setShareUrl}
                onRevoked={() => setShareUrl(null)}
                showcaseStatus={showcaseStatus}
                showcaseAuthor={showcaseAuthor}
                onShowcasePublish={handlePublishShowcase}
                  onShowcaseUnpublish={handleUnpublishShowcase}
              />
            )}
          </>
        )}

        {mobileTab === "edit" && (
          <>
            <div className="space-y-4">
            <MyCarousels
              onLoad={handleLoadCarousel}
              refreshKey={carouselRefreshKey}
              showWelcome={!hasSeenWelcome}
              onDismissWelcome={handleDismissWelcome}
            />

              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 transition-colors">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Slides</h3>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Total: {slides.length}</span>
                  <button
                    onClick={addSlide}
                    disabled={slides.length >= 12}
                    aria-label="Add slide"
                    className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700 dark:text-gray-300"
                  >
                    + Add
                  </button>
                </div>
                <div className="space-y-2 max-h-[200px] overflow-y-auto" role="listbox" aria-label="Slide list">
                  {slides.map((slide, index) => (
                    <div
                      key={slide.id}
                      role="option"
                      aria-selected={index === activeSlideIndex}
                      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                        index === activeSlideIndex
                          ? "bg-sky-50 dark:bg-sky-900/30 border border-sky-200 dark:border-sky-800"
                          : "hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                      onClick={() => { setActiveSlideIndex(index); setMobileTab("edit"); }}
                    >
                      <div
                        style={{ width: 48, height: 48, position: "relative", overflow: "hidden", borderRadius: 4, flexShrink: 0 }}
                      >
                        <div
                          style={{ position: "absolute", top: 0, left: 0, width: 1080, height: 1080, transform: "scale(0.044)", transformOrigin: "top left", pointerEvents: "none" }}
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
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {slide.type === "cover" && (slide.h1 || "Cover")}
                          {slide.type === "content-b1" && (slide.h2 || "Content")}
                          {slide.type === "content-b2" && (slide.h2 || "Content")}
                          {slide.type === "list" && (slide.h2 || "List")}
                          {slide.type === "cta" && (slide.h1 || "CTA")}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                          Slide {index + 1}
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {index > 0 && (
                          <button onClick={(e) => { e.stopPropagation(); reorderSlide(index, "up"); }} aria-label="Move slide up" className="w-6 h-6 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded hover:bg-gray-100 dark:hover:bg-gray-700">↑</button>
                        )}
                        {index < slides.length - 1 && (
                          <button onClick={(e) => { e.stopPropagation(); reorderSlide(index, "down"); }} aria-label="Move slide down" className="w-6 h-6 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded hover:bg-gray-100 dark:hover:bg-gray-700">↓</button>
                        )}
                        <button onClick={(e) => { e.stopPropagation(); removeSlideWithUndo(index); }} aria-label="Delete slide" className="w-6 h-6 flex items-center justify-center text-red-400 dark:text-red-500 hover:text-red-600 dark:hover:text-red-400 rounded hover:bg-red-50 dark:hover:bg-red-900/20">×</button>
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
            {savedCarouselId && (
              <ShareDialog
                carouselId={savedCarouselId}
                shareUrl={shareUrl}
                onShared={setShareUrl}
                onRevoked={() => setShareUrl(null)}
                showcaseStatus={showcaseStatus}
                showcaseAuthor={showcaseAuthor}
                onShowcasePublish={handlePublishShowcase}
                  onShowcaseUnpublish={handleUnpublishShowcase}
              />
            )}
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

      <SettingsDialog
        open={showSettings}
        onClose={() => setShowSettings(false)}
      />

      <AiDialog
        open={showAiDialog}
        onClose={() => setShowAiDialog(false)}
        onGenerate={handleAiGenerated}
      />
    </div>
  );
}

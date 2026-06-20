"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { listSchemes, createScheme, updateScheme, deleteScheme } from "@/lib/api";
import type { ColorScheme, FontPairing } from "@/lib/types";
import { colorSchemes, fontPairings } from "@/lib/themes";
import { curatedFonts, buildGoogleFontsUrl, buildPreviewFontsUrl } from "@/lib/googleFonts";
import type { GoogleFont } from "@/lib/googleFonts";

interface ThemePickerProps {
  selectedScheme: ColorScheme;
  selectedFonts: FontPairing;
  inverted: boolean;
  onSchemeChange: (scheme: ColorScheme) => void;
  onFontsChange: (fonts: FontPairing) => void;
  onInvertChange: (inverted: boolean) => void;
}

interface SavedScheme {
  id: string;
  name: string;
  background: string;
  accent: string;
  text_primary: string;
  text_on_accent: string;
  bg_on_accent: string;
}

const categoryLabels: Record<string, string> = {
  "sans-serif": "Sans",
  serif: "Serif",
  display: "Display",
  handwriting: "Hand",
  monospace: "Mono",
};

export function ThemePicker({
  selectedScheme,
  selectedFonts,
  inverted,
  onSchemeChange,
  onFontsChange,
  onInvertChange,
}: ThemePickerProps) {
  const { isAuthenticated, user } = useAuth();
  const isPremium = user?.is_premium ?? false;
  const isCustom = selectedScheme.name === "Custom";
  const isCustomFont = selectedFonts.name === "Custom";
  const [customBg, setCustomBg] = useState("#EAF0F6");
  const [customAccent, setCustomAccent] = useState("#0A7EAD");
  const [customText, setCustomText] = useState("#0D1B2A");
  const [savedSchemes, setSavedSchemes] = useState<SavedScheme[]>([]);
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editingColorScheme, setEditingColorScheme] = useState<string | null>(null);
  const [editColors, setEditColors] = useState({ background: "", accent: "", text_primary: "", text_on_accent: "", bg_on_accent: "" });

  const [customDisplay, setCustomDisplay] = useState(selectedFonts.display);
  const [customBody, setCustomBody] = useState(selectedFonts.body);
  const [displaySearch, setDisplaySearch] = useState(isCustomFont ? selectedFonts.display : "");
  const [bodySearch, setBodySearch] = useState(isCustomFont ? selectedFonts.body : "");
  const [showDisplayDropdown, setShowDisplayDropdown] = useState(false);
  const [showBodyDropdown, setShowBodyDropdown] = useState(false);

  const fontLinkRef = useRef<HTMLLinkElement | null>(null);
  const previewLinkRef = useRef<HTMLLinkElement | null>(null);
  const displayDropdownRef = useRef<HTMLDivElement | null>(null);
  const bodyDropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isCustomFont) {
      setCustomDisplay(selectedFonts.display);
      setCustomBody(selectedFonts.body);
      setDisplaySearch(selectedFonts.display);
      setBodySearch(selectedFonts.body);
    }
  }, [selectedFonts, isCustomFont]);

  useEffect(() => {
    if (!isCustomFont || !selectedFonts.googleFontsUrl) {
      if (fontLinkRef.current) {
        fontLinkRef.current.remove();
        fontLinkRef.current = null;
      }
      return;
    }
    if (fontLinkRef.current?.href === selectedFonts.googleFontsUrl) return;
    if (fontLinkRef.current) fontLinkRef.current.remove();
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = selectedFonts.googleFontsUrl;
    link.crossOrigin = "anonymous";
    document.head.appendChild(link);
    fontLinkRef.current = link;
  }, [isCustomFont, selectedFonts]);

  useEffect(() => {
    if (!isCustomFont) {
      if (previewLinkRef.current) {
        previewLinkRef.current.remove();
        previewLinkRef.current = null;
      }
      return;
    }
    if (previewLinkRef.current) return;
    const popularFonts = curatedFonts
      .filter((f) => f.popular)
      .map((f) => f.family);
    const url = buildPreviewFontsUrl(popularFonts);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = url;
    link.crossOrigin = "anonymous";
    document.head.appendChild(link);
    previewLinkRef.current = link;
  }, [isCustomFont]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (displayDropdownRef.current && !displayDropdownRef.current.contains(e.target as Node)) {
        setShowDisplayDropdown(false);
      }
      if (bodyDropdownRef.current && !bodyDropdownRef.current.contains(e.target as Node)) {
        setShowBodyDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    return () => {
      if (fontLinkRef.current) fontLinkRef.current.remove();
      if (previewLinkRef.current) previewLinkRef.current.remove();
    };
  }, []);

  const filteredFonts = (search: string): GoogleFont[] => {
    if (!search.trim()) return curatedFonts;
    const q = search.toLowerCase();
    return curatedFonts.filter((f) => f.family.toLowerCase().includes(q));
  };

  const selectDisplayFont = (font: GoogleFont) => {
    setCustomDisplay(font.family);
    setDisplaySearch(font.family);
    setShowDisplayDropdown(false);
    const body = customBody || selectedFonts.body;
    onFontsChange({
      name: "Custom",
      display: font.family,
      body,
      googleFontsUrl: buildGoogleFontsUrl(font.family, body),
    });
  };

  const selectBodyFont = (font: GoogleFont) => {
    setCustomBody(font.family);
    setBodySearch(font.family);
    setShowBodyDropdown(false);
    const display = customDisplay || selectedFonts.display;
    onFontsChange({
      name: "Custom",
      display,
      body: font.family,
      googleFontsUrl: buildGoogleFontsUrl(display, font.family),
    });
  };

  const groupedFonts = (search: string) => {
    const filtered = filteredFonts(search);
    const groups: { category: string; fonts: GoogleFont[] }[] = [];
    const order = ["sans-serif", "serif", "display", "handwriting", "monospace"];
    for (const cat of order) {
      const f = filtered.filter((f) => f.category === cat);
      if (f.length > 0) groups.push({ category: cat, fonts: f });
    }
    return groups;
  };

  const fetchSchemes = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setSavedSchemes(await listSchemes());
    } catch {}
  }, [isAuthenticated]);

  useEffect(() => {
    fetchSchemes();
  }, [fetchSchemes]);

  const updateCustom = (bg: string, accent: string, text: string) => {
    setCustomBg(bg);
    setCustomAccent(accent);
    setCustomText(text);
    onSchemeChange({
      name: "Custom",
      background: bg,
      accent: accent,
      textPrimary: text,
      textOnAccent: bg,
      bgOnAccent: bg,
    });
  };

  const handleSaveScheme = async () => {
    if (!saveName.trim()) return;
    try {
      const created = await createScheme({
        name: saveName.trim(),
        background: customBg,
        accent: customAccent,
        text_primary: customText,
        text_on_accent: customBg,
        bg_on_accent: customBg,
      });
      setSavedSchemes((prev) => [...prev, created]);
      setShowSaveInput(false);
      setSaveName("");
    } catch {}
  };

  const handleRenameScheme = async (id: string) => {
    if (!editName.trim()) return;
    try {
      await updateScheme(id, { name: editName.trim() });
      setSavedSchemes((prev) =>
        prev.map((s) => (s.id === id ? { ...s, name: editName.trim() } : s))
      );
      setEditingId(null);
      setEditName("");
    } catch {}
  };

  const handleDeleteScheme = async (id: string) => {
    try {
      await deleteScheme(id);
      setSavedSchemes((prev) => prev.filter((s) => s.id !== id));
    } catch {}
  };

  const applySavedScheme = (scheme: SavedScheme) => {
    onSchemeChange({
      name: scheme.name,
      background: scheme.background,
      accent: scheme.accent,
      textPrimary: scheme.text_primary,
      textOnAccent: scheme.text_on_accent,
      bgOnAccent: scheme.bg_on_accent,
    });
    setEditingColorScheme(scheme.id);
    setEditColors({
      background: scheme.background,
      accent: scheme.accent,
      text_primary: scheme.text_primary,
      text_on_accent: scheme.text_on_accent,
      bg_on_accent: scheme.bg_on_accent,
    });
  };

  const handleEditColor = (field: "background" | "accent" | "text_primary", value: string) => {
    const updated = { ...editColors, [field]: value };
    setEditColors(updated);
    onSchemeChange({
      name: selectedScheme.name,
      background: updated.background,
      accent: updated.accent,
      textPrimary: updated.text_primary,
      textOnAccent: updated.text_on_accent,
      bgOnAccent: updated.bg_on_accent,
    });
  };

  const handleUpdateSchemeColors = async () => {
    if (!editingColorScheme) return;
    try {
      const updated = await updateScheme(editingColorScheme, editColors);
      setSavedSchemes((prev) =>
        prev.map((s) => (s.id === editingColorScheme ? { ...s, ...updated } : s))
      );
    } catch {}
  };

  const isSchemeSelected = (scheme: SavedScheme) =>
    selectedScheme.background === scheme.background &&
    selectedScheme.accent === scheme.accent &&
    selectedScheme.textPrimary === scheme.text_primary;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 transition-colors">
      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Theme</h3>

      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
          Color Scheme
        </label>
        <div className="grid grid-cols-5 gap-2">
          {colorSchemes.map((scheme) => (
            <button
              key={scheme.name}
              onClick={() => {
                setEditingColorScheme(null);
                if (scheme.name === "Custom") {
                  updateCustom(customBg, customAccent, customText);
                } else {
                  onSchemeChange(scheme);
                }
              }}
              className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border-2 transition-all ${
                selectedScheme.name === scheme.name
                  ? "border-sky-600 bg-sky-50 dark:bg-sky-900/30"
                  : "border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600"
              }`}
            >
              <div
                className="w-7 h-2.5 rounded-sm overflow-hidden border border-gray-200 dark:border-gray-600 flex"
              >
                <div className="flex-1" style={{ backgroundColor: scheme.name === "Custom" ? customBg : scheme.background }} />
                <div className="flex-1" style={{ backgroundColor: scheme.name === "Custom" ? customAccent : scheme.accent }} />
                <div className="flex-1" style={{ backgroundColor: scheme.name === "Custom" ? customText : scheme.textPrimary }} />
              </div>
              <span className="text-[10px] text-gray-600 dark:text-gray-400">{scheme.name}</span>
            </button>
          ))}
        </div>

        {isCustom && (
          <div className="mt-3 space-y-2">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
              Custom Colors
            </label>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={customBg}
                  onChange={(e) => updateCustom(e.target.value, customAccent, customText)}
                  className="w-8 h-8 rounded cursor-pointer border border-gray-300 dark:border-gray-600"
                />
                <span className="text-xs text-gray-600 dark:text-gray-400">Background</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={customAccent}
                  onChange={(e) => updateCustom(customBg, e.target.value, customText)}
                  className="w-8 h-8 rounded cursor-pointer border border-gray-300 dark:border-gray-600"
                />
                <span className="text-xs text-gray-600 dark:text-gray-400">Accent</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={customText}
                  onChange={(e) => updateCustom(customBg, customAccent, e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer border border-gray-300 dark:border-gray-600"
                />
                <span className="text-xs text-gray-600 dark:text-gray-400">Text</span>
              </div>
            </div>

            {isAuthenticated && !showSaveInput && (
              <button
                onClick={() => setShowSaveInput(true)}
                className="mt-2 text-xs px-3 py-1.5 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
              >
                Save as...
              </button>
            )}

            {showSaveInput && (
              <div className="flex gap-2 mt-2">
                <input
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  placeholder="Scheme name"
                  className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-sky-600"
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && handleSaveScheme()}
                />
                <button
                  onClick={handleSaveScheme}
                  className="text-xs px-2 py-1 bg-sky-600 text-white rounded-md hover:bg-sky-700"
                >
                  Save
                </button>
                <button
                  onClick={() => { setShowSaveInput(false); setSaveName(""); }}
                  className="text-xs px-2 py-1 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {isAuthenticated && savedSchemes.length > 0 && (
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
            Saved
          </label>
          <div className="space-y-1.5">
            {savedSchemes.map((scheme) => (
              <div
                key={scheme.id}
                className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
                  isSchemeSelected(scheme)
                    ? "border-sky-600 bg-sky-50 dark:bg-sky-900/30"
                    : "border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600"
                }`}
                onClick={() => applySavedScheme(scheme)}
              >
                <div className="flex-shrink-0 w-6 h-4 rounded-sm overflow-hidden border border-gray-200 dark:border-gray-600 flex">
                  <div className="flex-1" style={{ backgroundColor: scheme.background }} />
                  <div className="flex-1" style={{ backgroundColor: scheme.accent }} />
                  <div className="flex-1" style={{ backgroundColor: scheme.text_primary }} />
                </div>

                {editingId === scheme.id ? (
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 text-xs px-1 py-0.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-sky-600"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRenameScheme(scheme.id);
                      if (e.key === "Escape") { setEditingId(null); setEditName(""); }
                    }}
                    onBlur={() => { setEditingId(null); setEditName(""); }}
                  />
                ) : (
                  <span className="flex-1 text-xs text-gray-700 dark:text-gray-300 truncate">
                    {scheme.name}
                  </span>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingId(scheme.id);
                    setEditName(scheme.name);
                  }}
                  className="text-[10px] px-1.5 py-0.5 text-gray-500 hover:text-sky-600"
                  aria-label={`Rename ${scheme.name}`}
                >
                  ✎
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteScheme(scheme.id);
                  }}
                  className="text-[10px] px-1.5 py-0.5 text-gray-500 hover:text-red-600"
                  aria-label={`Delete ${scheme.name}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {editingColorScheme && (
        <div className="mb-4 border-t border-gray-100 dark:border-gray-800 pt-4">
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
            Edit Colors
          </label>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <input type="color" value={editColors.background} onChange={(e) => handleEditColor("background", e.target.value)} className="w-8 h-8 rounded cursor-pointer border border-gray-300 dark:border-gray-600" />
              <span className="text-xs text-gray-600 dark:text-gray-400">Background</span>
            </div>
            <div className="flex items-center gap-3">
              <input type="color" value={editColors.accent} onChange={(e) => handleEditColor("accent", e.target.value)} className="w-8 h-8 rounded cursor-pointer border border-gray-300 dark:border-gray-600" />
              <span className="text-xs text-gray-600 dark:text-gray-400">Accent</span>
            </div>
            <div className="flex items-center gap-3">
              <input type="color" value={editColors.text_primary} onChange={(e) => handleEditColor("text_primary", e.target.value)} className="w-8 h-8 rounded cursor-pointer border border-gray-300 dark:border-gray-600" />
              <span className="text-xs text-gray-600 dark:text-gray-400">Text</span>
            </div>
          </div>
          <button onClick={handleUpdateSchemeColors} className="mt-3 text-xs px-3 py-1.5 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition-colors">
            Update
          </button>
        </div>
      )}

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
            Font Pairing
          </label>
          <select
            value={selectedFonts.name}
            onChange={(e) => {
              if (e.target.value === "Custom") {
                const display = customDisplay || selectedFonts.display;
                const body = customBody || selectedFonts.body;
                setCustomDisplay(display);
                setCustomBody(body);
                setDisplaySearch(display);
                setBodySearch(body);
                onFontsChange({
                  name: "Custom",
                  display,
                  body,
                  googleFontsUrl: buildGoogleFontsUrl(display, body),
                });
              } else {
                const fonts = fontPairings.find((f) => f.name === e.target.value);
                if (fonts) onFontsChange(fonts);
              }
            }}
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-transparent"
          >
            {fontPairings.map((fonts) => (
              <option key={fonts.name} value={fonts.name}>
                {fonts.name} — {fonts.display} + {fonts.body}
              </option>
            ))}
            {(isPremium || selectedFonts.name === "Custom") && (
              <option value="Custom">Custom</option>
            )}
          </select>
        </div>

        {isCustomFont && (
          <div className="space-y-3 pt-1">
            <div className="space-y-1.5">
              <label className="text-xs text-gray-500 dark:text-gray-400">Display Font</label>
              <div ref={displayDropdownRef} className="relative">
                <input
                  value={displaySearch}
                  onChange={(e) => {
                    setDisplaySearch(e.target.value);
                    setShowDisplayDropdown(true);
                  }}
                  onFocus={() => setShowDisplayDropdown(true)}
                  placeholder="Search fonts..."
                  disabled={!isPremium}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {showDisplayDropdown && isPremium && (
                  <div className="absolute z-20 top-full mt-1 left-0 right-0 max-h-56 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                    {groupedFonts(displaySearch).map((group) => (
                      <div key={group.category}>
                        <div className="px-3 py-1.5 text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider bg-gray-50 dark:bg-gray-900/50">
                          {categoryLabels[group.category]}
                        </div>
                        {group.fonts.map((font) => (
                          <button
                            key={font.family}
                            onClick={() => selectDisplayFont(font)}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-between ${
                              selectedFonts.display === font.family ? "bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-300" : "text-gray-700 dark:text-gray-300"
                            }`}
                            style={{ fontFamily: `"${font.family}", sans-serif` }}
                          >
                            <span className="font-medium">{font.family}</span>
                            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-sans">{font.weights.slice(0, 3).join(", ")}{font.weights.length > 3 ? "…" : ""}</span>
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-gray-500 dark:text-gray-400">Body Font</label>
              <div ref={bodyDropdownRef} className="relative">
                <input
                  value={bodySearch}
                  onChange={(e) => {
                    setBodySearch(e.target.value);
                    setShowBodyDropdown(true);
                  }}
                  onFocus={() => setShowBodyDropdown(true)}
                  placeholder="Search fonts..."
                  disabled={!isPremium}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {showBodyDropdown && isPremium && (
                  <div className="absolute z-20 top-full mt-1 left-0 right-0 max-h-56 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                    {groupedFonts(bodySearch).map((group) => (
                      <div key={group.category}>
                        <div className="px-3 py-1.5 text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider bg-gray-50 dark:bg-gray-900/50">
                          {categoryLabels[group.category]}
                        </div>
                        {group.fonts.map((font) => (
                          <button
                            key={font.family}
                            onClick={() => selectBodyFont(font)}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-between ${
                              selectedFonts.body === font.family ? "bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-300" : "text-gray-700 dark:text-gray-300"
                            }`}
                            style={{ fontFamily: `"${font.family}", sans-serif` }}
                          >
                            <span className="font-medium">{font.family}</span>
                            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-sans">{font.weights.slice(0, 3).join(", ")}{font.weights.length > 3 ? "…" : ""}</span>
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
              <div className="flex flex-col gap-1">
                <span className="text-3xl font-bold" style={{ fontFamily: `"${selectedFonts.display}", serif` }}>
                  Aa
                </span>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm leading-snug" style={{ fontFamily: `"${selectedFonts.display}", serif` }}>
                    The quick brown fox jumps over the lazy dog.
                  </span>
                  <span className="text-xs leading-snug" style={{ fontFamily: `"${selectedFonts.body}", sans-serif` }}>
                    The quick brown fox jumps over the lazy dog.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4">
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
          Colors
        </label>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onInvertChange(!inverted)}
            className={`relative w-12 h-7 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 ${
              inverted ? "bg-sky-600" : "bg-gray-300 dark:bg-gray-600"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                inverted ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {inverted ? "Inverted" : "Normal"}
          </span>
        </div>
      </div>
    </div>
  );
}

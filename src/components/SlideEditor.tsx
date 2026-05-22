"use client";

import type { Slide, SlideType, CoverSlide, ContentB1Slide, ContentB2Slide, ListSlide, CtaSlide } from "@/lib/types";
import { getSlideLabel } from "@/lib/utils";

interface SlideEditorProps {
  slide: Slide;
  onUpdate: (slide: Slide) => void;
  onTypeChange: (type: SlideType) => void;
  slideIndex: number;
}

const SLIDE_TYPES: SlideType[] = ["cover", "content-b1", "content-b2", "list", "cta"];

function TextField({
  label,
  value,
  onChange,
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  return (
    <div className="mb-3">
      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
        {label}
      </label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
        />
      )}
    </div>
  );
}

function ListItemEditor({
  index,
  value,
  onChange,
}: {
  index: number;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <span className="w-5 h-5 rounded-full bg-pink-500 flex-shrink-0" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Item ${index + 1}`}
        className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
      />
    </div>
  );
}

export function SlideEditor({ slide, onUpdate, onTypeChange, slideIndex }: SlideEditorProps) {
  const updateListItem = (index: number, value: string) => {
    if (slide.type !== "list") return;
    const listSlide = slide as ListSlide;
    const newItems = [...listSlide.items];
    newItems[index] = value;
    onUpdate({ ...slide, items: newItems });
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
          Slide {slideIndex + 1}
        </h3>
        <select
          value={slide.type}
          onChange={(e) => onTypeChange(e.target.value as SlideType)}
          className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
        >
          {SLIDE_TYPES.map((type) => (
            <option key={type} value={type}>
              {getSlideLabel(type)}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        {slide.type === "cover" && (() => {
          const s = slide as CoverSlide;
          return (
            <>
              <TextField label="Headline (H1)" value={s.h1} onChange={(v) => onUpdate({ ...s, h1: v })} />
              <TextField label="Punchline (H2)" value={s.h2} onChange={(v) => onUpdate({ ...s, h2: v })} />
              <TextField label="Caption" value={s.caption} onChange={(v) => onUpdate({ ...s, caption: v })} multiline />
            </>
          );
        })()}

        {slide.type === "content-b1" && (() => {
          const s = slide as ContentB1Slide;
          return (
            <>
              <TextField label="Intro" value={s.intro} onChange={(v) => onUpdate({ ...s, intro: v })} />
              <TextField label="Punchline (H2)" value={s.h2} onChange={(v) => onUpdate({ ...s, h2: v })} />
              <TextField label="Body" value={s.body} onChange={(v) => onUpdate({ ...s, body: v })} multiline />
            </>
          );
        })()}

        {slide.type === "content-b2" && (() => {
          const s = slide as ContentB2Slide;
          return (
            <>
              <TextField label="Headline (H1)" value={s.h1} onChange={(v) => onUpdate({ ...s, h1: v })} />
              <TextField label="Punchline (H2)" value={s.h2} onChange={(v) => onUpdate({ ...s, h2: v })} />
              <TextField label="Body" value={s.body} onChange={(v) => onUpdate({ ...s, body: v })} multiline />
            </>
          );
        })()}

        {slide.type === "list" && (() => {
          const s = slide as ListSlide;
          return (
            <>
              <TextField label="Intro" value={s.intro} onChange={(v) => onUpdate({ ...s, intro: v })} />
              <TextField label="Punchline (H2)" value={s.h2} onChange={(v) => onUpdate({ ...s, h2: v })} />
              <div className="mt-3">
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  List Items
                </label>
                {s.items.map((item, i) => (
                  <ListItemEditor
                    key={i}
                    index={i}
                    value={item}
                    onChange={(v) => updateListItem(i, v)}
                  />
                ))}
              </div>
            </>
          );
        })()}

        {slide.type === "cta" && (() => {
          const s = slide as CtaSlide;
          return (
            <>
              <TextField label="Headline" value={s.h1} onChange={(v) => onUpdate({ ...s, h1: v })} />
              <TextField label="CTA Button Text" value={s.ctaText} onChange={(v) => onUpdate({ ...s, ctaText: v })} />
              <TextField label="Body" value={s.body} onChange={(v) => onUpdate({ ...s, body: v })} multiline />
            </>
          );
        })()}
      </div>
    </div>
  );
}

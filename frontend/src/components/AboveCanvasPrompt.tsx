"use client";

import { useState } from "react";

const TOPICS = [
  { label: "DevOps Tips", value: "Practical DevOps tips for development teams" },
  { label: "Tech Career Advice", value: "Career advice for software engineers" },
  { label: "Tool Comparison", value: "Comparing popular developer tools" },
  { label: "Personal Lesson Learned", value: "Lessons I learned the hard way" },
];

interface AboveCanvasPromptProps {
  onGenerate: (prompt: string) => void;
  busy: boolean;
  registerPrompt?: boolean;
  onDismissRegister?: () => void;
  openAuth?: (mode: "login" | "register") => void;
}

export function AboveCanvasPrompt({ onGenerate, busy, registerPrompt, onDismissRegister, openAuth }: AboveCanvasPromptProps) {
  const [prompt, setPrompt] = useState("");

  const handleChip = (value: string) => {
    setPrompt(value);
    onGenerate(value);
  };

  if (registerPrompt) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 transition-colors">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          You&apos;ve used your free AI credit. Create a free account to get{" "}
          <strong>5 more AI credits</strong>.
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => openAuth?.("register")}
            className="px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-700 transition-colors"
          >
            Register for free
          </button>
          <button
            onClick={onDismissRegister}
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Dismiss
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 transition-colors">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        What&apos;s your carousel about?
      </label>
      <div className="mt-2 flex gap-2">
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. DevOps tips for beginners"
          className="flex-1 min-w-0 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400"
        />
        <button
          onClick={() => onGenerate(prompt)}
          disabled={busy || !prompt.trim()}
          className="px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-700 disabled:opacity-50 transition-colors shrink-0"
        >
          {busy ? "Generating..." : "Generate"}
        </button>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {TOPICS.map((t) => (
          <button
            key={t.value}
            onClick={() => handleChip(t.value)}
            className="px-3 py-1 text-xs rounded-full border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}

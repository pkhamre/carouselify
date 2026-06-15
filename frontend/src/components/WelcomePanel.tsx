"use client";

interface WelcomePanelProps {
  onDismiss: () => void;
}

export function WelcomePanel({ onDismiss }: WelcomePanelProps) {
  return (
    <div className="py-4 text-center">
      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 text-[15px]">
        Welcome to Carouselify
      </h4>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
        This example carousel shows what's possible. Click any text to edit it, change colors in the sidebar, and export from the bottom bar when you're ready.
      </p>
      <button
        onClick={onDismiss}
        className="text-sm px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors font-medium"
      >
        Got it
      </button>
    </div>
  );
}

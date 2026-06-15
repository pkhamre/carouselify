"use client";

interface WelcomeModalProps {
  open: boolean;
  onDismiss: () => void;
}

export function WelcomeModal({ open, onDismiss }: WelcomeModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-gray-900 rounded-xl p-8 max-w-md w-full mx-4 shadow-xl">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Welcome to Carouselify
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
          Create beautiful carousels for social media in minutes. This starter
          carousel shows you what&apos;s possible.
        </p>
        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
              1
            </span>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Edit your slides
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Click any text on the left to customize it
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
              2
            </span>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Choose your style
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Pick a color scheme and font pairing on the right
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
              3
            </span>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Export your carousel
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Download PNGs or a PDF from the bar at the bottom
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="w-full py-2.5 text-sm font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-700 transition-colors"
        >
          Got it
        </button>
      </div>
    </div>
  );
}

export function ComingSoonCard() {
  return (
    <div className="bg-sky-50/60 dark:bg-sky-900/20 rounded-xl border border-sky-200 dark:border-sky-800 p-4 transition-colors">
      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Coming soon!</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
        We are actively building more powerful creation tools.
      </p>
      <ul className="space-y-1.5 text-sm text-gray-700 dark:text-gray-300 list-disc pl-5">
        <li>Content generation with AI</li>
        <li>Save and share carousels</li>
        <li>Custom font pairs</li>
        <li>Custom logo</li>
      </ul>
    </div>
  );
}

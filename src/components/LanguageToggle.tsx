import { Languages } from "lucide-react";
import { useLanguage } from "./LanguageProvider";

export function LanguageToggle() {
  const { t, toggle } = useLanguage();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={t.langToggle.label}
      title={t.langToggle.label}
      className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white/80 px-3 py-1.5 text-xs font-medium text-stone-600 backdrop-blur transition-colors duration-200 hover:border-amber-300 hover:text-amber-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-50 dark:border-stone-700 dark:bg-stone-900/80 dark:text-stone-300 dark:hover:border-amber-700 dark:hover:text-amber-400 dark:focus-visible:ring-offset-stone-950"
    >
      <Languages className="h-3.5 w-3.5" />
      {t.langToggle.short}
    </button>
  );
}

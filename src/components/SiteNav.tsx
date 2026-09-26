import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { sections, withBase, type SectionId } from "../data/site";
import { useLanguage } from "./LanguageProvider";
import { LanguageToggle } from "./LanguageToggle";
import { ThemeToggle } from "./ThemeToggle";

// `current` is null on pages outside the sections (e.g. the 404).
export function SiteNav({ current }: { current: SectionId | null }) {
  const { t } = useLanguage();

  // Single-letter shortcuts (h/p/w/b/a) — a small desktop nicety, ignored
  // while typing or when any modifier is held so it never hijacks the browser.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable]")) return;
      const section = sections.find((s) => s.key === e.key.toLowerCase());
      if (section && section.id !== current) {
        window.location.href = withBase(section.path);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current]);

  return (
    <header
      id="site-nav"
      style={{ viewTransitionName: "site-nav" }}
      className="sticky top-0 z-20 border-b border-transparent bg-stone-50/85 backdrop-blur-md supports-[backdrop-filter]:bg-stone-50/70 dark:bg-stone-950/85 dark:supports-[backdrop-filter]:bg-stone-950/70">
      <div className="mx-auto flex max-w-2xl items-center gap-2 px-3 py-3 sm:gap-3 sm:px-6">
        <nav aria-label={t.nav.label} className="min-w-0 flex-1">
          <ul className="no-scrollbar flex items-center overflow-x-auto sm:gap-1">
            {sections.map((section) => {
              const active = section.id === current;
              return (
                <li key={section.id} className="shrink-0">
                  <a
                    href={withBase(section.path)}
                    aria-current={active ? "page" : undefined}
                    aria-keyshortcuts={section.key}
                    className={`relative block rounded-full px-1 py-1.5 text-[12px] min-[380px]:text-[13px] min-[420px]:px-2 font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 sm:px-2.5 sm:text-sm ${
                      active
                        ? "text-stone-900 dark:text-stone-100"
                        : "text-stone-500 hover:text-amber-700 dark:text-stone-400 dark:hover:text-amber-400"
                    }`}
                  >
                    {t.nav[section.id]}
                    {active && (
                      <span
                        aria-hidden="true"
                        className="absolute inset-x-0 -bottom-0.5 mx-auto h-1 w-1 rounded-full bg-amber-500 dark:bg-amber-400"
                      />
                    )}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <SearchButton label={t.search.open} />
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

// Opens the CommandPalette. Desktop only (no room in the phone nav); shows
// the platform's shortcut so it gets discovered.
function SearchButton({ label }: { label: string }) {
  const [mac, setMac] = useState(false);
  useEffect(() => setMac(/Mac|iPhone|iPad/.test(navigator.platform)), []);
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("open-search"))}
      aria-label={label}
      aria-keyshortcuts={mac ? "Meta+K" : "Control+K"}
      title={label}
      className="hidden h-8 items-center gap-1.5 rounded-full border border-stone-200 bg-white/80 px-2.5 text-xs font-medium text-stone-500 backdrop-blur transition-colors duration-200 hover:border-amber-300 hover:text-amber-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 sm:inline-flex dark:border-stone-700 dark:bg-stone-900/80 dark:text-stone-400 dark:hover:border-amber-700 dark:hover:text-amber-400"
    >
      <Search className="h-3.5 w-3.5" />
      <kbd className="font-sans">{mac ? "⌘K" : "Ctrl K"}</kbd>
    </button>
  );
}

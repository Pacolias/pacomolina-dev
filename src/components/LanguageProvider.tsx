import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { dictionary, type Dictionary, type Lang } from "../data/i18n";

type LanguageContextValue = {
  lang: Lang;
  t: Dictionary;
  toggle: () => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function detectInitialLang(): Lang {
  if (typeof window === "undefined") return "en";
  const w = window as typeof window & { __INITIAL_LANG__?: Lang };
  return w.__INITIAL_LANG__ === "es" ? "es" : "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Server-rendered output always starts in English; the inline bootstrap
  // script in Layout.astro sets window.__INITIAL_LANG__ before this runs,
  // so client visitors get their detected/stored language on first paint.
  const [lang, setLang] = useState<Lang>("en");
  // Same as ThemeProvider: don't write the "en" placeholder to <html lang>
  // before the detected language is in state (it would briefly switch the
  // CSS-driven bilingual blocks back to English).
  const [detected, setDetected] = useState(false);

  useEffect(() => {
    setLang(detectInitialLang());
    setDetected(true);
  }, []);

  useEffect(() => {
    if (!detected) return;
    document.documentElement.lang = lang;
    // The detected language has now rendered — reveal the page (the inline
    // script in Layout.astro hid it to avoid an EN→ES flash).
    if (lang === detectInitialLang()) {
      document.documentElement.removeAttribute("data-lang-pending");
      // Lets the page-transition handler in Layout.astro play its fade.
      window.dispatchEvent(new Event("lang-ready"));
    }
  }, [lang, detected]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      lang,
      t: dictionary[lang],
      toggle: () => {
        const next: Lang = lang === "en" ? "es" : "en";
        setLang(next);
        try {
          localStorage.setItem("lang", next);
        } catch {
          // localStorage unavailable (private mode) — non-critical, skip persisting.
        }
      },
    }),
    [lang]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}

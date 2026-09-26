import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function detectInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const w = window as typeof window & { __INITIAL_THEME__?: Theme };
  return w.__INITIAL_THEME__ === "dark" ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Server-rendered output always starts in light mode; the inline
  // bootstrap script in Layout.astro sets window.__INITIAL_THEME__ (from
  // localStorage, else the OS prefers-color-scheme) and applies the `dark`
  // class to <html> before this runs, so there's no flash on first paint —
  // this just syncs React's state to match what's already on screen.
  const [theme, setTheme] = useState<Theme>("light");
  // Until the detected theme is in state, leave <html> alone: syncing the
  // initial "light" placeholder would strip the `dark` class the inline
  // script already applied, flashing the page light for a frame on every
  // page load/navigation.
  const [detected, setDetected] = useState(false);

  useEffect(() => {
    setTheme(detectInitialTheme());
    setDetected(true);
  }, []);

  useEffect(() => {
    if (!detected) return;
    document.documentElement.classList.toggle("dark", theme === "dark");
    const metaTheme = document.getElementById("theme-color-meta");
    metaTheme?.setAttribute("content", theme === "dark" ? "#0c0a09" : "#fdba74");
  }, [theme, detected]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      toggle: () => {
        const next: Theme = theme === "dark" ? "light" : "dark";
        setTheme(next);
        try {
          localStorage.setItem("theme", next);
        } catch {
          // localStorage unavailable (private mode) — non-critical, skip persisting.
        }
      },
    }),
    [theme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
}

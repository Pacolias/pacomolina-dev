import type { ReactNode } from "react";
import type { SectionId } from "../data/site";
import { LanguageProvider } from "./LanguageProvider";
import { ThemeProvider } from "./ThemeProvider";
import { SiteNav } from "./SiteNav";
import { ContactCard } from "./ContactCard";
import { useSwipeNavigation } from "./useSwipeNavigation";

// Shared chrome for every page: providers, the sticky top nav, and the
// "Let's talk" card as a closing footer. Each page is a single React island
// rooted here, so the language/theme state is shared by everything on it.
export function SiteShell({
  current,
  children,
  footer = true,
}: {
  current: SectionId | null;
  children: ReactNode;
  // Lets a page render the contact card somewhere else instead.
  footer?: boolean;
}) {
  useSwipeNavigation(current);

  return (
    <ThemeProvider>
      <LanguageProvider>
        <div className="flex min-h-screen flex-col">
          <SiteNav current={current} />
          <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col">
            {children}
            {footer && (
              <footer className="px-6 pb-16">
                <ContactCard />
              </footer>
            )}
          </div>
        </div>
      </LanguageProvider>
    </ThemeProvider>
  );
}

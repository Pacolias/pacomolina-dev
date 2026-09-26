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
  const { contentRef, previewRef, preview } = useSwipeNavigation(current);

  return (
    <ThemeProvider>
      <LanguageProvider>
        <div className="flex min-h-screen flex-col overflow-x-clip">
          <SiteNav current={current} />
          <div ref={contentRef} className="mx-auto flex w-full max-w-2xl flex-1 flex-col will-change-transform">
            {children}
            {footer && (
              <footer className="px-6 pb-16">
                <ContactCard />
              </footer>
            )}
          </div>
          {preview && (
            // The neighbour page while swiping (see useSwipeNavigation):
            // decorative only, so hidden from assistive tech and inert. It
            // starts off-screen on its side; the gesture positions it.
            <div
              ref={previewRef}
              aria-hidden="true"
              inert
              className="swipe-preview pointer-events-none fixed inset-x-0 bottom-0 z-10 overflow-hidden bg-stone-50 will-change-transform dark:bg-stone-950"
              style={{
                top: document.getElementById("site-nav")?.getBoundingClientRect().bottom ?? 0,
                transform: `translate3d(${preview.direction === "next" ? "100vw" : "-100vw"}, 0, 0)`,
              }}
            >
              <div className="mx-auto w-full max-w-2xl">
                <preview.Page />
                <footer className="px-6 pb-16">
                  <ContactCard />
                </footer>
              </div>
            </div>
          )}
        </div>
      </LanguageProvider>
    </ThemeProvider>
  );
}

import { LanguageProvider } from "./LanguageProvider";
import { ThemeProvider } from "./ThemeProvider";
import { Hero } from "./Hero";
import { RedCheckCard } from "./RedCheckCard";
import { StackGrid } from "./StackGrid";
import { ContactCard } from "./ContactCard";

export function Portfolio() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <div className="mx-auto flex min-h-screen max-w-2xl flex-col">
          <Hero />
          <main className="grid grid-cols-1 gap-4 px-6 pb-16 sm:grid-cols-5">
            <div className="sm:col-span-3">
              <RedCheckCard />
            </div>
            <div className="sm:col-span-2">
              <StackGrid />
            </div>
            <div className="sm:col-span-5">
              <ContactCard />
            </div>
          </main>
        </div>
      </LanguageProvider>
    </ThemeProvider>
  );
}

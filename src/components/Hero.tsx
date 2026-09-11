import { Download, MapPin } from "lucide-react";
import { site } from "../data/site";
import { useLanguage } from "./LanguageProvider";
import { LinkedInIcon } from "./icons/LinkedInIcon";
import { LanguageToggle } from "./LanguageToggle";
import { ThemeToggle } from "./ThemeToggle";

export function Hero() {
  const { t } = useLanguage();

  return (
    <header className="relative flex flex-col items-center px-6 pt-14 pb-10 text-center sm:pt-20">
      <div className="absolute right-4 top-4 flex flex-col items-end gap-2 sm:right-6 sm:top-6">
        <LanguageToggle />
        <ThemeToggle />
      </div>

      <img
        src={site.photo}
        alt={site.name}
        width={112}
        height={112}
        fetchPriority="high"
        className="fade-up-1 h-28 w-28 rounded-full border-4 border-white object-cover shadow-md shadow-stone-200/70 sm:h-32 sm:w-32 dark:border-stone-800 dark:shadow-none"
      />

      <h1 className="fade-up-2 mt-6 font-display text-4xl font-medium tracking-tight text-stone-900 sm:text-5xl dark:text-stone-100">
        {site.name}
      </h1>

      <p className="fade-up-2 mt-2 text-lg font-medium text-amber-700 sm:text-xl dark:text-amber-400">
        {t.hero.role}
      </p>

      <p className="fade-up-3 mt-4 max-w-md text-balance text-base leading-relaxed text-stone-600 dark:text-stone-400">
        {t.hero.tagline}
      </p>

      <p className="fade-up-4 mt-3 flex max-w-sm items-center justify-center gap-1.5 text-sm text-stone-600 dark:text-stone-400">
        <MapPin className="h-3.5 w-3.5 shrink-0 text-amber-700 dark:text-amber-400" />
        {t.hero.availability}
      </p>

      <div className="fade-up-5 mt-8 flex w-full max-w-sm flex-col gap-3 sm:w-auto sm:flex-row">
        <a
          href={site.linkedin}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-stone-800 px-6 py-3 text-sm font-medium text-stone-50 shadow-sm shadow-stone-300/60 transition-transform duration-200 hover:-translate-y-0.5 hover:bg-stone-700 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-50 dark:bg-stone-100 dark:text-stone-900 dark:shadow-none dark:hover:bg-white dark:focus-visible:ring-offset-stone-950"
        >
          <LinkedInIcon className="h-4 w-4" />
          {t.cta.linkedin}
        </a>
        <a
          href={site.cvHref}
          download
          className="inline-flex items-center justify-center gap-2 rounded-full border border-stone-300 bg-white px-6 py-3 text-sm font-medium text-stone-800 transition-colors duration-200 hover:border-amber-300 hover:bg-amber-50 active:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-50 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:border-amber-700 dark:hover:bg-stone-800 dark:focus-visible:ring-offset-stone-950"
        >
          <Download className="h-4 w-4" />
          {t.cta.cv}
        </a>
      </div>
    </header>
  );
}

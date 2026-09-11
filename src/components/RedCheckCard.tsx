import { Globe, AppWindow } from "lucide-react";
import { SiGithub } from "@icons-pack/react-simple-icons";
import { redCheck } from "../data/site";
import { useLanguage } from "./LanguageProvider";

export function RedCheckCard() {
  const { t } = useLanguage();
  const copy = t.projects.redcheck;

  return (
    <article className="fade-up-3 flex h-full flex-col justify-between rounded-3xl border border-amber-100 bg-white p-6 shadow-sm shadow-stone-200/50 sm:p-8 dark:border-stone-800 dark:bg-stone-900 dark:shadow-none">
      <div>
        <span className="inline-block rounded-full bg-amber-50 px-3 py-1 text-xs font-medium tracking-wide text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
          {copy.tag}
        </span>
        <h2 className="mt-4 font-display text-2xl font-medium text-stone-900 dark:text-stone-100">
          {redCheck.name}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
          {copy.description}
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <div className="flex gap-3">
          <a
            href={redCheck.websiteUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-amber-200 bg-amber-50/60 px-4 py-2 text-sm font-medium text-amber-800 transition-colors duration-200 hover:border-amber-300 hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300 dark:hover:border-amber-700 dark:hover:bg-amber-950/50 dark:focus-visible:ring-offset-stone-900"
          >
            <Globe className="h-3.5 w-3.5" />
            {copy.website}
          </a>
          <a
            href={redCheck.liveUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-stone-800 px-4 py-2 text-sm font-medium text-stone-50 transition-colors duration-200 hover:bg-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white dark:focus-visible:ring-offset-stone-900"
          >
            <AppWindow className="h-3.5 w-3.5" />
            {copy.live}
          </a>
        </div>
        <a
          href={redCheck.repoUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition-colors duration-200 hover:border-amber-300 hover:bg-amber-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-stone-700 dark:text-stone-300 dark:hover:border-amber-700 dark:hover:bg-stone-800 dark:focus-visible:ring-offset-stone-900"
        >
          <SiGithub className="h-3.5 w-3.5" />
          {copy.repo}
        </a>
      </div>
    </article>
  );
}

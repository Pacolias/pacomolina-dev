import { Mail, Contact } from "lucide-react";
import { SiGithub } from "@icons-pack/react-simple-icons";
import { site } from "../data/site";
import { useLanguage } from "./LanguageProvider";

export function ContactCard() {
  const { t } = useLanguage();

  return (
    <section className="fade-up-5 flex flex-col items-center gap-4 rounded-3xl border border-amber-100 bg-white p-6 text-center shadow-sm shadow-stone-200/50 sm:flex-row sm:justify-between sm:p-8 sm:text-left dark:border-stone-800 dark:bg-stone-900 dark:shadow-none">
      <h2 className="font-display text-lg font-medium text-stone-900 dark:text-stone-100">
        {t.contact.heading}
      </h2>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <a
          href={`mailto:${site.email}`}
          className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-5 py-2.5 text-sm font-medium text-amber-800 transition-colors duration-200 hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-950/60 dark:focus-visible:ring-offset-stone-900"
        >
          <Mail className="h-4 w-4" />
          {t.contact.button}
        </a>
        <a
          href={site.vcardHref}
          download
          className="inline-flex items-center gap-2 rounded-full border border-stone-300 px-5 py-2.5 text-sm font-medium text-stone-700 transition-colors duration-200 hover:border-amber-300 hover:bg-amber-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-stone-700 dark:text-stone-300 dark:hover:border-amber-700 dark:hover:bg-stone-800 dark:focus-visible:ring-offset-stone-900"
        >
          <Contact className="h-4 w-4" />
          {t.contact.vcard}
        </a>
        <a
          href={site.github}
          target="_blank"
          rel="noreferrer noopener"
          aria-label={t.contact.github}
          title={t.contact.github}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-stone-300 text-stone-700 transition-colors duration-200 hover:border-amber-300 hover:bg-amber-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-stone-700 dark:text-stone-300 dark:hover:border-amber-700 dark:hover:bg-stone-800 dark:focus-visible:ring-offset-stone-900"
        >
          <SiGithub className="h-4 w-4" />
        </a>
      </div>
    </section>
  );
}

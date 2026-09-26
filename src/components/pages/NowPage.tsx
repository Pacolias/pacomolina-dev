import { ArrowRight } from "lucide-react";
import { now, nowUpdated } from "../../data/now";
import { formatDate } from "../../data/format";
import { useLanguage } from "../LanguageProvider";
import { SiteShell } from "../SiteShell";
import { PageHeader } from "../PageHeader";
import { card, sectionHeading, textLink } from "../ui";

// /now — a short, dated snapshot of what Paco is focused on. Not in the top
// nav (a sixth item wouldn't fit at 360px); linked from Home and About.
export function NowPage() {
  const { t, lang } = useLanguage();
  const copy = t.pages.now;

  return (
    <>
      <PageHeader title={copy.title} subtitle={copy.subtitle} />
      <main className="flex flex-col gap-4 px-6 pb-4">
        {now.map((section, i) => (
          <section
            key={section.heading.en}
            className={`${card} p-6 sm:p-8 ${i === 0 ? "fade-up-3" : i === 1 ? "fade-up-4" : "fade-up-5"}`}
          >
            <h2 className={sectionHeading}>{section.heading[lang]}</h2>
            <ul className="mt-3 space-y-2.5">
              {section.items.map((item) => (
                <li
                  key={item.text.en}
                  className="relative pl-4 text-sm leading-relaxed text-stone-600 before:absolute before:left-0 before:top-[0.6em] before:h-1.5 before:w-1.5 before:rounded-full before:bg-amber-400 dark:text-stone-400 dark:before:bg-amber-500"
                >
                  {item.text[lang]}
                  {item.href && (
                    <>
                      {" "}
                      <a href={item.href} className={textLink} aria-label={item.text[lang]}>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </a>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
        <p className="fade-up-6 px-1 text-xs text-stone-500 dark:text-stone-400">
          {copy.updated} <time dateTime={nowUpdated}>{formatDate(nowUpdated, lang)}</time>
        </p>
      </main>
    </>
  );
}

export function NowApp() {
  return (
    <SiteShell current={null}>
      <NowPage />
    </SiteShell>
  );
}

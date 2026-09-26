import {
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  GraduationCap,
  Rocket,
  Sparkles,
} from "lucide-react";
import { intro, languages, timeline, type TimelineItem } from "../../data/about";
import { site, withBase } from "../../data/site";
import { useLanguage } from "../LanguageProvider";
import { SiteShell } from "../SiteShell";
import { PageHeader } from "../PageHeader";
import { card, focusRing, sectionHeading, textLink } from "../ui";

const KIND_ICONS: Record<TimelineItem["kind"], typeof Briefcase> = {
  education: GraduationCap,
  work: Briefcase,
  project: Rocket,
  milestone: Sparkles,
};

function Timeline() {
  const { t, lang } = useLanguage();
  const last = timeline.length - 1;

  return (
    <ol className="relative mt-6">
      {timeline.map((item, i) => {
        const Icon = KIND_ICONS[item.kind];
        const isNow = i === last;
        return (
          <li key={item.title.en} className="relative flex gap-4 pb-8 last:pb-0">
            {/* Connector line, drawn from this dot down to the next one. */}
            {i < last && (
              <span
                aria-hidden="true"
                className="absolute top-9 bottom-0 left-[17px] w-px bg-gradient-to-b from-amber-200 to-stone-200 dark:from-amber-900 dark:to-stone-800"
              />
            )}
            <span
              className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${
                isNow
                  ? "border-amber-300 bg-amber-100 text-amber-800 ring-4 ring-amber-100/60 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-300 dark:ring-amber-950/60"
                  : "border-amber-100 bg-white text-amber-700 dark:border-stone-700 dark:bg-stone-900 dark:text-amber-400"
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">{t.pages.about.kinds[item.kind]}</span>
            </span>
            <div className="min-w-0 flex-1 pt-1.5">
              <p className="text-xs font-medium uppercase tracking-wider text-amber-700 dark:text-amber-400">
                {item.date[lang]}
              </p>
              <h3 className="mt-1 font-display text-lg font-medium leading-snug text-stone-900 dark:text-stone-100">
                {item.title[lang]}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
                {item.body[lang]}
              </p>
              {item.link && (
                <a href={item.link.href} className={`${textLink} mt-2`}>
                  {item.link.label[lang]}
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function AboutPage() {
  const { t, lang } = useLanguage();
  const copy = t.pages.about;

  return (
    <>
      <PageHeader title={copy.title} subtitle={copy.subtitle} />
      <div className="flex flex-col gap-4 px-6 pb-4">
        <section className={`${card} fade-up-3 p-6 sm:p-8`}>
          <img
            src={site.photo}
            alt={site.name}
            width={64}
            height={64}
            className="float-right mb-2 ml-4 h-16 w-16 rounded-full border-2 border-white object-cover shadow-sm shadow-stone-200/70 sm:h-20 sm:w-20 dark:border-stone-800 dark:shadow-none"
          />
          <div className="space-y-4 text-[15px] leading-relaxed text-stone-700 dark:text-stone-300">
            {intro.map((p) => (
              <p key={p.en}>{p[lang]}</p>
            ))}
          </div>
        </section>

        <section className={`${card} fade-up-4 p-6 sm:p-8`}>
          <h2 className={sectionHeading}>{copy.timelineHeading}</h2>
          <Timeline />
        </section>

        <section className={`${card} fade-up-5 p-6 sm:p-8`}>
          <h2 className={sectionHeading}>{copy.languagesHeading}</h2>
          <ul className="mt-4 grid grid-cols-2 gap-3">
            {languages.map((l) => {
              const body = (
                <>
                  <p className="text-sm font-medium text-stone-800 dark:text-stone-200">
                    {l.name[lang]}
                  </p>
                  <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
                    {l.level[lang]}
                  </p>
                </>
              );
              const box = "block h-full rounded-2xl border px-4 py-3";
              return (
                <li key={l.name.en}>
                  {l.href ? (
                    <a
                      href={l.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      title={copy.viewCertificate}
                      className={`${box} group relative pr-8 border-amber-100 bg-amber-50/40 transition-colors duration-200 hover:border-amber-300 hover:bg-amber-50 dark:border-stone-700 dark:bg-stone-800/40 dark:hover:border-amber-700 dark:hover:bg-stone-800 ${focusRing}`}
                    >
                      {body}
                      <ArrowUpRight
                        aria-hidden="true"
                        className="absolute top-3 right-3 h-3.5 w-3.5 text-amber-600 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 dark:text-amber-400"
                      />
                      <span className="sr-only">({copy.viewCertificate})</span>
                    </a>
                  ) : (
                    <div className={`${box} border-stone-100 bg-stone-50/60 dark:border-stone-800 dark:bg-stone-800/40`}>
                      {body}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        <a href={withBase("/now/")} className={`${textLink} fade-up-6 mt-2 self-start`}>
          {t.pages.now.link}
          <ArrowRight className="h-3.5 w-3.5" />
        </a>
      </div>
    </>
  );
}

export function AboutApp() {
  return (
    <SiteShell current="about">
      <AboutPage />
    </SiteShell>
  );
}

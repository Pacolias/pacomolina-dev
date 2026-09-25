import { ArrowUpRight, ArrowRight } from "lucide-react";
import { jobs, type Job } from "../../data/work";
import { formatMonth } from "../../data/format";
import { withBase } from "../../data/site";
import { useLanguage } from "../LanguageProvider";
import { SiteShell } from "../SiteShell";
import { PageHeader } from "../PageHeader";
import { Chips } from "../Chips";
import { Gallery } from "../Gallery";
import { card, focusRing, sectionHeading, textLink } from "../ui";

function JobCard({ job, index }: { job: Job; index: number }) {
  const { t, lang } = useLanguage();
  const dates = `${formatMonth(job.start, lang)} – ${
    job.end ? formatMonth(job.end, lang) : t.pages.work.present
  }`;

  return (
    <article className={`${card} p-6 sm:p-8 ${index === 0 ? "fade-up-3" : "fade-up-4"}`}>
      <div className="flex items-start gap-4">
        <img
          src={job.logo}
          alt=""
          width={48}
          height={48}
          className="h-12 w-12 shrink-0 rounded-xl"
        />
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-xl font-medium leading-tight text-stone-900 dark:text-stone-100">
            <a
              href={job.url}
              target="_blank"
              rel="noreferrer noopener"
              className={`rounded transition-colors hover:text-amber-700 dark:hover:text-amber-400 ${focusRing}`}
            >
              {job.company}
            </a>
          </h2>
          <p className="mt-0.5 text-sm font-medium text-amber-700 dark:text-amber-400">
            {job.role[lang]}
          </p>
          <p className="mt-1 flex flex-wrap gap-x-2 text-xs text-stone-500 dark:text-stone-400">
            <span>{dates}</span>
            <span aria-hidden="true">·</span>
            <span>{job.location[lang]}</span>
          </p>
        </div>
      </div>

      <p className="mt-5 text-sm leading-relaxed text-stone-700 dark:text-stone-300">
        {job.summary[lang]}
      </p>

      <ul className="mt-4 space-y-2">
        {job.highlights.map((h) => (
          <li
            key={h.en}
            className="relative pl-4 text-sm leading-relaxed text-stone-600 before:absolute before:left-0 before:top-[0.6em] before:h-1.5 before:w-1.5 before:rounded-full before:bg-amber-400 dark:text-stone-400 dark:before:bg-amber-500"
          >
            {h[lang]}
          </li>
        ))}
      </ul>

      <div className="mt-5">
        <Chips items={job.stack} />
      </div>

      {job.photos.length > 0 && (
        <div className="mt-6">
          <Gallery images={job.photos} />
        </div>
      )}

      <div className="mt-6 border-t border-stone-100 pt-5 dark:border-stone-800">
        <h3 className="text-xs font-medium uppercase tracking-wider text-stone-500 dark:text-stone-400">
          {t.pages.work.proof}
        </h3>
        <ul className="mt-3 flex flex-wrap gap-2">
          {job.proof.map((p) => (
            <li key={p.href}>
              <a
                href={p.href}
                target="_blank"
                rel="noreferrer noopener"
                className={`inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50/60 px-3 py-1.5 text-xs font-medium text-amber-800 transition-colors hover:border-amber-300 hover:bg-amber-100 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300 dark:hover:border-amber-700 ${focusRing}`}
              >
                {p.label[lang]}
                <ArrowUpRight className="h-3 w-3" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

export function WorkPage() {
  const { t } = useLanguage();
  const copy = t.pages.work;

  return (
    <>
      <PageHeader title={copy.title} subtitle={copy.subtitle} />
      <main className="flex flex-col gap-4 px-6 pb-4">
        {jobs.map((job, i) => (
          <JobCard key={job.company} job={job} index={i} />
        ))}

        <section className={`${card} fade-up-5 mt-4 p-6 sm:p-8`}>
          <h2 className={sectionHeading}>{copy.outsideHeading}</h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
            {copy.outsideBody}
          </p>
          <a href={withBase("/about/")} className={`${textLink} mt-4`}>
            {copy.outsideLink}
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </section>
      </main>
    </>
  );
}

export function WorkApp() {
  return (
    <SiteShell current="work">
      <WorkPage />
    </SiteShell>
  );
}

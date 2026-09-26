import { ArrowUpRight, ArrowRight } from "lucide-react";
import { jobs, type Job } from "../../data/work";
import { formatMonth } from "../../data/format";
import { withBase } from "../../data/site";
import { useLanguage } from "../LanguageProvider";
import { SiteShell } from "../SiteShell";
import { PageHeader } from "../PageHeader";
import { Bullets } from "../Bullets";
import { Chips } from "../Chips";
import { ExpandableRow, rowTitle } from "../ExpandableRow";
import { Gallery } from "../Gallery";
import { card, focusRing, sectionHeading, textLink } from "../ui";

function JobRow({ job }: { job: Job }) {
  const { t, lang } = useLanguage();
  const dates = `${formatMonth(job.start, lang)} – ${
    job.end ? formatMonth(job.end, lang) : t.pages.work.present
  }`;

  return (
    <ExpandableRow
      anchor={job.company.toLowerCase()}
      leading={
        <img
          src={job.logo}
          alt=""
          width={36}
          height={36}
          className="h-9 w-9 shrink-0 rounded-lg"
        />
      }
      title={<span className={rowTitle}>{job.company}</span>}
      subtitle={
        <>
          {job.role[lang]}
          <span className="mt-0.5 block text-xs text-stone-500 sm:hidden dark:text-stone-400">
            {dates}
          </span>
        </>
      }
      aside={
        <span className="mt-1 hidden shrink-0 text-xs text-stone-500 sm:block dark:text-stone-400">
          {dates}
        </span>
      }
    >
      <p className="text-xs text-stone-500 dark:text-stone-400">{job.location[lang]}</p>
      <p className="text-sm leading-relaxed text-stone-700 dark:text-stone-300">
        {job.summary[lang]}
      </p>
      <Bullets items={job.highlights} />
      <Chips items={job.stack} />
      <Gallery images={job.photos} />
      <div>
        <h3 className="text-xs font-medium uppercase tracking-wider text-stone-500 dark:text-stone-400">
          {t.pages.work.links}
        </h3>
        <ul className="mt-3 flex flex-wrap gap-2">
          {job.links.map((p) => (
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
    </ExpandableRow>
  );
}

export function WorkPage() {
  const { t } = useLanguage();
  const copy = t.pages.work;

  return (
    <>
      <PageHeader title={copy.title} subtitle={copy.subtitle} />
      <div className="flex flex-col gap-4 px-6 pb-4">
        <section className={`${card} fade-up-3 px-6 py-2 sm:px-8`}>
          <ul>
            {jobs.map((job) => (
              <JobRow key={job.company} job={job} />
            ))}
          </ul>
        </section>

        <section className={`${card} fade-up-4 p-6 sm:p-8`}>
          <h2 className={sectionHeading}>{copy.outsideHeading}</h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
            {copy.outsideBody}
          </p>
          <a href={withBase("/about/")} className={`${textLink} mt-4`}>
            {copy.outsideLink}
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </section>
      </div>
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

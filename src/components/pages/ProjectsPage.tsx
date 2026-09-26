import { useEffect, useId, useState } from "react";
import { AppWindow, ArrowRight, ChevronDown, Globe } from "lucide-react";
import { SiGithub } from "@icons-pack/react-simple-icons";
import { projects, type Project, type ProjectLink } from "../../data/projects";
import type { BlogPostSummary } from "../../data/blog";
import { readBlogIndex } from "../../data/blogIndex";
import { formatDate } from "../../data/format";
import { withBase } from "../../data/site";
import { useLanguage } from "../LanguageProvider";
import { SiteShell } from "../SiteShell";
import { PageHeader } from "../PageHeader";
import { Bullets } from "../Bullets";
import { Chips } from "../Chips";
import { Collapsible } from "../Collapsible";
import { ExpandableRow, rowTitle } from "../ExpandableRow";
import { Gallery } from "../Gallery";
import { button, card, focusRing, textLink } from "../ui";

const LINK_ICONS: Record<ProjectLink["kind"], typeof Globe> = {
  live: AppWindow,
  website: Globe,
  repo: SiGithub as unknown as typeof Globe,
};

// Same visual weight as RedCheck's card on the home page: the live demo is
// the filled primary action, the website the soft amber one, code outlined.
const LINK_STYLES: Record<ProjectLink["kind"], string> = {
  live: button.primary,
  website: button.accent,
  repo: button.outline,
};

function ProjectLinks({ links }: { links: ProjectLink[] }) {
  const { t } = useLanguage();
  return (
    <div className="flex flex-wrap gap-2">
      {links.map((link) => {
        const Icon = LINK_ICONS[link.kind];
        return (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noreferrer noopener"
            className={`${LINK_STYLES[link.kind]} flex-1 sm:flex-none`}
          >
            <Icon className="h-3.5 w-3.5" />
            {t.pages.projects.links[link.kind]}
          </a>
        );
      })}
    </div>
  );
}

function StatusBadge({ project }: { project: Project }) {
  const { t } = useLanguage();
  const live = project.status === "live";
  return (
    <span className="inline-flex items-center gap-1 text-[11px] text-stone-500 dark:text-stone-400">
      {live && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />}
      {t.pages.projects.status[project.status]}
    </span>
  );
}

// Blog entries that point at this project (their `project` frontmatter),
// newest first — the "Written about this" list in the project's panel.
function RelatedEntries({ project }: { project: Project }) {
  const { t, lang } = useLanguage();
  const [entries, setEntries] = useState<BlogPostSummary[]>([]);
  useEffect(() => {
    setEntries(readBlogIndex().filter((p) => p.project?.slug === project.slug));
  }, [project.slug]);
  if (entries.length === 0) return null;
  return (
    <div>
      <h3 className="text-xs font-medium uppercase tracking-wider text-stone-500 dark:text-stone-400">
        {t.pages.projects.writtenAbout}
      </h3>
      <ul className="mt-2 space-y-1.5">
        {entries.map((entry) => {
          const v = entry.versions[lang] ?? entry.versions.en ?? entry.versions.es;
          return (
            <li key={entry.slug} className="text-sm">
              <a
                href={withBase(entry.hasPage ? `/blog/${entry.slug}/` : `/blog/#${entry.slug}`)}
                className={textLink}
              >
                {v?.title}
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
              <span className="ml-2 text-xs text-stone-500 dark:text-stone-400">
                {t.pages.blog.types[entry.type]} · {formatDate(entry.date, lang)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ProjectRow({ project }: { project: Project }) {
  const { lang } = useLanguage();
  return (
    <ExpandableRow
      anchor={project.slug}
      title={
        <span className="flex flex-wrap items-baseline gap-x-2">
          <span className={rowTitle}>{project.name}</span>
          <StatusBadge project={project} />
        </span>
      }
      subtitle={project.blurb[lang]}
    >
      <Gallery images={project.images} />
      <div>
        <p className="text-xs text-stone-500 dark:text-stone-400">{project.year}</p>
        <p className="mt-1 text-sm font-medium leading-snug text-amber-700 dark:text-amber-400">
          {project.tagline[lang]}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
          {project.summary[lang]}
        </p>
      </div>
      <Bullets items={project.highlights} />
      <Chips items={project.stack} />
      <ProjectLinks links={project.links} />
      <RelatedEntries project={project} />
    </ExpandableRow>
  );
}

// One compact list, one glance: featured projects are visible rows, the rest
// wait behind "Show all projects (n)". Each row opens to the full story.
export function ProjectsPage() {
  const { t } = useLanguage();
  const copy = t.pages.projects;
  const featured = projects.filter((p) => p.featured);
  const more = projects.filter((p) => !p.featured);
  const [showAll, setShowAll] = useState(false);
  const moreId = useId();

  return (
    <>
      <PageHeader title={copy.title} subtitle={copy.subtitle} />
      <main className="px-6 pb-4">
        <section className={`${card} fade-up-3 px-6 py-2 sm:px-8`}>
          <ul>
            {featured.map((project) => (
              <ProjectRow key={project.slug} project={project} />
            ))}
          </ul>
          {more.length > 0 && (
            <>
              <Collapsible id={moreId} open={showAll} bleed>
                <ul className="border-t border-stone-100 dark:border-stone-800">
                  {more.map((project) => (
                    <ProjectRow key={project.slug} project={project} />
                  ))}
                </ul>
              </Collapsible>
              <div className="border-t border-stone-100 py-3 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowAll((s) => !s)}
                  aria-expanded={showAll}
                  aria-controls={moreId}
                  className={`inline-flex items-center gap-1 rounded-full py-1 text-sm font-medium text-stone-600 transition-colors hover:text-amber-700 dark:text-stone-400 dark:hover:text-amber-400 ${focusRing}`}
                >
                  {showAll ? copy.showFewer : `${copy.showAll} (${projects.length})`}
                  <ChevronDown
                    aria-hidden="true"
                    className={`h-4 w-4 transition-transform duration-300 ${showAll ? "rotate-180" : ""}`}
                  />
                </button>
              </div>
            </>
          )}
        </section>
      </main>
    </>
  );
}

export function ProjectsApp() {
  return (
    <SiteShell current="projects">
      <ProjectsPage />
    </SiteShell>
  );
}

import { useId, useState } from "react";
import { AppWindow, ChevronDown, Globe, Plus } from "lucide-react";
import { SiGithub } from "@icons-pack/react-simple-icons";
import { projects, type Project, type ProjectLink } from "../../data/projects";
import { useLanguage } from "../LanguageProvider";
import { SiteShell } from "../SiteShell";
import { PageHeader } from "../PageHeader";
import { Chips } from "../Chips";
import { Collapsible } from "../Collapsible";
import { Gallery } from "../Gallery";
import { button, card, focusRing, sectionHeading } from "../ui";

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
    <span className="inline-flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
      {project.year}
      <span aria-hidden="true">·</span>
      <span className="inline-flex items-center gap-1">
        {live && (
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
        )}
        {t.pages.projects.status[project.status]}
      </span>
    </span>
  );
}

function Highlights({ project }: { project: Project }) {
  const { lang } = useLanguage();
  if (project.highlights.length === 0) return null;
  return (
    <ul className="space-y-2">
      {project.highlights.map((h) => (
        <li
          key={h.en}
          className="relative pl-4 text-sm leading-relaxed text-stone-600 before:absolute before:left-0 before:top-[0.6em] before:h-1.5 before:w-1.5 before:rounded-full before:bg-amber-400 dark:text-stone-400 dark:before:bg-amber-500"
        >
          {h[lang]}
        </li>
      ))}
    </ul>
  );
}

function FeaturedProject({ project, index }: { project: Project; index: number }) {
  const { t, lang } = useLanguage();
  const [open, setOpen] = useState(false);
  const detailsId = useId();
  const hasDetails = project.highlights.length > 0;

  return (
    <article
      className={`${card} p-6 sm:p-8 ${index === 0 ? "fade-up-3" : index === 1 ? "fade-up-4" : "fade-up-5"}`}
    >
      {project.images.length > 0 && (
        <div className="mb-6">
          <Gallery images={project.images} eager={index === 0} />
        </div>
      )}

      <StatusBadge project={project} />
      <h2 className="mt-2 font-display text-2xl font-medium text-stone-900 dark:text-stone-100">
        {project.name}
      </h2>
      <p className="mt-1 text-base font-medium leading-snug text-amber-700 dark:text-amber-400">
        {project.tagline[lang]}
      </p>
      <p className="mt-3 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
        {project.summary[lang]}
      </p>

      {hasDetails && (
        <>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls={detailsId}
            className={`mt-4 inline-flex items-center gap-1 rounded-full text-sm font-medium text-stone-700 transition-colors hover:text-amber-700 dark:text-stone-300 dark:hover:text-amber-400 ${focusRing}`}
          >
            {open ? t.pages.projects.hideDetails : t.pages.projects.details}
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
            />
          </button>
          <Collapsible id={detailsId} open={open} className="pt-3">
            <Highlights project={project} />
          </Collapsible>
        </>
      )}

      <div className="mt-5">
        <Chips items={project.stack} />
      </div>
      <div className="mt-6">
        <ProjectLinks links={project.links} />
      </div>
    </article>
  );
}

function CompactProject({ project }: { project: Project }) {
  const { lang } = useLanguage();
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <li className="border-t border-stone-100 first:border-t-0 dark:border-stone-800">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={panelId}
        className={`flex w-full items-start gap-4 rounded-2xl py-4 text-left ${focusRing}`}
      >
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-baseline gap-x-2">
            <span className="font-medium text-stone-900 dark:text-stone-100">
              {project.name}
            </span>
            <StatusBadge project={project} />
          </span>
          <span className="mt-0.5 block text-sm text-stone-600 dark:text-stone-400">
            {project.tagline[lang]}
          </span>
        </span>
        <Plus
          aria-hidden="true"
          className={`mt-1 h-4 w-4 shrink-0 text-stone-400 transition-transform duration-300 dark:text-stone-500 ${open ? "rotate-45" : ""}`}
        />
      </button>
      <Collapsible id={panelId} open={open} bleed className="space-y-4 pb-6">
        <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-400">
          {project.summary[lang]}
        </p>
        <Highlights project={project} />
        <Gallery images={project.images} />
        <Chips items={project.stack} />
        <ProjectLinks links={project.links} />
      </Collapsible>
    </li>
  );
}

export function ProjectsPage() {
  const { t } = useLanguage();
  const copy = t.pages.projects;
  const featured = projects.filter((p) => p.featured);
  const more = projects.filter((p) => !p.featured);

  return (
    <>
      <PageHeader title={copy.title} subtitle={copy.subtitle} />
      <main className="flex flex-col gap-4 px-6 pb-4">
        {featured.map((project, i) => (
          <FeaturedProject key={project.slug} project={project} index={i} />
        ))}

        {more.length > 0 && (
          <section className={`${card} fade-up-6 mt-4 px-6 pt-6 pb-2 sm:px-8 sm:pt-8`}>
            <h2 className={sectionHeading}>{copy.moreHeading}</h2>
            <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
              {copy.moreSubtitle}
            </p>
            <ul className="mt-3">
              {more.map((project) => (
                <CompactProject key={project.slug} project={project} />
              ))}
            </ul>
          </section>
        )}
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

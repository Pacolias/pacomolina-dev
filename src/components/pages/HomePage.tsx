import { AppWindow, ArrowRight, Download, Globe } from "lucide-react";
import { SiGithub } from "@icons-pack/react-simple-icons";
import { projects, type ProjectLink } from "../../data/projects";
import { site, withBase } from "../../data/site";
import { useLanguage } from "../LanguageProvider";
import { SiteShell } from "../SiteShell";
import { Gallery } from "../Gallery";
import { StackRow } from "../StackRow";
import { LinkedInIcon } from "../icons/LinkedInIcon";
import { button, buttonSm, card, textLink } from "../ui";

const redcheck = projects.find((p) => p.slug === "redcheck")!;

const LINK_ICONS: Record<ProjectLink["kind"], typeof Globe> = {
  live: AppWindow,
  website: Globe,
  repo: SiGithub as unknown as typeof Globe,
};

// "Live demo" first and filled: the one thing someone who just scanned the
// NFC/QR should try.
const LINK_ORDER: ProjectLink["kind"][] = ["live", "website", "repo"];
const LINK_STYLES: Record<ProjectLink["kind"], string> = {
  live: buttonSm.primary,
  website: buttonSm.accent,
  repo: buttonSm.outline,
};

function Intro() {
  const { t } = useLanguage();
  return (
    <div className="px-6 pt-10 pb-8 sm:pt-14">
      <div className="fade-up-1 flex items-center gap-4">
        <img
          src={site.photo}
          alt={site.name}
          width={72}
          height={72}
          fetchPriority="high"
          className="h-16 w-16 shrink-0 rounded-full border-2 border-white object-cover shadow-sm shadow-stone-200/70 sm:h-[72px] sm:w-[72px] dark:border-stone-800 dark:shadow-none"
        />
        <div>
          <h1 className="font-display text-3xl font-medium tracking-tight text-stone-900 sm:text-4xl dark:text-stone-100">
            {site.name}
          </h1>
          <p className="mt-0.5 text-base font-medium text-amber-700 dark:text-amber-400">
            {t.hero.role}
          </p>
        </div>
      </div>

      <p className="fade-up-2 mt-6 text-base leading-relaxed text-stone-600 dark:text-stone-400">
        {t.hero.tagline}
      </p>

      <p className="fade-up-2 mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/70 px-2.5 py-1 text-[11px] font-medium text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300">
        <span className="relative flex h-2 w-2" aria-hidden="true">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60 motion-reduce:hidden" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        {t.hero.availability}
      </p>

      <div className="fade-up-3 mt-6 flex flex-wrap gap-2">
        <a
          href={site.linkedin}
          target="_blank"
          rel="noreferrer noopener"
          className={`${button.primary} flex-1 whitespace-nowrap sm:flex-none`}
        >
          <LinkedInIcon className="h-4 w-4" />
          {t.cta.linkedin}
        </a>
        <a
          href={site.cvHref}
          download
          className={`${button.outline} flex-1 whitespace-nowrap sm:flex-none`}
        >
          <Download className="h-4 w-4" />
          {t.cta.cv}
        </a>
      </div>

      <a href={withBase("/now/")} className={`${textLink} fade-up-3 mt-4`}>
        {t.pages.now.link}
        <ArrowRight className="h-3.5 w-3.5" />
      </a>
    </div>
  );
}

function FeaturedProject() {
  const { t, lang } = useLanguage();
  const links = LINK_ORDER.flatMap((kind) => redcheck.links.filter((l) => l.kind === kind));
  const live = redcheck.status === "live";

  return (
    <section className="fade-up-4">
      <h2 className="text-xs font-medium uppercase tracking-wider text-stone-500 dark:text-stone-400">
        {t.home.featured}
      </h2>
      <article
        className={`${card} mt-3 p-5 sm:grid sm:grid-cols-2 sm:items-center sm:gap-6 sm:p-6`}
      >
        <Gallery images={redcheck.images.slice(0, 1)} />
        <div className="mt-4 sm:mt-0">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <h3 className="text-base font-medium text-stone-900 dark:text-stone-100">
              {redcheck.name}
            </h3>
            <span className="inline-flex items-center gap-1 text-[11px] text-stone-500 dark:text-stone-400">
              {live && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />}
              {t.pages.projects.status[redcheck.status]}
            </span>
          </div>
          <p className="mt-0.5 text-sm text-stone-600 dark:text-stone-400">{redcheck.blurb[lang]}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {links.map((link) => {
              const Icon = LINK_ICONS[link.kind];
              return (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  title={t.home.links[link.kind]}
                  className={`${LINK_STYLES[link.kind]} whitespace-nowrap`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {link.kind === "repo" ? (
                    // The GitHub mark alone, so the three links fit one row
                    // in the card's narrow text column.
                    <span className="sr-only">{t.home.links[link.kind]}</span>
                  ) : (
                    t.home.links[link.kind]
                  )}
                </a>
              );
            })}
          </div>
        </div>
      </article>
      <a href={withBase("/projects/")} className={`${textLink} mt-4`}>
        {t.home.allProjects}
        <ArrowRight className="h-3.5 w-3.5" />
      </a>
    </section>
  );
}

export function HomePage() {
  return (
    <>
      <Intro />
      <div className="flex flex-col gap-10 px-6 pb-10">
        <FeaturedProject />
        <div className="fade-up-5">
          <StackRow />
        </div>
      </div>
    </>
  );
}

export function HomeApp() {
  return (
    <SiteShell current="home">
      <HomePage />
    </SiteShell>
  );
}

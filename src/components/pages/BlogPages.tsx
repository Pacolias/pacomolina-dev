import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Camera,
  Check,
  Share2,
  FileText,
  Flag,
  Lightbulb,
  Mic,
  Rocket,
  Presentation,
  Video,
} from "lucide-react";
import { SiGithub } from "@icons-pack/react-simple-icons";
import type { BlogPostSummary, BlogType } from "../../data/blog";
import type { Lang } from "../../data/i18n";
import { formatDate } from "../../data/format";
import { readBlogIndex } from "../../data/blogIndex";
import { withBase } from "../../data/site";
import { useLanguage } from "../LanguageProvider";
import { SiteShell } from "../SiteShell";
import { PageHeader } from "../PageHeader";
import { Lightbox } from "../Lightbox";
import { Gallery, type LightboxImage } from "../Gallery";
import { Chips } from "../Chips";
import { ExpandableRow, rowTitle } from "../ExpandableRow";
import { LinkedInIcon } from "../icons/LinkedInIcon";
import { button, buttonSm, card, focusRing, textLink } from "../ui";

// A post may exist in only one language — fall back to the other one.
function version(post: BlogPostSummary, lang: Lang) {
  return (post.versions[lang] ?? post.versions[lang === "en" ? "es" : "en"])!;
}

// Client-side twin of entryHref() in data/blog.ts (which can't be imported
// here: it pulls in astro:content).
function hrefOf(post: BlogPostSummary) {
  return withBase(post.hasPage ? `/blog/${post.slug}/` : `/blog/#${post.slug}`);
}

const TYPE_ICONS: Record<BlogType, typeof FileText> = {
  article: FileText,
  talk: Mic,
  linkedin: LinkedInIcon as unknown as typeof FileText,
  milestone: Flag,
  release: Rocket,
  event: CalendarDays,
  til: Lightbulb,
};
const TYPE_ORDER: BlogType[] = [
  "linkedin",
  "article",
  "talk",
  "event",
  "milestone",
  "release",
  "til",
];

function TypeBadge({ type }: { type: BlogType }) {
  const Icon = TYPE_ICONS[type];
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
      <Icon className="h-4 w-4" aria-hidden="true" />
    </span>
  );
}

function PostMeta({ post }: { post: BlogPostSummary }) {
  const { t, lang } = useLanguage();
  const copy = t.pages.blog;
  // The type is already shown by the row's icon: screen readers get it as
  // text, the visible line stays short (date · event / reading time).
  const extra =
    post.type === "talk" && post.event
      ? post.event
      : post.type === "event" && post.location
        ? post.location
        : post.type === "article"
          ? `${post.readingMinutes} ${copy.minRead}`
          : null;
  return (
    <span className="text-xs text-stone-500 dark:text-stone-400">
      <span className="sr-only">{copy.types[post.type]}, </span>
      <time dateTime={post.date}>{formatDate(post.date, lang)}</time>
      {extra && <> · {extra}</>}
      {post.draft && (
        <span className="ml-1.5 rounded-full bg-stone-200 px-2 py-0.5 font-medium text-stone-700 dark:bg-stone-800 dark:text-stone-300">
          {copy.draft}
        </span>
      )}
    </span>
  );
}

function TopicChips({ post }: { post: BlogPostSummary }) {
  const { t } = useLanguage();
  if (post.topics.length === 0) return null;
  return <Chips items={post.topics.map((topic) => t.pages.blog.topics[topic])} />;
}

// "Part 2 of 3" + links to the other parts, for entries in a series.
function SeriesNav({ post, all }: { post: BlogPostSummary; all: BlogPostSummary[] }) {
  const { t, lang } = useLanguage();
  if (!post.series) return null;
  const parts = all
    .filter((p) => p.series?.id === post.series!.id)
    .sort((a, b) => a.series!.part - b.series!.part);
  const label = t.pages.blog.seriesPart
    .replace("{part}", String(post.series.part))
    .replace("{total}", String(parts.length));
  return (
    <div className="rounded-2xl border border-stone-100 px-4 py-3 text-sm dark:border-stone-800">
      <p className="text-xs text-stone-500 dark:text-stone-400">
        {version(post, lang).seriesTitle} · {label}
      </p>
      <ol className="mt-2 space-y-1">
        {parts.map((p) => (
          <li key={p.slug} className="flex gap-2">
            <span className="text-stone-400 tabular-nums dark:text-stone-500">{p.series!.part}.</span>
            {p.slug === post.slug ? (
              <span className="font-medium text-stone-800 dark:text-stone-200">{version(p, lang).title}</span>
            ) : (
              <a href={hrefOf(p)} className={textLink}>
                {version(p, lang).title}
              </a>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

// Share an entry: the native share sheet where there is one (phones), else
// copy the link. Deep link to the entry: its page, or its row in the list.
function ShareButton({ post }: { post: BlogPostSummary }) {
  const { t, lang } = useLanguage();
  const copy = t.pages.blog;
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const share = async () => {
    const url = new URL(hrefOf(post), window.location.origin).toString();
    const title = version(post, lang).title;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch (err) {
        // Closing the share sheet isn't an error worth a fallback.
        if ((err as DOMException)?.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      // Neither available: nothing sensible left to do.
    }
  };

  return (
    <>
      <button type="button" onClick={share} className={buttonSm.outline}>
        {copied ? <Check className="h-3.5 w-3.5" /> : <Share2 className="h-3.5 w-3.5" />}
        {copied ? copy.linkCopied : copy.share}
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? copy.linkCopied : ""}
      </span>
    </>
  );
}

// `external: false` on article/talk pages, whose header already shows the
// slides/video/code links.
function EntryLinks({ post, external: withExternal = true }: { post: BlogPostSummary; external?: boolean }) {
  const { t } = useLanguage();
  const copy = t.pages.blog;
  // External links, in order: event page, recap, slides, video, code.
  const external = !withExternal ? [] : [
    { href: post.links?.event, label: copy.eventPage, Icon: CalendarDays },
    { href: post.links?.recap, label: copy.recap, Icon: Camera },
    { href: post.links?.slides, label: copy.slides, Icon: Presentation },
    { href: post.links?.video, label: copy.video, Icon: Video },
    { href: post.links?.repo, label: copy.repo, Icon: SiGithub as unknown as typeof Video },
  ].filter((l): l is typeof l & { href: string } => Boolean(l.href));
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
      {external.map(({ href, label, Icon }) => (
        <a key={href} href={href} target="_blank" rel="noreferrer noopener" className={buttonSm.accent}>
          <Icon className="h-3.5 w-3.5" />
          {label}
          <ArrowUpRight className="h-3 w-3" />
        </a>
      ))}
      {post.linkedin && (
        <a href={post.linkedin} target="_blank" rel="noreferrer noopener" className={buttonSm.accent}>
          <LinkedInIcon className="h-3.5 w-3.5" />
          {copy.viewOnLinkedIn}
          <ArrowUpRight className="h-3 w-3" />
        </a>
      )}
      {post.project && (
        <a href={withBase(`/projects/#${post.project.slug}`)} className={textLink}>
          {copy.project}: {post.project.name}
          <ArrowRight className="h-3.5 w-3.5" />
        </a>
      )}
      <ShareButton post={post} />
    </div>
  );
}

// An inline entry's body (LinkedIn post, milestone, TIL): Astro-rendered
// Markdown from our own content files.
function InlineBody({ post, all }: { post: BlogPostSummary; all: BlogPostSummary[] }) {
  const { lang } = useLanguage();
  const v = version(post, lang);
  const images = (v.images ?? []).map((img) => ({
    src: img.src,
    alt: { en: img.alt, es: img.alt },
    width: img.width,
    height: img.height,
  }));
  return (
    <>
      <Gallery images={images} />
      {v.html && (
        <div
          className="prose prose-sm prose-stone max-w-none prose-p:leading-relaxed prose-a:text-amber-700 prose-a:decoration-amber-300 prose-a:underline-offset-4 prose-strong:font-medium prose-li:my-1 prose-code:rounded prose-code:bg-stone-100 prose-code:px-1 prose-code:py-0.5 prose-code:font-normal prose-code:before:content-none prose-code:after:content-none dark:prose-invert dark:prose-a:text-amber-400 dark:prose-a:decoration-amber-800 dark:prose-code:bg-stone-800"
          dangerouslySetInnerHTML={{ __html: v.html }}
        />
      )}
      <SeriesNav post={post} all={all} />
      <TopicChips post={post} />
      <EntryLinks post={post} />
    </>
  );
}

// A row that opens the entry's own page (articles, talks, director's cuts).
function PageRow({ post }: { post: BlogPostSummary }) {
  const { lang } = useLanguage();
  return (
    <li className="border-t border-stone-100 first:border-t-0 dark:border-stone-800">
      <a
        href={hrefOf(post)}
        className={`group flex w-full items-start gap-2.5 rounded-2xl py-3.5 sm:gap-4 ${focusRing}`}
      >
        <TypeBadge type={post.type} />
        <span className="min-w-0 flex-1">
          <span className={`block ${rowTitle}`}>{version(post, lang).title}</span>
          <span className="mt-0.5 block">
            <PostMeta post={post} />
          </span>
        </span>
        <ArrowUpRight
          aria-hidden="true"
          className="mt-0.5 h-4 w-4 shrink-0 text-stone-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-amber-600 dark:text-stone-500"
        />
      </a>
    </li>
  );
}

export function BlogIndexApp({ posts }: { posts: BlogPostSummary[] }) {
  return (
    <SiteShell current="blog">
      <BlogIndex posts={posts} />
    </SiteShell>
  );
}

// The blog index as the swipe preview on neighbouring pages: those pages
// don't get `posts` as a prop, so it reads the (light) summaries Layout.astro
// embeds on every page.
export function BlogIndexPreview() {
  return <BlogIndex posts={readBlogIndex()} />;
}

// The "bitácora": every kind of entry in one chronological list, with type
// filters on top (only when there's more than one type to filter by).
function BlogIndex({ posts }: { posts: BlogPostSummary[] }) {
  const { t, lang } = useLanguage();
  const copy = t.pages.blog;
  const [filter, setFilter] = useState<BlogType | "all">("all");
  const types = TYPE_ORDER.filter((type) => posts.some((p) => p.type === type));
  const shown = filter === "all" ? posts : posts.filter((p) => p.type === filter);

  // A #slug link to an entry the current filter hides: show everything, so
  // the row exists and can open itself (ExpandableRow's anchor handling).
  useEffect(() => {
    const reveal = () => {
      const slug = decodeURIComponent(window.location.hash.slice(1));
      const target = posts.find((p) => p.slug === slug);
      if (target && filter !== "all" && target.type !== filter) setFilter("all");
    };
    window.addEventListener("hashchange", reveal);
    return () => window.removeEventListener("hashchange", reveal);
  }, [posts, filter]);

  const chip = (active: boolean) =>
    `rounded-full border px-3 py-1 text-xs font-medium transition-colors duration-200 ${focusRing} ${
      active
        ? "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
        : "border-stone-200 text-stone-600 hover:border-amber-200 hover:text-amber-700 dark:border-stone-800 dark:text-stone-400 dark:hover:border-amber-800 dark:hover:text-amber-400"
    }`;

  return (
    <>
      <PageHeader title={copy.title} subtitle={copy.subtitle} />
      <div className="px-6 pb-4">
        {posts.length === 0 ? (
          <p className={`${card} fade-up-3 p-6 text-sm text-stone-600 sm:p-8 dark:text-stone-400`}>
            {copy.empty}
          </p>
        ) : (
          <>
            {types.length > 1 && (
              <div className="fade-up-3 mb-3 flex flex-wrap gap-2" role="group" aria-label={copy.title}>
                {(["all", ...types] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    aria-pressed={filter === type}
                    onClick={() => setFilter(type)}
                    className={chip(filter === type)}
                  >
                    {type === "all" ? copy.all : copy.filters[type]}
                  </button>
                ))}
              </div>
            )}
            <section className={`${card} fade-up-3 px-6 py-2 sm:px-8`}>
              <ul>
                {shown.map((post) =>
                  post.hasPage ? (
                    <PageRow key={post.slug} post={post} />
                  ) : (
                    <ExpandableRow
                      key={post.slug}
                      anchor={post.slug}
                      leading={<TypeBadge type={post.type} />}
                      title={<span className={rowTitle}>{version(post, lang).title}</span>}
                      subtitle={<PostMeta post={post} />}
                    >
                      <InlineBody post={post} all={posts} />
                    </ExpandableRow>
                  )
                )}
              </ul>
            </section>
          </>
        )}
      </div>
    </>
  );
}

// The post body is rendered by Astro (Markdown → HTML, both languages) and
// passed in as `children`; CSS shows the one matching <html lang>.
export function BlogPostApp({
  post,
  children,
}: {
  post: BlogPostSummary;
  children?: ReactNode;
}) {
  return (
    <SiteShell current="blog">
      <BlogPost post={post}>{children}</BlogPost>
    </SiteShell>
  );
}

// Reads what the lightbox needs straight from an <img> Astro rendered. The
// caption comes from the <figcaption> the figure-captions Markdown plugin
// builds out of `![alt](./x.webp "Caption")`. Post bodies are single-language
// per block, so the same text serves both keys.
function toLightboxImage(img: HTMLImageElement): LightboxImage {
  const alt = img.alt;
  const caption = img.closest("figure")?.querySelector("figcaption")?.textContent;
  return {
    src: img.currentSrc || img.src,
    alt: { en: alt, es: alt },
    caption: caption ? { en: caption, es: caption } : undefined,
    width: img.naturalWidth || img.width,
    height: img.naturalHeight || img.height,
  };
}

// Makes every image in the (static, Astro-rendered) post body open in the
// Lightbox — click/tap, or Tab + Enter/Space. The viewer steps through the
// images of the language block that was clicked, in document order.
function usePostImageViewer(root: RefObject<HTMLElement | null>) {
  const { t } = useLanguage();
  const [viewer, setViewer] = useState<{ images: LightboxImage[]; index: number } | null>(null);

  useEffect(() => {
    const container = root.current;
    if (!container) return;

    for (const img of container.querySelectorAll("img")) {
      img.tabIndex = 0;
      img.setAttribute("role", "button");
      img.setAttribute("aria-label", `${t.lightbox.open}: ${img.alt}`);
    }

    const open = (img: HTMLImageElement) => {
      const block = img.closest("[data-lang]") ?? container;
      const imgs = [...block.querySelectorAll("img")];
      setViewer({ images: imgs.map(toLightboxImage), index: imgs.indexOf(img) });
    };
    const onClick = (e: MouseEvent) => {
      const img = (e.target as Element).closest("img");
      if (img && container.contains(img)) open(img);
    };
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "Enter" || e.key === " ") && e.target instanceof HTMLImageElement) {
        e.preventDefault();
        open(e.target);
      }
    };
    container.addEventListener("click", onClick);
    container.addEventListener("keydown", onKey);
    return () => {
      container.removeEventListener("click", onClick);
      container.removeEventListener("keydown", onKey);
    };
  }, [root, t]);

  return (
    <Lightbox
      images={viewer?.images ?? []}
      index={viewer?.index ?? null}
      onIndexChange={(index) => setViewer((v) => (v ? { ...v, index } : v))}
      onClose={() => setViewer(null)}
    />
  );
}

// Series navigation, topics and LinkedIn/project links under an article.
// Series parts come from the summaries embedded on every page, read after
// hydration (they aren't in the prerendered HTML).
function PostExtras({ post }: { post: BlogPostSummary }) {
  const [all, setAll] = useState<BlogPostSummary[]>([]);
  useEffect(() => setAll(readBlogIndex()), []);
  return (
    <div className="mt-8 space-y-4 border-t border-stone-100 pt-6 dark:border-stone-800">
      {all.length > 0 && <SeriesNav post={post} all={all} />}
      <TopicChips post={post} />
      <EntryLinks post={post} external={false} />
    </div>
  );
}

function BlogPost({ post, children }: { post: BlogPostSummary; children?: ReactNode }) {
  const { t, lang } = useLanguage();
  const proseRef = useRef<HTMLDivElement>(null);
  const imageViewer = usePostImageViewer(proseRef);
  const copy = t.pages.blog;
  const v = version(post, lang);
  const links = [
    { href: post.links?.slides, label: copy.slides, Icon: Presentation },
    { href: post.links?.video, label: copy.video, Icon: Video },
    { href: post.links?.repo, label: copy.repo, Icon: SiGithub as unknown as typeof Video },
  ].filter((l): l is typeof l & { href: string } => Boolean(l.href));

  return (
    <div className="px-6 pt-8 pb-4 sm:pt-12">
      <a
        href={withBase("/blog/")}
        className={`fade-up-1 inline-flex items-center gap-1.5 rounded-full text-sm font-medium text-stone-500 transition-colors hover:text-amber-700 dark:text-stone-400 dark:hover:text-amber-400 ${focusRing}`}
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {copy.back}
      </a>

      <article className={`${card} fade-up-2 mt-6 p-6 sm:p-10`}>
        <header>
          <PostMeta post={post} />
          <h1 className="mt-2 font-display text-3xl font-medium leading-tight tracking-tight text-balance text-stone-900 sm:text-4xl dark:text-stone-100">
            {v.title}
          </h1>
          <p className="mt-3 text-base leading-relaxed text-stone-600 dark:text-stone-400">
            {v.description}
          </p>
          {links.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {links.map(({ href, label, Icon }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className={button.accent}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </a>
              ))}
            </div>
          )}
        </header>

        <div className="mt-8 border-t border-stone-100 pt-8 dark:border-stone-800">
          <div ref={proseRef} className="prose prose-stone max-w-none prose-headings:font-display prose-headings:font-medium prose-a:text-amber-700 prose-a:decoration-amber-300 prose-a:underline-offset-4 hover:prose-a:decoration-amber-600 prose-strong:font-medium prose-code:rounded prose-code:bg-stone-100 prose-code:px-1 prose-code:py-0.5 prose-code:font-normal prose-code:before:content-none prose-code:after:content-none prose-pre:rounded-2xl prose-figcaption:mt-3 prose-figcaption:text-center prose-figcaption:text-sm prose-figcaption:text-pretty prose-figcaption:text-stone-500 dark:prose-figcaption:text-stone-400 prose-img:cursor-zoom-in prose-img:rounded-2xl prose-img:transition-opacity hover:prose-img:opacity-90 [&_img:focus-visible]:outline-2 [&_img:focus-visible]:outline-offset-4 [&_img:focus-visible]:outline-amber-500 [&_pre_code]:bg-transparent [&_pre_code]:p-0 dark:prose-invert dark:prose-a:text-amber-400 dark:prose-a:decoration-amber-800 dark:prose-code:bg-stone-800">
            {children}
          </div>
        </div>
        <PostExtras post={post} />
      </article>
      {imageViewer}
    </div>
  );
}

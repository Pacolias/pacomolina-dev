import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { ArrowLeft, ArrowUpRight, Mic, Presentation, Video } from "lucide-react";
import { SiGithub } from "@icons-pack/react-simple-icons";
import type { BlogPostSummary } from "../../data/blog";
import type { Lang } from "../../data/i18n";
import { formatDate } from "../../data/format";
import { withBase } from "../../data/site";
import { useLanguage } from "../LanguageProvider";
import { SiteShell } from "../SiteShell";
import { PageHeader } from "../PageHeader";
import { Lightbox } from "../Lightbox";
import type { LightboxImage } from "../Gallery";
import { button, card, focusRing } from "../ui";

// A post may exist in only one language — fall back to the other one.
function version(post: BlogPostSummary, lang: Lang) {
  return (post.versions[lang] ?? post.versions[lang === "en" ? "es" : "en"])!;
}

function PostMeta({ post }: { post: BlogPostSummary }) {
  const { t, lang } = useLanguage();
  return (
    <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-stone-500 dark:text-stone-400">
      <time dateTime={post.date}>{formatDate(post.date, lang)}</time>
      {post.type === "talk" && (
        <>
          <span aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1 font-medium text-amber-700 dark:text-amber-400">
            <Mic className="h-3 w-3" aria-hidden="true" />
            {t.pages.blog.talk}
            {post.event && ` — ${post.event}`}
          </span>
        </>
      )}
      {post.draft && (
        <>
          <span aria-hidden="true">·</span>
          <span className="rounded-full bg-stone-200 px-2 py-0.5 font-medium text-stone-700 dark:bg-stone-800 dark:text-stone-300">
            {t.pages.blog.draft}
          </span>
        </>
      )}
    </span>
  );
}

export function BlogIndexApp({ posts }: { posts: BlogPostSummary[] }) {
  return (
    <SiteShell current="blog">
      <BlogIndex posts={posts} />
    </SiteShell>
  );
}

function BlogIndex({ posts }: { posts: BlogPostSummary[] }) {
  const { t, lang } = useLanguage();
  const copy = t.pages.blog;

  return (
    <>
      <PageHeader title={copy.title} subtitle={copy.subtitle} />
      <main className="px-6 pb-4">
        {posts.length === 0 ? (
          <p className={`${card} fade-up-3 p-6 text-sm text-stone-600 sm:p-8 dark:text-stone-400`}>
            {copy.empty}
          </p>
        ) : (
          <ul className={`${card} fade-up-3 px-2 py-2 sm:px-3`}>
            {posts.map((post) => {
              const v = version(post, lang);
              return (
                <li
                  key={post.slug}
                  className="border-t border-stone-100 first:border-t-0 dark:border-stone-800"
                >
                  <a
                    href={withBase(`/blog/${post.slug}/`)}
                    className={`group flex items-start gap-4 rounded-2xl px-4 py-4 transition-colors hover:bg-amber-50/50 sm:px-5 dark:hover:bg-stone-800/50 ${focusRing}`}
                  >
                    <span className="min-w-0 flex-1">
                      <PostMeta post={post} />
                      <span className="mt-1 block font-display text-lg font-medium leading-snug text-stone-900 dark:text-stone-100">
                        {v.title}
                      </span>
                      <span className="mt-1 block text-sm leading-relaxed text-stone-600 dark:text-stone-400">
                        {v.description}
                      </span>
                    </span>
                    <ArrowUpRight
                      aria-hidden="true"
                      className="mt-6 h-4 w-4 shrink-0 text-stone-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-amber-600 dark:text-stone-500"
                    />
                  </a>
                </li>
              );
            })}
          </ul>
        )}
      </main>
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
    <main className="px-6 pt-8 pb-4 sm:pt-12">
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
      </article>
      {imageViewer}
    </main>
  );
}

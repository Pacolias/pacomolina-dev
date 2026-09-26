import { getCollection, type CollectionEntry } from "astro:content";
import type { Lang } from "./i18n";
import { projects } from "./projects";

// Server-side only (uses astro:content) — groups the per-language entries
// of the blog collection into one entry per folder.

export type BlogEntry = CollectionEntry<"blog">;
export type BlogType = BlogEntry["data"]["type"];
export type BlogTopic = BlogEntry["data"]["topics"][number];

export type BlogPost = {
  slug: string;
  entries: Partial<Record<Lang, BlogEntry>>;
  // The entry whose frontmatter (date, type, links…) is shared by both.
  primary: BlogEntry;
};

type Version = {
  title: string;
  description: string;
  seriesTitle?: string;
  // Full summaries only (the blog page itself):
  html?: string;
  images?: { src: string; width: number; height: number; alt: string }[];
};

// Serializable summary passed to the React islands. "Light" (no body, no
// images) everywhere else — it's embedded on every page for the swipe
// preview and the project ↔ entry links.
export type BlogPostSummary = {
  slug: string;
  date: string;
  type: BlogType;
  // Has its own page at /blog/<slug>/ (articles, talks, director's cuts);
  // otherwise it lives inline in the list, at /blog/#<slug>.
  hasPage: boolean;
  linkedin?: string;
  project?: { slug: string; name: string };
  series?: { id: string; part: number };
  topics: BlogTopic[];
  readingMinutes: number;
  event?: string;
  location?: string;
  draft: boolean;
  links?: { slides?: string; video?: string; repo?: string; event?: string; recap?: string };
  versions: Partial<Record<Lang, Version>>;
};

export function hasOwnPage(entry: BlogEntry) {
  const { type, page } = entry.data;
  return type === "article" || type === "talk" || page;
}

// Where an entry lives: its page, or its row in the list.
export function entryHref(post: Pick<BlogPostSummary, "slug" | "hasPage">) {
  return post.hasPage ? `/blog/${post.slug}/` : `/blog/#${post.slug}`;
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  const entries = await getCollection(
    "blog",
    (e) => import.meta.env.DEV || !e.data.draft
  );
  const bySlug = new Map<string, Partial<Record<Lang, BlogEntry>>>();
  for (const entry of entries) {
    const [slug, lang] = entry.id.split("/") as [string, Lang];
    bySlug.set(slug, { ...bySlug.get(slug), [lang]: entry });
  }
  return [...bySlug.entries()]
    .map(([slug, e]) => ({ slug, entries: e, primary: (e.en ?? e.es)! }))
    .sort((a, b) => b.primary.data.date.valueOf() - a.primary.data.date.valueOf());
}

const WORDS_PER_MINUTE = 220;

export function summarize(post: BlogPost, { full = false } = {}): BlogPostSummary {
  const { data } = post.primary;
  const project = data.project ? projects.find((p) => p.slug === data.project) : undefined;
  if (data.project && !project) {
    throw new Error(`blog/${post.slug}: unknown project "${data.project}"`);
  }
  const versions: BlogPostSummary["versions"] = {};
  for (const lang of ["en", "es"] as const) {
    const entry = post.entries[lang];
    if (!entry) continue;
    versions[lang] = {
      title: entry.data.title,
      description: entry.data.description,
      seriesTitle: entry.data.series?.title,
      ...(full && {
        html: entry.rendered?.html ?? "",
        images: entry.data.images.map((img) => ({
          src: img.src.src,
          width: img.src.width,
          height: img.src.height,
          alt: img.alt,
        })),
      }),
    };
  }
  const words = (post.primary.body ?? "").split(/\s+/).filter(Boolean).length;
  return {
    slug: post.slug,
    date: data.date.toISOString(),
    type: data.type,
    hasPage: hasOwnPage(post.primary),
    linkedin: data.linkedin,
    project: project && { slug: project.slug, name: project.name },
    series: data.series && { id: data.series.id, part: data.series.part },
    topics: data.topics,
    readingMinutes: Math.max(1, Math.round(words / WORDS_PER_MINUTE)),
    event: data.event,
    location: data.location,
    draft: data.draft,
    links: data.links,
    versions,
  };
}

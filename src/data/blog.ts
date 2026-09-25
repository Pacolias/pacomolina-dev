import { getCollection, type CollectionEntry } from "astro:content";
import type { Lang } from "./i18n";

// Server-side only (uses astro:content) — groups the per-language entries
// of the blog collection into one post per folder.

export type BlogEntry = CollectionEntry<"blog">;

export type BlogPost = {
  slug: string;
  entries: Partial<Record<Lang, BlogEntry>>;
  // The entry whose frontmatter (date, type, links…) is shared by both.
  primary: BlogEntry;
};

// Serializable summary passed to the React islands.
export type BlogPostSummary = {
  slug: string;
  date: string;
  type: "post" | "talk";
  event?: string;
  draft: boolean;
  links?: { slides?: string; video?: string; repo?: string };
  versions: Partial<Record<Lang, { title: string; description: string }>>;
};

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

export function summarize(post: BlogPost): BlogPostSummary {
  const { data } = post.primary;
  const versions: BlogPostSummary["versions"] = {};
  for (const lang of ["en", "es"] as const) {
    const entry = post.entries[lang];
    if (entry) {
      versions[lang] = { title: entry.data.title, description: entry.data.description };
    }
  }
  return {
    slug: post.slug,
    date: data.date.toISOString(),
    type: data.type,
    event: data.event,
    draft: data.draft,
    links: data.links,
    versions,
  };
}

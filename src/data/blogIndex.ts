import type { BlogPostSummary } from "./blog";

// Client-side: the light blog summaries Layout.astro embeds on every page
// (<script type="application/json" id="blog-index">). Used by the swipe
// preview of the blog, series navigation and the project ↔ entry links.
let cache: BlogPostSummary[] | null = null;

export function readBlogIndex(): BlogPostSummary[] {
  if (cache) return cache;
  if (typeof document === "undefined") return [];
  const el = document.getElementById("blog-index");
  cache = el?.textContent ? (JSON.parse(el.textContent) as BlogPostSummary[]) : [];
  return cache;
}

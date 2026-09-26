import type { APIRoute } from "astro";
import { getBlogPosts, hasOwnPage } from "../data/blog";
import { sections } from "../data/site";

// A plain sitemap for the section pages and published blog posts (drafts
// are already filtered out of production builds by getBlogPosts). Written
// by hand instead of @astrojs/sitemap: a handful of URLs, no dependency.
export const GET: APIRoute = async ({ site }) => {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const url = (path: string) => new URL(`${base}${path}`, site).toString();
  // Only entries with their own page (inline ones live at /blog/#slug).
  const posts = (await getBlogPosts()).filter((post) => hasOwnPage(post.primary));

  const entries = [
    ...sections.map((s) => `  <url><loc>${url(s.path)}</loc></url>`),
    ...posts.map(
      (p) =>
        `  <url><loc>${url(`/blog/${p.slug}/`)}</loc><lastmod>${p.primary.data.date
          .toISOString()
          .slice(0, 10)}</lastmod></url>`
    ),
  ];

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join("\n")}\n</urlset>\n`,
    { headers: { "Content-Type": "application/xml; charset=utf-8" } }
  );
};

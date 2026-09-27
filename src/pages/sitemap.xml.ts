import type { APIRoute } from "astro";
import { getBlogPosts, hasOwnPage } from "../data/blog";
import { sections } from "../data/site";
import { LOCALES, localizePath } from "../data/locale";

// A plain sitemap for the section pages, /now/ and published blog posts
// (drafts are already filtered out of production builds by getBlogPosts),
// each in both languages with hreflang alternates. Written by hand instead
// of @astrojs/sitemap: a handful of URLs, no dependency.
export const GET: APIRoute = async ({ site }) => {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const url = (path: string) => new URL(`${base}${path}`, site).toString();
  // Only entries with their own page (inline ones live at /blog/#slug).
  const posts = (await getBlogPosts()).filter((post) => hasOwnPage(post.primary));

  const pages: { path: string; lastmod?: string }[] = [
    ...sections.map((s) => ({ path: s.path })),
    { path: "/now/" },
    ...posts.map((p) => ({
      path: `/blog/${p.slug}/`,
      lastmod: p.primary.data.date.toISOString().slice(0, 10),
    })),
  ];

  const alternates = (path: string) =>
    [
      ...LOCALES.map(
        (l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${url(localizePath(path, l))}"/>`
      ),
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${url(path)}"/>`,
    ].join("\n");

  const entries = pages.flatMap(({ path, lastmod }) =>
    LOCALES.map(
      (lang) =>
        `  <url>\n    <loc>${url(localizePath(path, lang))}</loc>${
          lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ""
        }\n${alternates(path)}\n  </url>`
    )
  );

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${entries.join("\n")}\n</urlset>\n`,
    { headers: { "Content-Type": "application/xml; charset=utf-8" } }
  );
};

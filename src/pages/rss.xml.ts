import type { APIRoute } from "astro";
import { entryHref, getBlogPosts, hasOwnPage } from "../data/blog";

// RSS for the blog, hand-written like the sitemap (no @astrojs/rss). Posts
// are bilingual; the feed carries the English version (or the Spanish one
// when a post has no English file), linking to the single post URL.
const escape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export const GET: APIRoute = async ({ site }) => {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const url = (path: string) => new URL(`${base}${path}`, site).toString();
  const posts = await getBlogPosts();

  const items = posts.map((post) => {
    const entry = post.entries.en ?? post.entries.es!;
    // Inline entries (LinkedIn posts, milestones, TILs) link to their row.
    const link = url(entryHref({ slug: post.slug, hasPage: hasOwnPage(post.primary) }));
    return [
      "    <item>",
      `      <title>${escape(entry.data.title)}</title>`,
      `      <link>${link}</link>`,
      `      <guid isPermaLink="true">${link}</guid>`,
      `      <description>${escape(entry.data.description)}</description>`,
      `      <pubDate>${post.primary.data.date.toUTCString()}</pubDate>`,
      "    </item>",
    ].join("\n");
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Paco Molina — Blog</title>
    <link>${url("/blog/")}</link>
    <atom:link href="${url("/rss.xml")}" rel="self" type="application/rss+xml" />
    <description>What I'm learning, building and talking about.</description>
    <language>en</language>
${items.join("\n")}
  </channel>
</rss>
`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
};

import type { APIRoute } from "astro";
import { getBlogPosts, hasOwnPage, type BlogPost } from "../../../../data/blog";
import { formatDate } from "../../../../data/format";
import { dictionary, type Lang } from "../../../../data/i18n";
import { LOCALES } from "../../../../data/locale";
import { renderOgCard } from "../../../../data/og";

// /og/blog/<lang>/<slug>.jpg — the social card of each blog entry that has
// its own page (the rest share the blog index's card), in each language.

export async function getStaticPaths() {
  const posts = (await getBlogPosts()).filter((post) => hasOwnPage(post.primary));
  return posts.flatMap((post) =>
    LOCALES.map((lang) => ({ params: { lang, slug: post.slug }, props: { post } }))
  );
}

export const GET: APIRoute = async ({ params, props }) => {
  const lang = params.lang as Lang;
  const { post } = props as { post: BlogPost };
  const entry = post.entries[lang] ?? post.primary;
  const { data } = post.primary;
  const t = dictionary[lang].pages.blog;
  const accent = [t.types[data.type], data.event, formatDate(data.date, lang)]
    .filter(Boolean)
    .join(" · ");
  const jpg = await renderOgCard({
    kicker: "Paco Molina · Blog",
    title: entry.data.title,
    accent,
    line: entry.data.description,
  });
  return new Response(new Uint8Array(jpg), { headers: { "Content-Type": "image/jpeg" } });
};

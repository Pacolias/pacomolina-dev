import type { APIRoute } from "astro";
import { dictionary } from "../../data/i18n";
import { site, stack } from "../../data/site";
import { projects } from "../../data/projects";
import { jobs } from "../../data/work";
import { intro, languages, timeline } from "../../data/about";
import { now, nowUpdated } from "../../data/now";
import { getBlogPosts, entryHref, summarize } from "../../data/blog";
import texts from "../../data/documents-text.json";

// /assistant/knowledge.txt — everything the site says about Paco, as plain
// text for the "Ask about Paco" assistant (the Cloudflare Worker in
// worker/ fetches it and puts it in the model's context). Built from the
// same data files as the pages, so it's never out of date. Every block
// names the site path it comes from, so answers can link to it.
// English (the model answers in the visitor's language); the Spanish
// wording of a few titles is given where it differs.

const strip = (html: string) =>
  html
    // Diagrams (inline SVG with its own CSS) and code styles aren't prose.
    .replace(/<figure class="diagram[\s\S]*?<\/figure>/g, " ")
    .replace(/<style[\s\S]*?<\/style>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();

const month = (ym: string) => {
  const [y, m] = ym.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en", { month: "short", year: "numeric", timeZone: "UTC" });
};

export const GET: APIRoute = async () => {
  const en = dictionary.en;
  const out: string[] = [];
  const block = (title: string, path: string, lines: (string | false | undefined)[]) =>
    out.push(`## ${title}\nSource: ${path}\n${lines.filter(Boolean).join("\n")}\n`);

  block("Profile", "/", [
    `Name: ${site.name} (full name Francisco Javier Molina Cuenca)`,
    `Role: ${en.hero.role}`,
    `In one line: ${en.hero.tagline} (Spanish: "${dictionary.es.hero.tagline}")`,
    `Availability: ${en.hero.availability}`,
    `Contact: email ${site.email} · LinkedIn ${site.linkedin} · GitHub ${site.github}`,
    `CV: can be viewed and downloaded on the home page ("View CV").`,
    `Core tech stack: ${stack.map((s) => s.name).join(", ")}`,
  ]);

  block("About", "/about/", [
    ...intro.map((p) => p.en),
    `Languages: ${languages.map((l) => `${l.name.en} (${l.level.en})`).join(", ")}`,
  ]);

  block(
    "Timeline (oldest first)",
    "/about/",
    timeline.map((item) => `- ${item.date.en} — ${item.title.en} (Spanish: "${item.title.es}"): ${item.body.en}`)
  );

  block(`Now (updated ${nowUpdated})`, "/now/", now.flatMap((s) => [`${s.heading.en}:`, ...s.items.map((i) => `- ${i.text.en}`)]));

  for (const job of jobs) {
    block(`Work: ${job.role.en} at ${job.company}`, `/work/#${job.company.toLowerCase()}`, [
      `Dates: ${month(job.start)} – ${job.end ? month(job.end) : "present"} · ${job.location.en}`,
      job.summary.en,
      ...job.highlights.map((h) => `- ${h.en}`),
      `Stack: ${job.stack.join(", ")}`,
      `Links: ${job.links.map((l) => `${l.label.en} ${l.href}`).join(" · ")}`,
    ]);
  }

  for (const p of projects) {
    block(`Project: ${p.name}`, `/projects/#${p.slug}`, [
      `${p.year} · status: ${p.status}`,
      p.tagline.en,
      p.summary.en,
      ...p.highlights.map((h) => `- ${h.en}`),
      `Stack: ${p.stack.join(", ")}`,
      `Links: ${p.links.map((l) => `${l.kind} ${l.href}`).join(" · ")}`,
    ]);
  }

  for (const post of await getBlogPosts()) {
    const s = summarize(post, { full: true });
    const v = s.versions.en ?? s.versions.es!;
    block(`Blog (${s.type}): ${v.title}`, entryHref(s), [
      `Date: ${s.date.slice(0, 10)}${s.event ? ` · event: ${s.event}` : ""}${s.project ? ` · project: ${s.project.name}` : ""}`,
      v.description,
      v.html && strip(v.html),
    ]);
  }

  block("CV (text of the PDF)", "/", [texts.cv]);

  return new Response(`# Paco Molina — everything on pacomolina.dev\n\n${out.join("\n")}`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};

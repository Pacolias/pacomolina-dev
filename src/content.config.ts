import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

// The blog is a "bitácora": one chronological list mixing typed entries.
// Entries are bilingual: one folder per entry, one file per language —
//   src/content/blog/<slug>/en.md
//   src/content/blog/<slug>/es.md
// Both languages are rendered and the active one is shown. If only one file
// exists, both languages fall back to it. Folders starting with "_" are
// ignored.
//
// Types:
// - article   — a long post with its own page (/blog/<slug>/).
// - talk      — a talk; own page, event + slides/video links.
// - linkedin  — a LinkedIn post brought in with a link to the original.
//               Expands inline in the list; set `page: true` once it has
//               grown into its "director's cut" (longer than LinkedIn
//               allowed) to give it its own page too.
// - milestone — a career moment (a defence, a first job…); inline.
// - release   — a project going public (usually with `project:`); inline.
// - til       — "today I learned": a 2–3 sentence note; inline.
const blog = defineCollection({
  loader: glob({ pattern: "[^_]*/{en,es}.md", base: "./src/content/blog" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      date: z.coerce.date(),
      type: z
        .enum(["article", "talk", "linkedin", "milestone", "release", "til"])
        .default("article"),
      // The original LinkedIn post (type: linkedin).
      linkedin: z.url().optional(),
      // Give an inline type its own page too (a LinkedIn "director's cut").
      page: z.boolean().default(false),
      // Slug of a project in src/data/projects.ts: links the entry and the
      // project both ways.
      project: z.string().optional(),
      // Parts of a series share an id; `title` is the series' name in this
      // file's language.
      series: z.object({ id: z.string(), title: z.string(), part: z.number() }).optional(),
      topics: z
        .array(z.enum(["ai", "backend", "frontend", "devops", "maths", "career"]))
        .default([]),
      // Images shown with the entry (a gallery that opens the lightbox).
      // Files live next to the Markdown; `alt` in this file's language.
      images: z.array(z.object({ src: image(), alt: z.string() })).default([]),
      event: z.string().optional(),
      links: z
        .object({
          slides: z.url().optional(),
          video: z.url().optional(),
          repo: z.url().optional(),
        })
        .optional(),
      // Drafts show up in `astro dev` only, never in the production build.
      draft: z.boolean().default(false),
    }),
});

export const collections = { blog };

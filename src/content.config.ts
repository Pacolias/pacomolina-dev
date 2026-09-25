import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

// Blog posts are bilingual: one folder per post, one file per language —
//   src/content/blog/<slug>/en.md
//   src/content/blog/<slug>/es.md
// Both languages are rendered into the page and CSS shows the active one
// (see global.css). If only one file exists, both languages fall back to it.
// Folders starting with "_" are ignored.
const blog = defineCollection({
  loader: glob({ pattern: "[^_]*/{en,es}.md", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    // "talk" for a talk/presentation — shows a badge and the event name.
    type: z.enum(["post", "talk"]).default("post"),
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

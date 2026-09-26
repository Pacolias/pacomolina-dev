---
title: "Example post (template)"
description: "A draft template: only visible in dev mode, never published. Copy this folder to start a new post."
date: 2026-09-25
type: article
draft: true
---

This is a **draft**, so it only shows up while running `astro dev` — the
production build skips it.

![A warm, blurry test image that just says "Foto de prueba"](./prueba-1.webp "Tap any image in a post to open it full-screen.")

## Writing a new post

1. Copy `src/content/blog/example-post/` to `src/content/blog/<your-slug>/`.
   The folder name becomes the URL: `/blog/<your-slug>/`.
2. Write `en.md` and `es.md`. If you only write one, both languages show it
   with a short "only available in…" note.
3. Set `draft: false` when it's ready.

## For a talk

Set `type: talk`, add the `event`, and any `links`:

```yaml
type: talk
event: "PyData Málaga"
links:
  slides: https://example.com/slides.pdf
  video: https://youtube.com/...
  repo: https://github.com/Pacolias/...
```

## Images

Drop them in the post's own folder, next to `en.md`/`es.md`, and reference
them relatively — Astro optimizes them at build time:

```md
![Alt text, describing the image](./photo.webp "Optional caption")
```

The text in quotes becomes a caption under the image (and in the viewer).
Leave it out for an image without one.

Every image in a post opens in the same full-screen viewer, and you can
swipe through all of them in order:

![A tall test image, to check portrait photos](./prueba-2.webp)

![A wide panoramic test image](./prueba-3.webp "The last one — the next arrow wraps back to the first.")

> Quotes, `inline code`, lists and [links](https://pacomolina.dev) are all
> styled to match the rest of the site.

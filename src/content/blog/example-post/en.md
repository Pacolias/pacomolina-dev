---
title: "Example post — how to write one"
description: "A draft template: only visible in dev mode, never published. Copy this folder to start a new post."
date: 2026-09-25
type: post
draft: true
---

This is a **draft**, so it only shows up while running `astro dev` — the
production build skips it.

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

Images go in `public/images/blog/<your-slug>/` and are referenced as
`![alt text](/images/blog/<your-slug>/photo.webp)`.

> Quotes, `inline code`, lists and [links](https://pacomolina.dev) are all
> styled to match the rest of the site.

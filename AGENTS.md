# pacomolina.dev — project notes

Personal portfolio / "link in bio" for Paco Molina, built to be shared via NFC
stickers and QR codes at networking events while job-hunting for his first
role as an AI Engineer. Optimized mobile-first, but must also look good on
desktop. Deployed as a static site on GitHub Pages, eventually behind the
custom domain `pacomolina.dev`.

## Stack

Astro 7 (static output) + React 19 islands + TypeScript (strict) + Tailwind
CSS v4 (CSS-first config, no `tailwind.config.js`) + Vite.

## Design decisions (from the Sep 2026 design pass)

These were chosen explicitly with Paco via `AskUserQuestion` — don't
second-guess them without checking in again:

- **Layout**: hybrid. A simple vertical hero (photo, name, role, tagline, the
  two main CTAs) on top, mobile-first and read top-to-bottom in one glance.
  Below it, a small bento-style grid (`src/components/Portfolio.tsx`) with
  asymmetric card sizes for the project, stack, and contact — gives it more
  "body" than a flat Linktree list without turning into a full bento.me grid.
- **Only RedCheck is featured.** Ariadne was explicitly excluded — Paco
  considers it too early-stage to show off yet. Don't add it back without
  asking; if a second project is added later, it belongs as another card in
  the same grid in `Portfolio.tsx`.
- **Typography**: warm serif + clean sans. `Fraunces` (via `@fontsource`) for
  the name and headings — `font-display` token — and `Inter` for everything
  else — `font-sans`, the default. Only weights 400/500 are imported (nothing
  is set bold anywhere in the design) and only the `latin`/`latin-ext`
  subsets (covers English + Spanish incl. ñ/accents) to keep the font payload
  small on mobile. See `src/styles/global.css`.
- **Palette**: warm/organic, not the typical dark "hacker portfolio". Tailwind
  `stone` for backgrounds/text, `amber` for borders/accents/tags, soft
  `rounded-3xl` cards, very diffused shadows (`shadow-sm shadow-stone-200/50`).
  No custom color tokens were added — stock `stone`/`amber` cover it.
- **Language**: bilingual (EN/ES), no i18n routing — everything lives at one
  URL (important for a single QR/NFC target). Default is English if a
  language must be picked, but on first client load it auto-detects from
  `navigator.language` (Spanish → Spanish), remembers the visitor's explicit
  toggle choice in `localStorage`, and there's a manual toggle pill in the
  hero corner (`LanguageToggle.tsx`). Translated copy lives in
  `src/data/i18n.ts`; non-translated facts (links, email, project URLs) live
  in `src/data/site.ts`. Known trade-off: the statically prerendered HTML is
  always English, so non-English visitors get a near-instant client-side
  swap to Spanish rather than zero flash — acceptable for a static GH Pages
  site with no server-side locale negotiation.
- **Icons for the tech stack**: `lucide-react` has no brand/logo icons at all
  (Python, Docker, FastAPI, React, LangGraph, Spring Boot aren't in it), so
  `@icons-pack/react-simple-icons` is used instead, recolored to a single
  `text-amber-700` via `currentColor` so it still reads as monochrome rather
  than a wall of brand colors. Same reasoning for GitHub. Simple Icons also
  has **no Java logo at all** (trademark reasons, like LinkedIn below) — the
  "Java / Spring Boot" chip uses the Spring Boot icon alone, since Spring
  Boot already implies Java. LinkedIn has no icon in any maintained package
  either (removed from Simple Icons over trademark policy) — the standard
  "in" glyph is hand-inlined in `src/components/icons/LinkedInIcon.tsx`.
- **Tech stack is a curated 6, not a kitchen-sink list.** Deliberately kept
  to: Python/FastAPI, Java/Spring Boot, React/TS, LangGraph, Gemini API,
  Docker/NGINX (`src/data/site.ts`). MySQL and GitHub Actions were cut after
  a review pass — both are real (RedCheck uses them) but generic/expected
  "backend hygiene" signals that don't differentiate an *AI Engineer*
  candidate the way LangGraph + Gemini API do; Docker/NGINX alone already
  covers the "I do infra" signal without repeating it three times. Don't
  re-add them without checking with Paco again — he was on the fence and
  deferred to this reasoning.
- **Animation**: subtle only. Staggered fade-up-on-load via small CSS
  keyframe utilities (`fade-up-1` … `fade-up-6` in `global.css`), respecting
  `prefers-reduced-motion`. No scroll-triggered reveals, no parallax, no
  animation library — kept dependency-free and cheap on mobile.
- **Dark mode**: class-based (`.dark` on `<html>`), not the Tailwind v4
  default media-query-only variant — needed a manual toggle that can
  override the OS preference, so `@custom-variant dark (&:where(.dark, .dark
  *));` is declared in `global.css` instead. Resolution order: an explicit
  choice in `localStorage("theme")` wins, else `prefers-color-scheme`, else
  light. `ThemeProvider.tsx` / `useTheme()` mirror `LanguageProvider.tsx`
  exactly (same architecture, same trade-off: prerendered HTML is always
  light, the inline bootstrap script in `Layout.astro` applies `.dark`
  before first paint client-side so there's no flash, same as the language
  swap). `ThemeToggle.tsx` sits stacked directly under `LanguageToggle.tsx`
  in the hero's top-right corner — sun/moon icon only, no text, showing the
  mode you'd switch *to* (same convention as the language toggle's EN/ES).
  The dark palette isn't a simple invert: warm surfaces
  (`bg-white`/`border-amber-100` cards) become `bg-stone-900`/
  `border-stone-800`; the amber accent shifts from `amber-700` to `amber-400`
  for contrast; the two "filled" primary buttons (LinkedIn, Live demo) flip
  from dark-fill/light-text to light-fill/dark-text rather than going to a
  saturated color, to stay calm rather than turning into a neon accent.
  `theme-color` meta (`id="theme-color-meta"`) is kept in sync with the
  active theme by both the inline script (initial load) and
  `ThemeProvider`'s effect (live toggle), so the mobile browser chrome tints
  correctly either way.

## Content status

All real content is in as of the second pass:

- `src/data/site.ts`: real email, LinkedIn, photo (`public/images/paco.jpg`),
  CV (`public/cv/CV-Paco.pdf`), and RedCheck's landing/app/repo URLs.
- The initials-avatar placeholder is intentionally kept at
  `public/images/paco-placeholder.svg` / `site.photoPlaceholder` — Paco asked
  for it to stay as a fallback option, don't delete it.
- RedCheck's real stack: a **Java/Spring Boot** core API + **MySQL**
  (business logic, auth), a **dedicated Python/FastAPI microservice** that
  handles the AI side (talks to **Google Gemini**) — confirmed directly by
  Paco, not in the GitHub org README, which only mentioned the Java backend
  doing "the prompt engineering bridge with Gemini" — and a
  **React/TypeScript** frontend, all behind NGINX, containerized. The
  RedCheck description in `i18n.ts` reflects all three services now (core
  API, AI microservice, frontend) — if Paco ever gives more detail on this
  architecture (e.g. how the Java and Python services talk to each other),
  update it there. This is unrelated to — and shouldn't be confused with —
  the personal "Tech stack" grid in `StackGrid.tsx`, which represents Paco's
  own general toolkit, not RedCheck's internals specifically (though they
  overlap, which is presumably why he's used Python/FastAPI on RedCheck
  himself).
- RedCheck's card has three CTAs, deliberately reordered from the first
  pass: **Website** (left, secondary/outline style) → the Astro landing
  (`redcheckapp.com`); **Live demo** (right, primary/filled style) → the
  actual React SPA (`my.redcheckapp.com`, where the AI task/priority
  features live — this is the one people should actually play with);
  **Source code** (full width below) → the GitHub org. "Live demo" pointing
  at the real app rather than the marketing site is intentional — don't
  swap them back.
- **Personal GitHub link** (`site.github`) is inferred as
  `https://github.com/Pacolias` from this very repo's own git remote — never
  independently confirmed by Paco in words. Flag it if he ever says
  otherwise.
- **Hero availability line** (`hero.availability` in `i18n.ts`): "Based in
  Málaga, Spain — open to remote, hybrid or on-site AI Engineer roles.
  Available immediately." Facts came directly from Paco; update this (and
  the ES version, and the meta description which repeats the gist) if any
  of those facts change (location, availability, role target).
- **vCard download** (`public/paco-molina.vcf`, "Save contact" button in
  `ContactCard.tsx`): built for the actual NFC/QR-at-events use case — a
  one-tap way for someone to save Paco's contact, more reliable than
  `mailto:` on a device with no mail client configured. Contains name,
  title, email, LinkedIn and GitHub URLs. No phone number (never provided).
- **OG image** (`public/og-image.jpg`, 1200×630): a generated brand card
  (warm gradient, "P" monogram, name, role, location/availability) wired via
  `og:image`/`twitter:image` in `Layout.astro` as an **absolute** URL
  (`new URL(..., Astro.site)`) — OG tags require absolute URLs, relative
  ones are silently ignored by most crawlers. If the SVG source is ever
  needed again to regenerate it, it was rendered locally via
  `magick <svg> -resize 1200x630 -background "#fafaf9" -flatten -strip
  -quality 87 public/og-image.jpg`; the source SVG itself wasn't kept in the
  repo (only the rendered JPG).
- **Analytics: not wired in yet, needs Paco's action.** He picked GoatCounter
  (free, cookie-less, no consent banner). There's a commented `<script>`
  block at the bottom of `Layout.astro`'s `<head>` with instructions — he
  needs to create a free account at goatcounter.com, get his site code, and
  either he or a future session fills it in and uncomments it.

## Technical polish pass (accessibility, SEO, perf)

- Heading order is now a real outline: `h1` (name) → `h2` (RedCheck title,
  "Tech stack", "Let's talk") — it used to skip straight to `h3` everywhere,
  fixed across `RedCheckCard.tsx`, `StackGrid.tsx`, `ContactCard.tsx`.
- Every interactive `<a>`/`<button>` has an explicit
  `focus-visible:ring-2 focus-visible:ring-amber-500` state now — there was
  no visible keyboard focus indicator anywhere before this pass.
- `public/images/paco.jpg` was resized/recompressed from a 178KB
  899×981 source down to a 400×400, ~37KB JPEG — it's only ever displayed at
  up to 128px, so the original was ~5x heavier than needed even for retina.
  If Paco ever swaps in a new photo, re-run something like:
  `magick <source> -resize 400x400^ -gravity center -extent 400x400 -strip
  -quality 82 public/images/paco.jpg`.
- Added `public/robots.txt` (allow-all, no sitemap — one page doesn't need
  one), `public/manifest.webmanifest` (so saving the page to an Android home
  screen from the NFC/QR flow gets a proper name/icon/theme color), a
  `<link rel="canonical">`, a `theme-color` meta tag, and a JSON-LD `Person`
  block (name/jobTitle/sameAs LinkedIn+GitHub) in `Layout.astro` for
  richer search/share results.
- **`manifest.webmanifest` has hardcoded `/pacomolina-dev/` paths** (it's a
  static file in `public/`, can't read `import.meta.env.BASE_URL` the way
  `.astro`/`.ts` files can) — when the custom domain migration below
  happens, this file needs `start_url`, `scope`, and the two icon `src`
  values updated too, not just `astro.config.mjs`.

## GitHub Pages / custom domain

Repo is `Pacolias/pacomolina-dev` (not a `*.github.io` user-page repo), so it
deploys as a **project page**. `astro.config.mjs` is currently set for that:

```js
site: 'https://pacolias.github.io',
base: '/pacomolina-dev',
```

When the `pacomolina.dev` domain is bought and DNS is pointed at GitHub
Pages, this needs to change together, in one deploy:

1. Add a `public/CNAME` file containing `pacomolina.dev`.
2. Change `base` to `/` and `site` to `https://pacomolina.dev` in
   `astro.config.mjs`.

All internal asset paths (`site.ts`, `Layout.astro`) already read
`import.meta.env.BASE_URL` rather than hardcoding `/pacomolina-dev/`, so
that's the only place this needs to change.

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and
`astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)

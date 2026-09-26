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

- **Home layout** (`src/components/pages/HomePage.tsx`, redone Sep 25 2026 —
  the original centered hero + bento grid read as a different site once
  the inner pages became minimal lists; Paco picked this over polishing the
  old one): left-aligned like every other page. Photo beside name + role;
  one line "Mathematician and Computer Scientist." (ES "Matemático e
  Ingeniero Informático." — in English he wants "Computer Scientist", not
  "Computer Engineer", since the degree is Computer Science) — Paco explicitly did
  **not** want a narrative sentence there ("building → RedCheck, before →
  Quimify"); a one-line green availability pill; LinkedIn + CV; a
  "Featured project" card; "See all projects →"; the stack as a row of
  small chips (`StackRow.tsx`); then the shared "Let's talk" footer.
- **Only RedCheck is featured on Home**, on purpose (Paco preferred it to a
  list of three): one clear thing to try for someone who just scanned the
  NFC/QR. Its card is light, not the old big one — the landing-hero
  screenshot (theme/language-aware, opens the lightbox), name, status, the
  one-line blurb, and three small links in one row: **Live demo** (filled,
  first), Website, and the GitHub mark alone (text only for screen readers
  / tooltip) so they fit the narrow column. Stacked on phones, image | text
  in two equal columns from `sm` up. Ariadne was explicitly excluded — Paco
  considers it too early-stage to show off yet. Don't add it back without
  asking.
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
  nav (`LanguageToggle.tsx`). Translated copy lives in
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
  swap). `ThemeToggle.tsx` sits next to `LanguageToggle.tsx` at the right
  of the top nav — sun/moon icon only, no text, showing the
  mode you'd switch *to* (same convention as the language toggle's EN/ES).
  Both providers keep a `detected` flag and don't touch `<html>` until the
  detected value is in state: syncing React's initial "light"/"en"
  placeholder used to strip the `.dark` class the inline script had set,
  which flashed the page light — white, in dark mode — on every load.
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

## Multi-page structure (Sep 25 2026 pass)

The site grew from one page into five, keeping the same look everywhere:
`/` (home, unchanged content), `/projects/`, `/work/`, `/blog/` (+
`/blog/<slug>/`), `/about/`. Choices made with Paco via `AskUserQuestion`:

- **Navigation**: a sticky top text nav (`SiteNav.tsx`) — Home · Projects ·
  Work · Blog · About, active item marked with a small amber dot — with the
  language/theme toggles moved from the hero corner to the right of the nav.
  Sized to fit on one line down to 360px wide in both languages (ES labels
  are longer; the text drops to 12px under 380px). Single-letter keyboard
  shortcuts h/p/w/b/a (desktop nicety, ignored with modifiers or in inputs).
- **Architecture**: each page is **one** React island (`*App` components in
  `src/components/pages/`) rooted in `SiteShell.tsx` (providers + nav +
  `ContactCard` as a closing footer), so everything on a page shares the
  same language/theme state. Page `<title>`/description are passed to
  `Layout.astro` (English, the prerendered language); canonical URL is
  per-path now.
- **No EN→ES flash on navigation**: with multiple pages the old "brief
  English flash for Spanish visitors" happened on every click, so the
  inline script now sets `data-lang-pending` on `<html>` when the language
  isn't English (body stays `opacity: 0`), and `LanguageProvider` removes it
  (and fires a `lang-ready` event) once the detected language has rendered.
  1.5s timeout fallback so a JS failure never leaves the page blank.
- **Page-to-page transitions: a cross-fade, never a flash** (Paco reported
  a white flash between pages on his phone). Pieces, all verified by
  recording navigations frame by frame (CDP screencast, 4× CPU throttle):
  (1) native cross-document View Transitions — the `@view-transition {
  navigation: auto }` opt-in is an **inline `<style>` first in
  `Layout.astro`'s `<head>`**: in the bundled CSS (which lands at the end
  of `<head>`) Chrome skipped the transition on about half of slower
  navigations; inline it held 24/24. Fade timing (0.25s) is in
  `global.css`; the nav has `view-transition-name: site-nav` so it stays
  put. (2) For non-English visitors the new page is still hidden while
  React translates it, so a `pagereveal` handler (inline script in
  `Layout.astro`) pauses the transition's animations on the old page's
  frame and resumes them on `lang-ready` (1s cap). A `<script
  blocking="render">` with a top-level await was tried first and does
  **not** work — Chrome unblocks rendering when the script starts, not
  when its await finishes. (3) The fade-up intro only plays on the first
  page of a visit (`no-intro` class via sessionStorage), otherwise every
  page began invisible. (4) `<html>` gets the page background colour, so
  anything hidden shows the site's background, never browser white.
  Browsers without cross-document view transitions (Firefox for now) just
  navigate normally, without the white frame.
- **Swipe between sections** (`useSwipeNavigation.ts`, used by
  `SiteShell`): a horizontal swipe goes to the previous/next section in nav
  order, **not circular** (Paco: swiping right on Home must not jump to
  About; nothing after About either — at the ends the page gives a little
  and springs back). **Interactive** (Paco asked to see the next page while
  dragging): the page content follows the finger and the *real* neighbour
  page component (lazy-loaded on idle, rendered in the visitor's language
  and theme inside a fixed, inert, aria-hidden `.swipe-preview` layer under
  the nav) slides in beside it. Released past ~28% of the width or
  flicked → it finishes the slide and navigates; otherwise it springs back.
  The blog index preview reads post summaries from a JSON `<script
  id="blog-index">` that `Layout.astro` embeds on every page.
  It claims the gesture (non-passive `touchmove` + `preventDefault`) only
  once it's clearly horizontal: the first version listened passively and
  only measured at the end, and on Paco's real phone it didn't work on Work
  and Blog (short pages) — the browser could take over the touch and
  cancel it. It ignores gestures starting in anything that already scrolls
  horizontally (a gallery strip), an open `<dialog>` (the lightbox), form
  fields, the outer 24px (OS "back" edge gestures), multi-touch and
  pinch-zoomed pages, and vertical drags. The content wrapper is
  `overflow-x: clip`ped so the slide never creates horizontal scroll; a
  bfcache restore (`pageshow` persisted) resets it. After a committed
  swipe, the next page's view transition gets a `swipe-commit` type
  (sessionStorage `swipe-nav` → `pagereveal`) and just settles from the
  preview into the real page with a 0.12s fade (inline rule in
  `Layout.astro`). Verified with real CDP touch events: 20 cases incl. both
  non-circular ends, Work↔Blog↔About, mid-drag previews, spring-back, the
  gallery strip and the lightbox.
- **Structured bilingual content** lives in TS data files, each entry with
  `{ en, es }` fields (`Localized` type in `i18n.ts`): `src/data/projects.ts`,
  `src/data/work.ts`, `src/data/about.ts`. UI strings stay in `i18n.ts`
  (`nav`, `pages.*`). `Dictionary` is the EN shape with literals widened, so
  a key missing in ES is a type error.
- **Projects and Work are compact lists, not big cards** (Paco: the cards
  took too much screen; he wanted it readable "de un golpe de vista", like
  psudokit.live, same content, same style). One card per page holding
  `ExpandableRow`s: collapsed = one glance (Projects: name, year · status,
  a short `blurb`; Work: logo, company, role, dates — right-aligned on
  `sm+`, under the role on phones); "+" opens everything else (gallery,
  the longer `tagline` in amber, summary, highlights, stack, links).
  He picked the plain list with no thumbnails. Rows are deliberately small
  (14px title, 12px blurb/role, 11px status, no year — it moved inside the
  panel) and **every blurb/role must fit on one line at 360px in both
  languages** (he pointed out wrapped two-line blurbs as the thing to
  avoid): keep blurbs ≲35 characters. The Work logo is 36px and the row
  gap 10px on phones because "Fundador y AI/Software Engineer" needed
  exactly that at 360px. `featured` now means
  "visible row"; the rest sit behind "Show all projects (n)". Order chosen
  by Paco: RedCheck, krylov-solvers, spotify-mcp, ShellMate, Camper Agent
  Orchestrator, Astro Landing Boilerplate — the first four visible, the
  last two behind "show all". Ariadne still excluded.
  Screenshots are ~1280px WebP in `public/images/projects/` (see the
  theme/language variants below).
- **Screenshots follow the visitor's theme and language** (Paco's request:
  keep the page's "sintonía"). A gallery image's `src` can be one file, one
  per language, one per theme, or one per theme × language (`ImageSource` in
  `Gallery.tsx`; helpers `themed()` / `themedLocalized()` in `projects.ts`,
  naming `<name>-{light,dark}[-{en,es}].webp`). Variant images only get their
  `src` after hydration (a same-aspect-ratio box holds the space until then)
  — putting the English/light prerender `src` in the HTML made every other
  visitor download a variant they never see. Verified: each combination
  downloads only its own files, and live toggles swap them. Current state:
  RedCheck = 4 shots × 4 variants — the landing hero, SmartCheck AI's
  daily plan (a live Gemini call on prod, ~20s each), the month dashboard
  and Focus Mode — all at 1280×900 (at 800px tall the landing's fixed nav
  covers its headline), captured by `scripts/screenshots/redcheck.mjs`
  (the app reads `language`, the landing `lang` but prefers the browser
  language, so the script clicks its toggle); krylov-solvers = 5 plots × 4
  variants re-rendered from the repo's own solvers/matrices
  (`scripts/screenshots/krylov-plots.py`; recomputed, so a couple of
  iteration counts/timings differ slightly from the repo's PNGs); Astro
  boilerplate = light/dark only (the site is English-only); ShellMate = the
  README's two screenshots as-is (the app only has a Spanish UI and a dark
  theme, so no other variants exist).
- **Expandable panels** (list rows, "Show all projects") use `Collapsible.tsx`: animates `grid-template-rows`
  0fr↔1fr so opening *and* closing are smooth (the first version toggled
  `hidden`, so closing snapped shut). Closed content is `inert`. Its
  `overflow: hidden` wrapper takes a `bleed` prop so a Gallery strip can
  still scroll edge-to-edge of the card.
- **Work**: RedCheck + Quimify from the CV, each with a "Links" block of
  checkable links and an optional `photos` gallery (empty — waiting on
  Paco's photos). Logos in `public/images/work/` are the companies' own
  favicons.
- **About**: short first-person intro + a chronological timeline (oldest →
  "Now") mixing education, work, projects and milestones, + languages. The
  intro's first paragraph was drafted from CV facts and **needs Paco's
  review** — it's the one place with his "voice" that he didn't write. The
  second paragraph is deliberately a single plain sentence ("I love building
  software that solves real problems and meets real needs") — Paco
  rejected a longer drafted one listing RAG/agents/MCP and said he'll write
  that part properly himself; don't expand it for him. The languages list
  lives in `about.ts` (not `i18n.ts`) so an entry can carry an `href`: the
  English C1 card links to Paco's British Council credential (URL given by
  him; its `#acc.…` share-tracking fragment was dropped, the `key` param is
  what grants access).
- **Blog = "bitácora"** (design chosen by Paco, Sep 26 2026 — see the
  memory note too): one chronological list of typed entries, same compact
  `ExpandableRow` style as Projects/Work, a type icon per row, and type
  filter chips on top (only when there's more than one type). Content
  collection (`src/content.config.ts`), one folder per entry with
  `{en,es}.md` (both rendered, the active one shown; one file = both
  languages fall back to it). Types:
  - `article`: its own page, with reading time.
  - `talk`: its own page, with `event` + slides/video/repo links.
  - `linkedin`: a LinkedIn post brought in — text faithful, hashtags →
    `topics`, bilingual. It **expands inline** and has a "View on
    LinkedIn ↗" link (`linkedin:` URL). `page: true` gives it its own page
    once it grows into its "director's cut".
  - `milestone` and `til`: inline too.

  Other frontmatter:
  - `project` (a projects.ts slug; the build fails on an unknown one): the
    entry shows "Project: X →" linking to `/projects/#slug`, which opens
    that row; the project's panel lists "Written about this" entries.
  - `series {id,title,part}`: navigation between parts.
  - `topics`: chips.
  - `images [{src, alt}]`: a gallery with the lightbox. Put images in
    frontmatter rather than the Markdown body for inline entries: the list
    renders `entry.rendered.html`, where body images wouldn't be processed.

  Deep links: rows have `anchor` ids, and arriving at `#slug` opens and
  scrolls to the row (`/blog/#slug`, `/projects/#slug`).

  `data/blog.ts` builds summaries: full ones (HTML + images) only for
  `/blog/`, light ones embedded on every page as `<script id="blog-index">`
  (read via `data/blogIndex.ts`) for the swipe preview, series nav and
  project ↔ entry links.

  Only entries with a page get routes and sitemap entries; RSS links inline
  entries to `/blog/#slug`. `draft: true` entries show only in `astro dev`;
  `example-post/` is a draft article that doubles as the writing template.

  **Row titles must fit one line at 360px in both languages**, like the
  other lists (≈25 chars). The meta line is date · reading time/event; the
  type is carried by the icon (plus an sr-only label).

  Prose styling via `@tailwindcss/typography`.
- **Lightbox** (`Lightbox.tsx`, used by `Gallery.tsx`, so it covers every
  project/work image): tapping a photo opens it in-page over a blurred
  page (native `<dialog>` + `showModal()` → top layer, focus trap, Esc;
  blur/scrim on `::backdrop`), with a counter, caption (the alt text) and
  wrap-around navigation via arrow keys, buttons or a horizontal swipe.
  Arrows sit at the image's sides on `sm+`, and next to the dots at the
  bottom on phones so they don't cover the image. Page scroll is locked
  while open. The `<a href>` to the file is kept as the no-JS / new-tab
  fallback. Blog post images use it too: they live in the post's own folder
  (`![alt](./x.webp "caption")`, optimized by Astro), and
  `usePostImageViewer` in `BlogPages.tsx` wires click/Enter on the static
  Astro-rendered `<img>`s via event delegation. It steps through the images of
  the active language block only.
- **Post image captions**: `![alt](./x.webp "Caption")` on its own line
  becomes `<figure><img><figcaption>Caption</figcaption></figure>` (shown
  under the image and in the lightbox). Astro 7's default Markdown
  processor is **Sätteri**, not remark/rehype — `markdown.rehypePlugins`
  errors unless `@astrojs/markdown-remark` is installed. So the plugin is a
  Sätteri hast plugin (`src/plugins/figure-captions.mjs`, `{ name, element:
  { filter, visit(node, ctx) } }` + `ctx.replaceNode`) registered via
  `markdown.processor: satteri({ hastPlugins: [...] })` in
  `astro.config.mjs`. `@astrojs/markdown-satteri` is a direct dependency,
  pinned to the version Astro itself ships (0.4.1), so it's deduped — bump
  it together with Astro. User hast plugins run before Astro's image
  plugin, so the `<img>` still gets optimized. Changing Markdown config
  needs a dev server restart, and sometimes clearing the content cache
  (`node_modules/.astro`).
  Caveat: a draft post's images still get emitted to `dist/_astro/` (hashed
  names, unreferenced) even though the page isn't built. Testing note: Playwright's `clip`/beyond-viewport
  screenshots render `backdrop-filter` wrong (sharp strips) — capture
  with CDP `Page.captureScreenshot` (`captureBeyondViewport: false`) to
  see what a real browser shows.
- Also fixed two pre-existing home layout bugs seen at desktop width: the
  hero CTAs wrapped onto two lines (`max-w-sm` also applied on `sm+`), and
  the stack chips wrapped ("Python / / FastAPI") — the bento grid is now
  3/2 of 5 columns instead of 2/1 of 3.

**Workflow**: Paco wants every change reviewed on localhost at mobile and
desktop widths before anything is committed or pushed.

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
  the personal "Tech stack" row in `StackRow.tsx`, which represents Paco's
  own general toolkit, not RedCheck's internals specifically (though they
  overlap, which is presumably why he's used Python/FastAPI on RedCheck
  himself).
- RedCheck's three links: **Live demo** (primary/filled style) → the
  actual React SPA (`my.redcheckapp.com`, where the AI task/priority
  features live — this is the one people should actually play with);
  **Website** (soft amber) → the Astro landing (`redcheckapp.com`);
  **Source code** → the GitHub org. "Live demo" pointing at the real app
  rather than the marketing site is intentional — don't swap them back.
- **Personal GitHub link** (`site.github`) is inferred as
  `https://github.com/Pacolias` from this very repo's own git remote — never
  independently confirmed by Paco in words. Flag it if he ever says
  otherwise.
- **Availability pill** (`hero.availability` in `i18n.ts`): "Available now ·
  Málaga · remote, hybrid or on-site" / "Disponible ya · Málaga · remoto,
  híbrido, presencial". Facts came directly from Paco; update both (and
  the meta description, which repeats the gist) if they change. The
  wording is squeezed to fit one line at 360px (11px text) — measure
  before making it longer.
- **vCard download** (`public/paco-molina.vcf`, "Save contact" button in
  `ContactCard.tsx`): built for the actual NFC/QR-at-events use case — a
  one-tap way for someone to save Paco's contact, more reliable than
  `mailto:` on a device with no mail client configured. Contains name,
  title, email, LinkedIn and GitHub URLs. No phone number (never provided).
- **Social preview (OG) images**, 1200×630, one per section:
  `public/og-image.jpg` (home, also the JSON-LD Person image) and
  `public/og/{projects,work,about,blog}.jpg` (blog posts use the blog
  card). Pages pass `ogImage` to `Layout.astro`, which emits it as an
  **absolute** URL (`new URL(..., Astro.site)`) for `og:image` /
  `twitter:image` — relative ones are silently ignored by most crawlers.
  Rendered by `scripts/og/render.mjs` (Playwright + the site's own
  Fraunces/Inter, inlined as data: URLs — loaded from file:// they
  silently fell back to Times/Arial; the script now throws if the fonts
  didn't load). English text, since crawlers see the English prerender.
  Re-run it if a card's text changes (job title, project names…).
- **Blog feed + structured data**: `src/pages/rss.xml.ts` (hand-written,
  published posts only, English version or Spanish fallback), advertised
  via `<link rel="alternate">` in every page's `<head>`; each post also
  gets a `BlogPosting` JSON-LD block (`Event` for talks) through
  `Layout`'s `jsonLd` prop.
- **Analytics: wired, switched off until Paco creates the account.** He
  picked GoatCounter (free, cookie-less, no consent banner). Set
  `site.goatcounter` in `site.ts` to the account's code (the `xxx` of
  `xxx.goatcounter.com`) and `Layout.astro` adds the script — production
  builds only, so local visits never count. To see which channel works at
  events, the NFC sticker should point at `https://pacomolina.dev/?ref=nfc`
  and printed QRs at `?ref=qr`: GoatCounter records `ref` as the source.
- **On-screen QR** (the QR icon in the "Let's talk" card, on every page):
  for someone without NFC, Paco opens it on his phone and they scan it.
  It's a static pre-generated SVG (`public/images/qr-pacomolina.svg`, dark
  modules on white with a quiet zone so it scans in both themes) for
  `https://pacomolina.dev/?ref=qr`, shown in the shared `Lightbox`. Verified
  by decoding it (jsQR) from a screenshot of the open viewer, on a phone
  in dark mode and on desktop. If the URL changes, regenerate with the
  `qrcode` npm package (`errorCorrectionLevel: 'M'`, `margin: 4`) and
  re-check it scans.

## Technical polish pass (accessibility, SEO, perf)

- Heading order is now a real outline: `h1` (name) → `h2` (RedCheck title,
  "Tech stack", "Let's talk") — it used to skip straight to `h3` everywhere,
  fixed across `RedCheckCard.tsx`, `StackGrid.tsx` (both since replaced by
  the new Home), `ContactCard.tsx`.
- Every interactive `<a>`/`<button>` has an explicit
  `focus-visible:ring-2 focus-visible:ring-amber-500` state now — there was
  no visible keyboard focus indicator anywhere before this pass.
- `public/images/paco.jpg` was resized/recompressed from a 178KB
  899×981 source down to a 400×400, ~37KB JPEG — it's only ever displayed at
  up to 128px, so the original was ~5x heavier than needed even for retina.
  If Paco ever swaps in a new photo, re-run something like:
  `magick <source> -resize 400x400^ -gravity center -extent 400x400 -strip
  -quality 82 public/images/paco.jpg`.
- Added `public/robots.txt` (allow-all, pointing at the sitemap),
  `public/manifest.webmanifest` (so saving the page to an Android home
  screen from the NFC/QR flow gets a proper name/icon/theme color), a
  `<link rel="canonical">`, a `theme-color` meta tag, and a JSON-LD `Person`
  block (name/jobTitle/sameAs LinkedIn+GitHub) in `Layout.astro` for
  richer search/share results.
- `manifest.webmanifest` is a static file (it can't read
  `import.meta.env.BASE_URL`), so its paths and its `name` (which repeats
  the job title) have to be kept in sync by hand — it still said "Junior
  AI & Backend Engineer" until Sep 2026.
- **Sitemap**: `src/pages/sitemap.xml.ts`, a small hand-written endpoint
  (sections from `site.ts` + published blog posts via `getBlogPosts`, so
  drafts never appear) — no `@astrojs/sitemap` dependency.
  `public/robots.txt` points at it with an absolute URL.
- **404**: `src/pages/404.astro` → `dist/404.html`, which GitHub Pages
  serves for any unknown URL. Same shell as every page (nav with nothing
  active: `SiteShell`/`SiteNav` take `current: null`), "Back to home" +
  links to each section; `Layout`'s `noindex` prop adds `robots: noindex`
  and drops the canonical link. Note: in `astro dev`, a brand-new island
  can fail to hydrate once with "504 Outdated Optimize Dep" (Vite
  re-optimizing) — a dev-server artifact; check against `astro build` +
  `astro preview` before assuming a bug.

## GitHub Pages / custom domain

Repo is `Pacolias/pacomolina-dev` (a project-page repo, not
`*.github.io`), deployed by `.github/workflows/deploy.yml` on every push to
`main`, and served at the custom domain **`pacomolina.dev`** (live since
Sep 2026): `public/CNAME` contains `pacomolina.dev`, and
`astro.config.mjs` has

```js
site: 'https://pacomolina.dev',
base: '/',
```

Internal asset paths (`site.ts`, `Layout.astro`) read
`import.meta.env.BASE_URL` rather than hardcoding a prefix; the static
files in `public/` (`manifest.webmanifest`, `robots.txt`) can't, so they
use root paths / the absolute domain directly.

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

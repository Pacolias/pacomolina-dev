# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Personal portfolio / "link in bio" for Paco Molina, live at
`https://pacomolina.dev` (GitHub Pages, repo `Pacolias/pacomolina-dev`,
public). It's shared via NFC stickers (`/?ref=nfc`) and QR codes (`/?ref=qr`)
at networking events while he looks for his first AI Engineer role, so it's
**mobile-first** and everything has to work at **360px wide in both English
and Spanish**, and also look good on desktop.

**`docs/decisions.md` has the full reasoning, history and verification
notes** for every feature and design choice. Read the relevant section before
changing a feature. Most choices were made with Paco explicitly: don't
reverse one without asking him first.

## Workflow

- Review every change on localhost at mobile **and** desktop widths before
  committing.
- Claude may commit and push to `main` (a push deploys to production).
  Commit messages are **in English**. **Never add any Claude/AI attribution**:
  no `Co-Authored-By` trailer and no "Generated with Claude" lines in commits
  or PRs (`.claude/settings.json` already turns off attribution).
- Any visible change needs new visual baselines in the same commit (see
  "Quality gate"), or the deploy is blocked.

## Commands

```bash
astro dev --background          # dev server (manage: astro dev stop|status|logs)
npx astro build                 # static build → dist/
npx astro preview               # serve dist/ on :4321
npx astro sync && npx tsc --noEmit   # strict type-check (what CI runs)
```

There's no unit-test framework. The checks are scripts run against a build
(the same ones as the CI gate):

```bash
node scripts/ci/check-links.mjs      # internal hrefs/src/#fragments resolve in dist/
node scripts/ci/check-budget.mjs     # gzip budgets: JS ≤80KB, CSS ≤25KB, HTML ≤70KB/page, image ≤450KB
node scripts/ci/check-documents.mjs  # PDFs match their pre-rendered pages
# browser check (axe, console errors, horizontal overflow) at 360/390/1440px:
npm install --no-save playwright @axe-core/playwright
npx astro build && npx astro preview &
node scripts/ci/check-pages.mjs http://localhost:4321
# visual regression, inside the Playwright container (podman/docker):
scripts/ci/visual.sh            # compare with tests/visual/*.png
scripts/ci/visual.sh update     # accept the current look
```

Asset generators (re-run when their inputs change):

- `node scripts/docs/render.mjs`: after replacing `public/cv/CV-Paco.pdf`.
  It writes the page images, `src/data/documents.json` and the CV text the
  assistant uses.
- `npm install --no-save playwright && node scripts/diagrams/render.mjs`:
  after adding or editing a ```` ```mermaid ```` block in a post. Stop
  `astro dev` first, because it changes `node_modules`. An edited block
  without its SVG fails the build.
- `node scripts/og/render.mjs`: if a section's social card text changes. Blog
  post cards are generated at build time automatically.
- `scripts/screenshots/redcheck.mjs`, `scripts/screenshots/krylov-plots.py`:
  project screenshots in every theme × language variant.

Assistant Worker (`worker/`, its own package):

```bash
cd worker
npm run dev          # wrangler on :8787, reads knowledge from the astro dev server; needs worker/.dev.vars with GEMINI_API_KEY
npm run typecheck
npm run deploy       # needs `npx wrangler login` + `npx wrangler secret put GEMINI_API_KEY`
npm run questions    # last 50 logged visitor questions (D1)
node ../scripts/ci/eval-assistant.mjs <worker url>   # 20 eval cases; spends Gemini quota, run by hand
```

## Dev-server pitfalls

- **After installing or removing packages, restart dev**: `astro dev stop`,
  `rm -rf node_modules/.vite`, then `astro dev --background --force`. Stale
  pre-bundled deps stop every island from hydrating (rows don't open, images
  have no `src`), while the production build works fine.
- `astro build` has its own Vite cache (`node_modules/.vite-build`), so
  building doesn't break a running dev server.
- Markdown config changes need a dev restart and sometimes clearing
  `node_modules/.astro` (plus `.astro/data-store.json` after a failed
  diagram render).
- "504 Outdated Optimize Dep" on a new island is a dev-only artifact. Check
  with `astro build` + `astro preview` before treating it as a bug.

## Architecture

**Stack**: Astro 7 (static output) + Preact islands (`@astrojs/preact`,
`compat: true`) + strict TypeScript + Tailwind CSS v4 (CSS-first, configured
in `src/styles/global.css`, no `tailwind.config.js`). Components are written
against the React API (hooks, `lucide-react`, `@icons-pack/react-simple-icons`)
but run on Preact. There's no `react` dependency; `@types/react` is kept only
for typing. The icon packages must stay in
`vite.environments.{ssr,prerender}.resolve.noExternal` in
`astro.config.mjs`. Otherwise prerendering imports the real React and fails
with "[object Object] is not a valid HTML tag name".

**One island per page.** Each route in `src/pages/[...lang]/` renders a
single `*App` component from `src/components/pages/`. Each one is wrapped in
`SiteShell.tsx`, which holds the providers (`LanguageProvider`,
`ThemeProvider`, `DocumentViewerProvider`), `SiteNav`, the `<main>`,
`CommandPalette`, swipe navigation and the `ContactCard` footer. So the
whole page shares one language/theme state. `src/layouts/Layout.astro` owns
the `<head>`: meta/OG/hreflang/JSON-LD, the inline bootstrap scripts, the
`#blog-index` JSON and the service-worker registration.

**Bilingual at one URL, plus indexable `/es/` copies.** Every page is built
twice by `getStaticPaths = localePaths` (`src/data/locale.ts`): `/x/` (English
prerender) and `/es/x/` (Spanish prerender). On the bare URLs, an inline
script in `Layout.astro` picks the language before first paint, in this
order: `?lang=` > stored toggle choice > arrived via an `/es/` page
(sessionStorage) > `navigator.language`. It sets `data-lang-pending` to hide
the body until `LanguageProvider` has rendered the right language and fired
`lang-ready` (1.5s fallback). Theme works the same way (`.dark` class on
`<html>`, `@custom-variant dark` in `global.css`). Both providers keep a
`detected` flag and must not touch `<html>` until the detected value is in
state, or the page flashes light. Internal links stay unprefixed.

**Content lives in TS data files**, not in components:

- `src/data/i18n.ts`: UI strings (`Dictionary`, the EN shape, so a key
  missing in ES is a type error) and the `Localized` `{ en, es }` type.
- `src/data/site.ts`: non-translated facts (links, email, project URLs,
  `assistantUrl`, `goatcounter`).
- `projects.ts`, `work.ts`, `about.ts`, `now.ts`: structured bilingual
  entries.
- Blog: a content collection (`src/content.config.ts`,
  `src/content/blog/<slug>/{en,es}.md`) of typed entries (`article`, `talk`
  get their own pages; `linkedin`, `milestone`, `til` expand inline).
  `src/data/blog.ts` builds the summaries; a light index is embedded on every
  page and read through `data/blogIndex.ts` (swipe preview, palette, project
  ↔ entry links). A `project:` slug that doesn't exist fails the build.
  `draft: true` shows only in dev; `example-post/` is the writing template.

**Markdown runs through Sätteri**, Astro 7's default processor, not
remark/rehype. Custom plugins are Sätteri hast plugins in `src/plugins/`
(figure captions, Mermaid → pre-rendered SVGs from `src/diagrams/`),
registered via `markdown.processor: satteri({ hastPlugins })`.
`@astrojs/markdown-satteri` and `satteri` are pinned to the versions Astro
ships: bump them together with Astro.

**Build-time-only pieces** (nothing reaches the browser): per-post OG cards
(`src/pages/og/blog/[lang]/[slug].jpg.ts`, `satori` + `sharp`), last-push
dates from the GitHub API (`src/data/github.ts`; a failure only hides that
line), `sitemap.xml.ts`, `rss.xml.ts`, and `assistant/knowledge.txt.ts`. The
service worker (`src/integrations/service-worker.mjs`, written to
`dist/sw.js` at `astro:build:done`) precaches pages, `_astro` assets and
fonts.

**"Ask about Paco" assistant**: `AssistantChat.tsx`, lazy-loaded in the
command palette, streams from the Cloudflare Worker in `worker/`, which
proxies Gemini. The Worker fetches `/assistant/knowledge.txt` (built from
the same data files, the blog and the CV text), so deploying the site
updates what it knows. There's no RAG. The rules are in
`worker/src/prompt.ts`: answer in the third person, use only facts from the
content, and cite as `[[/path|label]]` using the knowledge blocks' `Source:`
paths. **Never link the CS thesis to RedCheck.** Questions are logged to D1
with nothing identifying and deleted after 90 days. A weekly digest goes to
the **private** repo `Pacolias/pacomolina-assistant-log`, never to this
public repo.

## Rules that are easy to break

- **Everything fits on one line at 360px in both languages**: nav labels,
  list-row blurbs/roles (≲35 chars), blog row titles (≈25 chars), the
  availability pill. Measure the Spanish text, which is longer.
- Design language: Tailwind `stone` + `amber` only (no custom colour tokens),
  `rounded-3xl` cards, very soft shadows, Fraunces (`font-display`) for
  headings and Inter for everything else. Only weights 400/500, imported from
  the per-weight fontsource files (`inter/400.css`), which carry
  `unicode-range`. Subtle CSS-only animation that respects
  `prefers-reduced-motion`.
- Dark mode isn't an inversion: cards become `bg-stone-900`, the accent
  shifts `amber-700` → `amber-400`, and filled buttons flip to light fill.
- Landmarks: one nav `banner`, one `<main>` (rendered by `SiteShell`), the
  contact card as `<footer>`. Pages use plain `<div>`s, never their own
  `<main>`/`<header>`. Every interactive element needs
  `focus-visible:ring-2 focus-visible:ring-amber-500`.
- Theme/language-variant images get their `src` only after hydration (so
  nobody downloads a variant they won't see). Gallery `src` can be
  `themed()` / `themedLocalized()` (`<name>-{light,dark}[-{en,es}].webp`).
- Content that's off-limits or curated (details in `docs/decisions.md`):
  Ariadne stays out everywhere. Only RedCheck is featured on Home. The stack
  row is a curated six. Don't expand the About intro's second sentence.
  `/now` holds only facts Paco has given.
- Privacy: the published C1 certificate is a rasterised copy with the DNI
  painted over. **Never commit the original.** Visitor logs go only to the
  private digest repo.
- `public/manifest.webmanifest` and `public/robots.txt` can't read
  `BASE_URL`: keep them in sync by hand. Everything else uses
  `import.meta.env.BASE_URL`.
- OG image URLs must be absolute (`new URL(…, Astro.site)`).

## Quality gate (CI)

`.github/workflows/deploy.yml` runs on every push to `main` and on Mondays at
05:00 UTC (to refresh GitHub-push dates). `deploy` needs both of these jobs:

- `check`: type-check, links, budgets, documents, and `check-pages.mjs`
  (axe WCAG 2.1 A/AA + best practices, no console errors, no horizontal
  overflow at 360px ES light / 390px EN dark / 1440px EN light and ES dark).
- `visual`: `check-visual.mjs`, full-page screenshots at 360px ES light and
  1440px EN dark, compared with `tests/visual/` (fails past 0.05% of pixels
  changed). It runs in `mcr.microsoft.com/playwright:v1.63.0-noble`. Bump
  that version in `visual.sh` and `deploy.yml` together and regenerate every
  baseline. It builds with `GITHUB_ACTIVITY=off`.

`links.yml` checks external links weekly and opens or closes a
`broken-links` issue. It's not part of the deploy gate. `assistant-evals.yml`
runs the assistant evals by hand.

## Pending content (waiting on Paco)

- The first paragraph of the About intro was drafted from the CV and
  needs his review.
- The Work entries' `photos` galleries are empty, waiting on his photos.
- How RedCheck's Java/Spring core API and its Python/FastAPI AI
  microservice talk to each other. When he explains it, update the
  RedCheck copy in `i18n.ts`.

Astro docs: https://docs.astro.build

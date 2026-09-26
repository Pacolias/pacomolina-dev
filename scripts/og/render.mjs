// Renders the social-preview (Open Graph) cards, one per section, with the
// site's own fonts (Fraunces + Inter from node_modules) and palette:
//
//   npx -p playwright node scripts/og/render.mjs
//
// Writes public/og-image.jpg (home) and public/og/<section>.jpg, 1200×630.
// English only: it's what crawlers see (the prerendered language).
import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(fileURLToPath(import.meta.url), "../../..");
// Inlined as data: URLs — a page built with setContent() can't load file://
// fonts, and silently falls back to a generic serif/sans.
const font = (pkg, file) =>
  `data:font/woff2;base64,${readFileSync(
    path.join(root, "node_modules/@fontsource", pkg, "files", file)
  ).toString("base64")}`;

const cards = [
  {
    out: "public/og-image.jpg",
    title: "Paco Molina",
    accent: "AI/Software Engineer",
    line: "Málaga, Spain · Open to remote, hybrid & on-site roles",
  },
  {
    out: "public/og/projects.jpg",
    kicker: "Paco Molina",
    title: "Things I've built",
    accent: "RedCheck · krylov-solvers · spotify-mcp · ShellMate",
    line: "AI products, agent systems and developer tools",
  },
  {
    out: "public/og/work.jpg",
    kicker: "Paco Molina",
    title: "Where I've worked",
    accent: "RedCheck · Quimify",
    line: "Backend, AI and full stack",
  },
  {
    out: "public/og/about.jpg",
    kicker: "Paco Molina",
    title: "About me",
    accent: "Mathematician and Computer Scientist",
    line: "University of Málaga · 2021–2026",
  },
  {
    out: "public/og/blog.jpg",
    kicker: "Paco Molina",
    title: "Notes along the way",
    accent: "Blog",
    line: "What I'm learning, building and talking about",
  },
];

const escape = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

const html = (c) => `<!doctype html><html><head><style>
@font-face { font-family: Fraunces; font-weight: 500; src: url(${font("fraunces", "fraunces-latin-500-normal.woff2")}); }
@font-face { font-family: Inter; font-weight: 400; src: url(${font("inter", "inter-latin-400-normal.woff2")}); }
@font-face { font-family: Inter; font-weight: 500; src: url(${font("inter", "inter-latin-500-normal.woff2")}); }
* { margin: 0; box-sizing: border-box; }
body {
  width: 1200px; height: 630px; padding: 80px;
  display: flex; flex-direction: column;
  font-family: Inter, sans-serif; color: #1c1917;
  background: linear-gradient(135deg, #fafaf9 0%, #fef3c7 45%, #fdba74 100%);
}
.mark {
  width: 88px; height: 88px; border-radius: 22px; background: #78350f;
  color: #fef3c7; font: 500 52px/88px Fraunces, serif; text-align: center;
}
.body { margin-top: auto; }
.kicker { font: 500 30px Inter, sans-serif; color: #57534e; margin-bottom: 14px; }
h1 { font: 500 ${c.kicker ? 92 : 108}px/1.05 Fraunces, serif; letter-spacing: -0.02em; }
.accent { margin-top: 22px; font: 500 36px Inter, sans-serif; color: #b45309; }
.line { margin-top: 18px; font: 400 28px Inter, sans-serif; color: #57534e; }
.domain { position: absolute; right: 80px; top: 104px; font: 500 26px Inter, sans-serif; color: #78350f; }
</style></head><body>
<div class="mark">P</div>
<div class="domain">pacomolina.dev</div>
<div class="body">
  ${c.kicker ? `<div class="kicker">${escape(c.kicker)}</div>` : ""}
  <h1>${escape(c.title)}</h1>
  <div class="accent">${escape(c.accent)}</div>
  <div class="line">${escape(c.line)}</div>
</div>
</body></html>`;

mkdirSync(path.join(root, "public/og"), { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
for (const card of cards) {
  await page.setContent(html(card), { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  const loaded = await page.evaluate(() =>
    ["500 10px Fraunces", "400 10px Inter", "500 10px Inter"].every((f) => document.fonts.check(f))
  );
  if (!loaded) throw new Error(`fonts didn't load for ${card.out}`);
  const png = path.join(root, "public/og/.tmp.png");
  await page.screenshot({ path: png });
  execFileSync("magick", [png, "-strip", "-quality", "87", path.join(root, card.out)]);
  rmSync(png);
  console.log("wrote", card.out);
}
await browser.close();

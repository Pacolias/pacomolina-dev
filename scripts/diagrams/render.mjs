// Renders every ```mermaid block in the blog's Markdown to SVG, once,
// ahead of time — Mermaid itself (~5MB) never reaches the browser. The
// Markdown stays the source of truth; src/plugins/mermaid-diagrams.mjs
// swaps each block for its SVG at build time (and fails the build if a
// block changed and wasn't re-rendered).
//
//   npm install --no-save playwright && node scripts/diagrams/render.mjs
//
// Writes src/diagrams/<hash>-light.svg and -dark.svg (hash of the block's
// text), in the site's palette and fonts (Inter, from @fontsource, inlined
// so text is measured exactly as the page will show it). Removes SVGs no
// block uses any more.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { chromium } from "playwright";

const root = resolve(import.meta.dirname, "../..");
const out = join(root, "src/diagrams");
const walk = (dir) =>
  readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });

export const diagramHash = (code) => createHash("sha256").update(code.trim()).digest("hex").slice(0, 12);

// Same palette as the site (Tailwind stone/amber), light and dark.
const THEMES = {
  light: {
    background: "#ffffff",
    primaryColor: "#fffbeb", // amber-50: node fill
    primaryBorderColor: "#fcd34d", // amber-300
    primaryTextColor: "#292524", // stone-800
    secondaryColor: "#f5f5f4", // stone-100: databases, secondary nodes
    secondaryBorderColor: "#d6d3d1",
    tertiaryColor: "#fafaf9",
    lineColor: "#a8a29e", // stone-400
    textColor: "#44403c", // stone-700: edge labels
    edgeLabelBackground: "#ffffff",
  },
  dark: {
    background: "#1c1917",
    primaryColor: "#292524", // stone-800
    primaryBorderColor: "#b45309", // amber-700
    primaryTextColor: "#f5f5f4", // stone-100
    secondaryColor: "#1c1917",
    secondaryBorderColor: "#57534e",
    tertiaryColor: "#292524",
    lineColor: "#78716c", // stone-500
    textColor: "#d6d3d1", // stone-300
    edgeLabelBackground: "#1c1917",
  },
};

const blocks = new Map();
for (const file of walk(join(root, "src/content")).filter((f) => f.endsWith(".md"))) {
  for (const m of readFileSync(file, "utf8").matchAll(/^```mermaid\n([\s\S]*?)\n```/gm)) {
    blocks.set(diagramHash(m[1]), m[1].trim());
  }
}

const font = (file) =>
  `data:font/woff2;base64,${readFileSync(join(root, "node_modules/@fontsource/inter/files", file)).toString("base64")}`;

mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent(`<!doctype html><html><head><style>
@font-face { font-family: Inter; font-weight: 400; src: url(${font("inter-latin-400-normal.woff2")}); }
@font-face { font-family: Inter; font-weight: 500; src: url(${font("inter-latin-500-normal.woff2")}); }
body { font-family: Inter; }
</style></head><body></body></html>`);
await page.addScriptTag({ path: join(root, "node_modules/mermaid/dist/mermaid.min.js") });
await page.evaluate(() => document.fonts.load("14px Inter"));

let rendered = 0;
for (const [hash, code] of blocks) {
  for (const [theme, themeVariables] of Object.entries(THEMES)) {
    const file = join(out, `${hash}-${theme}.svg`);
    if (existsSync(file)) continue;
    const svg = await page.evaluate(
      async ({ code, id, themeVariables }) => {
        const mermaid = globalThis.mermaid;
        mermaid.initialize({
          startOnLoad: false,
          theme: "base",
          fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
          themeVariables: { ...themeVariables, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif", fontSize: "14px" },
          // Lines break only where the Markdown says (<br/>).
          markdownAutoWrap: false,
          flowchart: { htmlLabels: true, curve: "basis", padding: 12, nodeSpacing: 28, rankSpacing: 36, wrappingWidth: 400 },
          securityLevel: "strict",
        });
        return (await mermaid.render(id, code)).svg;
      },
      // Unique ids: both themes (and both languages) end up on one page.
      { code, id: `mermaid-${hash}-${theme}`, themeVariables }
    );
    // Mermaid writes coordinates with ~14 decimals (its cylinder/stadium
    // shapes run to ~30KB of path data); one decimal is invisible and
    // makes the SVG several times smaller.
    // Also the site's look: no drop shadow on nodes, 12px corners.
    writeFileSync(
      file,
      svg
        .replace(/(-?\d+\.\d)\d+/g, "$1")
        .replace(/filter:\s*drop-shadow\((?:[^()]|\([^()]*\))*\)/g, "filter:none")
        .replace(/<rect class="basic label-container"[^>]*>/g, (tag) =>
          tag.replace(/\s(rx|ry)="[\d.]+"/g, "").replace("<rect ", '<rect rx="12" ry="12" ')
        )
    );
    rendered++;
  }
}
await browser.close();

// Drop SVGs of blocks that no longer exist.
let removed = 0;
for (const f of readdirSync(out)) {
  if (!blocks.has(f.split("-")[0])) {
    rmSync(join(out, f));
    removed++;
  }
}
console.log(`${blocks.size} diagram(s): ${rendered} SVG(s) rendered, ${removed} removed.`);

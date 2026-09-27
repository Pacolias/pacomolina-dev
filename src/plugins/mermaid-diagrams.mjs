// Sätteri hast plugin: swaps each ```mermaid code block for its
// pre-rendered SVG (scripts/diagrams/render.mjs → src/diagrams/), light
// and dark, inline — so the text uses the site's font and the colours
// follow the theme, with no Mermaid in the browser. Code highlighting
// skips "mermaid" (astro.config.mjs), so the block arrives as plain text.
// A block whose SVG is missing — edited and not re-rendered — fails the
// build with the command to fix it.
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { htmlToHast } from "satteri";

const dir = join(process.cwd(), "src/diagrams");
const hash = (code) => createHash("sha256").update(code.trim()).digest("hex").slice(0, 12);

export const mermaidDiagrams = {
  name: "mermaid-diagrams",
  element: {
    filter: ["pre"],
    visit(pre, ctx) {
      const code = pre.children?.find((c) => c.type === "element" && c.tagName === "code");
      if (!code) return;
      const classes = [code.properties?.className ?? []].flat().map(String);
      if (code.data?.lang !== "mermaid" && !classes.includes("language-mermaid")) return;
      const text = ctx.textContent(code);
      const h = hash(text);
      const svg = (theme) => {
        const file = join(dir, `${h}-${theme}.svg`);
        if (!existsSync(file)) {
          throw new Error(
            `Mermaid diagram ${h} has no rendered SVG — run: npm install --no-save playwright && node scripts/diagrams/render.mjs`
          );
        }
        // Inline in HTML, an <svg> needs no namespace declarations (and
        // htmlToHast would mangle them into invalid attributes).
        return readFileSync(file, "utf8").replace(/\s+xmlns(:\w+)?="[^"]*"/g, "");
      };
      const html = `<figure class="diagram not-prose"><div class="diagram-light">${svg("light")}</div><div class="diagram-dark">${svg("dark")}</div></figure>`;
      const tree = htmlToHast(html, { fragment: true });
      ctx.replaceNode(pre, tree.children[0]);
    },
  },
};

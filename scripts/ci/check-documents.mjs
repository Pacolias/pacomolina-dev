// The document viewer shows pre-rendered pages of each PDF
// (scripts/docs/render.mjs). Fails if a PDF in public/ no longer matches
// the hash it was rendered from — e.g. a new CV dropped in without
// re-rendering, which would show the old pages. Also checks every page
// image exists.
//
//   node scripts/ci/check-documents.mjs
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";

const manifest = JSON.parse(readFileSync("src/data/documents.json", "utf8"));
const problems = [];
for (const [id, doc] of Object.entries(manifest)) {
  const pdf = `public${doc.pdf}`;
  if (!existsSync(pdf)) {
    problems.push(`${id}: ${pdf} is missing`);
    continue;
  }
  const sha = createHash("sha256").update(readFileSync(pdf)).digest("hex");
  if (sha !== doc.sha256) problems.push(`${id}: ${pdf} changed since its pages were rendered`);
  for (const page of doc.pages) {
    if (!existsSync(`public${page.src}`)) problems.push(`${id}: page image public${page.src} is missing`);
  }
}
if (problems.length) {
  console.error(`${problems.join("\n")}\n\nRe-run: node scripts/docs/render.mjs`);
  process.exit(1);
}
console.log(`${Object.keys(manifest).length} documents match their rendered pages.`);

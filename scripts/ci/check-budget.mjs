// Weight budgets for the built site, measured on file sizes (gzip, as
// served) rather than load timings, which are too noisy on CI runners.
// Raise a budget deliberately, not to make a failure go away.
//
//   node scripts/ci/check-budget.mjs [dist]
import { readFileSync, readdirSync, statSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { join, relative, sep } from "node:path";

const dist = process.argv[2] ?? "dist";
const KB = 1024;
const BUDGETS = {
  jsTotal: 140 * KB, // all JS, gzipped (React + every page's island)
  cssTotal: 25 * KB, // all CSS, gzipped
  page: 70 * KB, // each HTML page, gzipped (the blog embeds its entries)
  image: 450 * KB, // any single image file
};

const walk = (dir) =>
  readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
const files = walk(dist);
const gz = (f) => gzipSync(readFileSync(f)).length;
const rel = (f) => "/" + relative(dist, f).split(sep).join("/");
const fmt = (n) => `${Math.round(n / KB)}KB`;

const failures = [];
const jsTotal = files.filter((f) => f.endsWith(".js") && !f.endsWith("sw.js")).reduce((s, f) => s + gz(f), 0);
const cssTotal = files.filter((f) => f.endsWith(".css")).reduce((s, f) => s + gz(f), 0);
console.log(`JS total ${fmt(jsTotal)} gz (budget ${fmt(BUDGETS.jsTotal)})`);
console.log(`CSS total ${fmt(cssTotal)} gz (budget ${fmt(BUDGETS.cssTotal)})`);
if (jsTotal > BUDGETS.jsTotal) failures.push(`JS total ${fmt(jsTotal)} > ${fmt(BUDGETS.jsTotal)}`);
if (cssTotal > BUDGETS.cssTotal) failures.push(`CSS total ${fmt(cssTotal)} > ${fmt(BUDGETS.cssTotal)}`);
for (const f of files.filter((f) => f.endsWith(".html"))) {
  const size = gz(f);
  console.log(`  ${rel(f).padEnd(24)} ${fmt(size)} gz`);
  if (size > BUDGETS.page) failures.push(`${rel(f)} ${fmt(size)} > ${fmt(BUDGETS.page)}`);
}
for (const f of files.filter((f) => /\.(webp|jpe?g|png|gif|avif)$/.test(f))) {
  const size = statSync(f).size;
  if (size > BUDGETS.image) failures.push(`${rel(f)} ${fmt(size)} > ${fmt(BUDGETS.image)}`);
}

if (failures.length) {
  console.error(`\nOver budget:\n  ${failures.join("\n  ")}`);
  process.exit(1);
}
console.log("All within budget.");

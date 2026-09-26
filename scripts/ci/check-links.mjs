// Fails on broken internal links in the built site: every href/src starting
// with "/" must resolve to a file in dist/, and "#fragment" links to an id
// on the target page. External links are only reported (many sites, e.g.
// LinkedIn, refuse automated requests), never fail the check.
//
//   node scripts/ci/check-links.mjs [dist]
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const dist = process.argv[2] ?? "dist";
const walk = (dir) =>
  readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
const pages = walk(dist).filter((f) => f.endsWith(".html"));

const decode = (s) => s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
const idsCache = new Map();
const idsOf = (file) => {
  if (!idsCache.has(file)) {
    const html = readFileSync(file, "utf8");
    idsCache.set(file, new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => decode(m[1]))));
  }
  return idsCache.get(file);
};
const fileFor = (path) => {
  const clean = decodeURIComponent(path.split("?")[0]);
  const candidates = clean.endsWith("/")
    ? [join(dist, clean, "index.html")]
    : [join(dist, clean), join(dist, clean, "index.html"), join(dist, `${clean}.html`)];
  return candidates.find((c) => existsSync(c) && statSync(c).isFile());
};

const broken = [];
const external = new Set();
for (const page of pages) {
  const html = readFileSync(page, "utf8");
  const from = "/" + relative(dist, page).split(sep).join("/");
  // Links in markup, and in the JSON props of React islands (hrefs there
  // are plain "\/..." or "/..." strings inside attribute-encoded JSON).
  const refs = [
    ...[...html.matchAll(/\s(?:href|src)="([^"]+)"/g)].map((m) => decode(m[1])),
    ...[...decode(html).matchAll(/"(?:href|src|path)":\s*\[?\d*,?"(\/[^"]*)"/g)].map((m) => m[1]),
  ];
  for (const ref of refs) {
    if (/^(https?:)?\/\//.test(ref)) {
      if (!/^\/\//.test(ref)) external.add(ref);
      continue;
    }
    if (!ref.startsWith("/") && !ref.startsWith("#")) continue; // mailto:, data:, relative assets
    const [path, frag] = ref.startsWith("#") ? [from, ref.slice(1)] : ref.split("#");
    const target = ref.startsWith("#") ? page : fileFor(path);
    if (!target) {
      broken.push(`${from} → ${ref} (no such file)`);
      continue;
    }
    // Fragments on HTML pages must name an element id (rows are
    // prerendered with their anchor ids). "toggle-goatcounter" is handled
    // by a script, not an element.
    if (frag && target.endsWith(".html") && frag !== "toggle-goatcounter" && !idsOf(target).has(decodeURIComponent(frag))) {
      broken.push(`${from} → ${ref} (no element with id "${frag}")`);
    }
  }
}

console.log(`Checked ${pages.length} pages; ${external.size} external links (not fetched).`);
if (broken.length) {
  console.error(`\n${broken.length} broken internal link(s):\n  ${[...new Set(broken)].join("\n  ")}`);
  process.exit(1);
}
console.log("No broken internal links.");

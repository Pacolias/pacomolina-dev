// Checks every external link on the built site actually answers — the
// RedCheck demo, repos, event pages, the British Council credential…
// Run weekly by .github/workflows/links.yml, which opens an issue when
// something is down. Only clear failures count: 404/410, 5xx and network
// errors. Sites that block bots (LinkedIn's 999, 401/403/429…) are
// reported as "unverifiable", never as broken.
//
//   node scripts/ci/check-external.mjs [dist]   (exit 1 if any are broken)
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const dist = process.argv[2] ?? "dist";
const walk = (dir) =>
  readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
const decode = (s) => s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'");

const urls = new Set();
for (const file of walk(dist).filter((f) => f.endsWith(".html"))) {
  const html = decode(readFileSync(file, "utf8"));
  for (const m of html.matchAll(/https?:\/\/[^\s"'<>\\)\]]+/g)) {
    const url = m[0].replace(/[.,;]+$/, "");
    const host = new URL(url).hostname;
    // Our own site, schema/namespace URLs and analytics aren't links to check.
    if (/(^|\.)pacomolina\.dev$|schema\.org|w3\.org|goatcounter|zgo\.at|fonts\.googleapis/.test(host)) continue;
    urls.add(url);
  }
}

const BLOCKED = new Set([401, 403, 405, 406, 429, 999]);
const check = async (url) => {
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const res = await fetch(url, {
        redirect: "follow",
        signal: AbortSignal.timeout(20000),
        headers: { "User-Agent": "Mozilla/5.0 (pacomolina.dev link check)" },
      });
      if (res.ok) return { url, state: "ok", status: res.status };
      if (BLOCKED.has(res.status)) return { url, state: "unverifiable", status: res.status };
      if (attempt === 2 || res.status < 500) return { url, state: "broken", status: res.status };
    } catch (err) {
      const code = err.cause?.code ?? err.name;
      // TLS chain problems on the other site's server (e.g. a missing
      // intermediate certificate): browsers repair these and the page opens
      // fine, Node doesn't — not a broken link.
      if (/CERT|SIGNATURE|SSL|TLS/.test(String(code))) return { url, state: "unverifiable", status: code };
      if (attempt === 2) return { url, state: "broken", status: code };
    }
    await new Promise((r) => setTimeout(r, 3000));
  }
};

const results = [];
const queue = [...urls];
await Promise.all(
  Array.from({ length: 6 }, async () => {
    while (queue.length) results.push(await check(queue.shift()));
  })
);

const by = (state) => results.filter((r) => r.state === state);
const broken = by("broken");
console.log(`Checked ${results.length} external links: ${by("ok").length} ok, ${by("unverifiable").length} unverifiable (bot-blocked), ${broken.length} broken.`);
for (const r of by("unverifiable")) console.log(`  ? ${r.status}  ${r.url}`);
for (const r of broken) console.log(`  ✗ ${r.status}  ${r.url}`);

// A Markdown report for the workflow to put in an issue.
if (process.env.REPORT_FILE) {
  writeFileSync(
    process.env.REPORT_FILE,
    broken.length
      ? `The weekly check found ${broken.length} broken external link(s) on pacomolina.dev:\n\n${broken
          .map((r) => `- \`${r.status}\` ${r.url}`)
          .join("\n")}\n\nFix or remove them in the site's data files, then close this issue.`
      : ""
  );
}
process.exit(broken.length ? 1 : 0);

// Evaluates the "Ask about Paco" assistant against worker/evals/cases.json:
// each case is a question plus regexes the answer must match (`must`, each
// may be "a|b" alternatives), must not match (`mustNot`), and whether it
// must cite a site page (`cite`) or answer in Spanish (`lang: "es"`).
// Every answer is also checked for rules that apply to all of them: no
// links outside the site, and never speaking as Paco ("I …").
//
//   node scripts/ci/eval-assistant.mjs https://<worker>/  [origin]
//
// Uses real quota (one request per case), paced under the Worker's
// per-IP limit — run by hand (Actions → "Evaluate assistant"), not on
// every deploy. Writes a Markdown report to REPORT_FILE if set.
import { readFileSync, writeFileSync } from "node:fs";

const endpoint = (process.argv[2] ?? "http://localhost:8787").replace(/\/$/, "");
const origin = process.argv[3] ?? "https://pacomolina.dev";
const cases = JSON.parse(readFileSync(new URL("../../worker/evals/cases.json", import.meta.url), "utf8"));
const PACE_MS = Number(process.env.PACE_MS ?? 8000); // 8/min per IP on the Worker

async function ask(q) {
  const res = await fetch(`${endpoint}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: origin },
    body: JSON.stringify({ messages: [{ role: "user", text: q }] }),
  });
  if (!res.ok) return { error: `${res.status} ${await res.text()}` };
  let text = "";
  for (const line of (await res.text()).split("\n")) {
    if (!line.startsWith("data:")) continue;
    const d = JSON.parse(line.slice(5));
    if (d.error) return { error: d.error };
    if (d.t) text += d.t;
  }
  return { text };
}

// Every citation must be one of the site's real "Source:" paths.
const knowledgeUrl = process.env.KNOWLEDGE_URL ?? "https://pacomolina.dev/assistant/knowledge.txt";
const sources = new Set(
  [...(await (await fetch(knowledgeUrl)).text()).matchAll(/^Source: (\S+)$/gm)].map((m) => m[1])
);

const SPANISH = /\b(el|la|los|las|que|de|en|y|con|para|está|es)\b/gi;
const rows = [];
let failed = 0;
for (const [i, c] of cases.entries()) {
  if (i) await new Promise((r) => setTimeout(r, PACE_MS));
  const { text, error } = await ask(c.q);
  const problems = [];
  if (error) problems.push(`error: ${error}`);
  else {
    for (const re of c.must ?? []) if (!new RegExp(re, "i").test(text)) problems.push(`missing /${re}/`);
    for (const re of c.mustNot ?? []) if (new RegExp(re, "im").test(text)) problems.push(`says /${re}/`);
    const links = [...text.matchAll(/\[\[([^|\]]+)\|/g)].map((m) => m[1]);
    if (c.cite && !links.length) problems.push("no citation");
    const bad = links.filter((l) => !sources.has(l));
    if (bad.length) problems.push(`cites a path that isn't a source: ${bad.map((l) => JSON.stringify(l)).join(", ")}`);
    if (/(^|[.!?]\s)I('m| am| built| worked| studied)\b/.test(text)) problems.push("speaks as Paco");
    if (c.lang === "es" && (text.match(SPANISH) ?? []).length < 3) problems.push("not in Spanish");
  }
  if (problems.length) failed++;
  rows.push({ q: c.q, ok: !problems.length, problems, text: text ?? "" });
  console.log(`${problems.length ? "FAIL" : "PASS"}  ${c.q}${problems.length ? `\n      ${problems.join("; ")}\n      → ${(text ?? "").replace(/\s+/g, " ").slice(0, 200)}` : ""}`);
}

const score = `${cases.length - failed}/${cases.length}`;
console.log(`\n${score} cases passed.`);
if (process.env.REPORT_FILE) {
  writeFileSync(
    process.env.REPORT_FILE,
    `## Assistant evals: ${score}\n\n| | Question | Problems |\n|---|---|---|\n${rows
      .map((r) => `| ${r.ok ? "✅" : "❌"} | ${r.q.replace(/\|/g, "\\|")} | ${r.problems.join("; ").replace(/\|/g, "\\|")} |`)
      .join("\n")}\n\n<details><summary>Answers</summary>\n\n${rows.map((r) => `**${r.q}**\n\n${r.text}\n`).join("\n")}\n</details>\n`
  );
}
process.exit(failed ? 1 : 0);

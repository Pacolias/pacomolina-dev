// Loads every page of the built site (served by `astro preview`) in a
// real browser — phone and desktop, light and dark, English and Spanish —
// and fails on:
//   - accessibility violations (axe: WCAG 2.1 A/AA + best practices),
//   - JS errors / console errors,
//   - horizontal overflow (something wider than the screen).
// Analytics requests are blocked so CI never counts as a visit.
//
//   npx astro preview --port 4321 &   then
//   node scripts/ci/check-pages.mjs http://localhost:4321
// Needs `playwright` and `@axe-core/playwright` (installed by the workflow,
// not project dependencies).
import { chromium } from "playwright";
import { AxeBuilder } from "@axe-core/playwright";

const base = process.argv[2] ?? "http://localhost:4321";
// Expanded rows included: their panels (galleries, links) only render when
// opened. /nope/ exercises the 404 page.
const pages = ["/", "/projects/#redcheck", "/work/#quimify", "/blog/", "/blog/#terraceo-31", "/about/", "/now/", "/nope/"];
const variants = [
  { width: 360, height: 800, lang: "es", theme: "light" },
  { width: 390, height: 844, lang: "en", theme: "dark" },
  { width: 1440, height: 900, lang: "en", theme: "light" },
  { width: 1440, height: 900, lang: "es", theme: "dark" },
];

const problems = [];
const browser = await chromium.launch();
for (const v of variants) {
  const context = await browser.newContext({ viewport: { width: v.width, height: v.height } });
  await context.route(/goatcounter|gc\.zgo\.at/, (route) => route.abort());
  await context.addInitScript(([lang, theme]) => {
    localStorage.setItem("lang", lang);
    localStorage.setItem("theme", theme);
  }, [v.lang, v.theme]);
  const page = await context.newPage();
  let current = "";
  const label = () => `${current} [${v.width}px ${v.lang} ${v.theme}]`;
  page.on("pageerror", (e) => problems.push(`${label()} JS error: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() !== "error") return;
    const text = m.text();
    // The aborted analytics request, and the 404 page's own status.
    if (/ERR_FAILED|ERR_BLOCKED/.test(text) || (current === "/nope/" && /404/.test(text))) return;
    problems.push(`${label()} console error: ${text}`);
  });

  for (const path of pages) {
    current = path;
    await page.goto(base + path, { waitUntil: "networkidle" });
    await page.waitForTimeout(800); // hydration, language swap, row opening
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    if (overflow > 0) problems.push(`${label()} horizontal overflow: ${overflow}px`);
    const { violations } = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"])
      .analyze();
    for (const violation of violations) {
      const where = violation.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(", ");
      problems.push(`${label()} a11y ${violation.impact} ${violation.id}: ${violation.help} — ${where}`);
    }
  }
  await context.close();
}
await browser.close();

const unique = [...new Set(problems)];
console.log(`Checked ${pages.length} pages × ${variants.length} variants.`);
if (unique.length) {
  console.error(`\n${unique.length} problem(s):\n  ${unique.join("\n  ")}`);
  process.exit(1);
}
console.log("No accessibility violations, console errors or overflow.");

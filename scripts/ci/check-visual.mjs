// Visual regression: screenshots every page (full height) on a phone in
// Spanish/light and on desktop in English/dark, and compares them pixel by
// pixel with the baselines committed in tests/visual/. Fails if any page
// changed; the actual screenshot and a diff (changes in red) are written to
// visual-report/ (uploaded as a CI artifact).
//
// Pixels depend on the OS's font rendering, so baselines are only valid
// from the same environment as CI: the official Playwright container
// (see scripts/ci/visual.sh — run it with `update` to accept changes).
//
//   node scripts/ci/check-visual.mjs http://localhost:4321 [--update]
// Needs playwright (same version as the container), pixelmatch and pngjs
// (installed --no-save, not project dependencies). Build the site with
// GITHUB_ACTIVITY=off so no date drifts between runs.
import { chromium } from "playwright";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const base = process.argv[2] ?? "http://localhost:4321";
const update = process.argv.includes("--update");
const baselineDir = "tests/visual";
const reportDir = "visual-report";

// "#redcheck" opens that row: covers an expanded panel with its gallery.
const pages = {
  home: "/",
  projects: "/projects/",
  "projects-open": "/projects/#redcheck",
  work: "/work/",
  blog: "/blog/",
  about: "/about/",
  now: "/now/",
  "not-found": "/nope/",
};
const variants = [
  { name: "phone", width: 360, height: 800, lang: "es", theme: "light" },
  { name: "desktop", width: 1440, height: 900, lang: "en", theme: "dark" },
];
// A pixel counts as changed past pixelmatch's colour threshold; a page
// fails past this share of changed pixels (anti-aliasing noise).
const MAX_CHANGED = 0.0005;

mkdirSync(baselineDir, { recursive: true });
rmSync(reportDir, { recursive: true, force: true });
const failures = [];
const browser = await chromium.launch();
for (const v of variants) {
  const context = await browser.newContext({
    viewport: { width: v.width, height: v.height },
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
  });
  await context.route(/goatcounter|gc\.zgo\.at/, (route) => route.abort());
  await context.addInitScript(([lang, theme]) => {
    localStorage.setItem("lang", lang);
    localStorage.setItem("theme", theme);
    sessionStorage.setItem("intro-seen", "1"); // no fade-up intro
  }, [v.lang, v.theme]);
  const page = await context.newPage();
  for (const [name, path] of Object.entries(pages)) {
    console.log(`  ${name} (${v.name})`);
    await page.goto(base + path, { waitUntil: "networkidle" });
    // Hydration, language swap, the row opening, then every image and font.
    await page.waitForTimeout(800);
    // Lazy images below the fold never load on their own, but the
    // full-page screenshot shows them: load them all (10s cap).
    await page.evaluate(async () => {
      await document.fonts.ready;
      for (const img of document.images) img.loading = "eager";
      const loaded = Promise.all(
        [...document.images]
          .filter((img) => !img.complete)
          .map(
            (img) =>
              new Promise((done) => {
                img.addEventListener("load", done, { once: true });
                img.addEventListener("error", done, { once: true });
              })
          )
      );
      await Promise.race([loaded, new Promise((done) => setTimeout(done, 10000))]);
    });
    // From the top: a #row link scrolls down, and the sticky nav would be
    // captured halfway down the page (the row stays open).
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);
    const shot = await page.screenshot({ fullPage: true, animations: "disabled", caret: "hide" });
    const file = `${name}-${v.name}.png`;
    const baselinePath = join(baselineDir, file);
    if (update || !existsSync(baselinePath)) {
      writeFileSync(baselinePath, shot);
      if (!update) failures.push(`${file}: no baseline yet (written — commit it)`);
      continue;
    }
    const actual = PNG.sync.read(shot);
    const expected = PNG.sync.read(readFileSync(baselinePath));
    let problem = null;
    let diff = null;
    if (actual.width !== expected.width || actual.height !== expected.height) {
      problem = `size ${expected.width}×${expected.height} → ${actual.width}×${actual.height}`;
    } else {
      diff = new PNG({ width: actual.width, height: actual.height });
      const changed = pixelmatch(expected.data, actual.data, diff.data, actual.width, actual.height, {
        threshold: 0.1,
      });
      const share = changed / (actual.width * actual.height);
      if (share > MAX_CHANGED) problem = `${changed} pixels changed (${(share * 100).toFixed(2)}%)`;
    }
    if (problem) {
      failures.push(`${file}: ${problem}`);
      mkdirSync(reportDir, { recursive: true });
      writeFileSync(join(reportDir, file.replace(".png", "-actual.png")), shot);
      if (diff) writeFileSync(join(reportDir, file.replace(".png", "-diff.png")), PNG.sync.write(diff));
    }
  }
  await context.close();
}
await browser.close();

const total = Object.keys(pages).length * variants.length;
if (update) {
  console.log(`Wrote ${total} baselines to ${baselineDir}/.`);
} else if (failures.length) {
  console.error(`${failures.length} of ${total} screenshots differ from the baseline:\n  ${failures.join("\n  ")}`);
  console.error(`\nSee ${reportDir}/. If the change is intended: scripts/ci/visual.sh update`);
  process.exit(1);
} else {
  console.log(`All ${total} screenshots match the baselines.`);
}

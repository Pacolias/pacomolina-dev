// Captures RedCheck's demo in every theme × language the site supports, so
// the Projects page can show the app the way the visitor is viewing this site.
//
//   npx -p playwright node scripts/screenshots/redcheck.mjs <out_dir>
//   then, for each PNG:
//   magick redcheck-<theme>-<lang>.png -resize 1280x -strip -quality 78 \
//     public/images/projects/redcheck-app-<theme>-<lang>.webp
//
// RedCheck keeps its own `theme` / `language` in localStorage; they're seeded
// once per context (not on every navigation, so the app can still change them).
import { chromium } from "playwright";

const out = process.argv[2] ?? ".";
const browser = await chromium.launch();
for (const lang of ["en", "es"]) {
  for (const theme of ["light", "dark"]) {
    const ctx = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      deviceScaleFactor: 2,
      colorScheme: theme,
    });
    await ctx.addInitScript(([l, t]) => {
      if (sessionStorage.getItem("seeded")) return;
      localStorage.setItem("language", l);
      localStorage.setItem("theme", t);
      sessionStorage.setItem("seeded", "1");
    }, [lang, theme]);
    const page = await ctx.newPage();
    await page.goto("https://my.redcheckapp.com/", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: /^Demo$/ }).click();
    await page.waitForTimeout(3000);
    // Dismiss the onboarding dialog.
    await page.getByRole("button", { name: /^(Skip|Omitir|Saltar)$/ }).first().click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${out}/redcheck-${theme}-${lang}.png` });
    await ctx.close();
  }
}
await browser.close();

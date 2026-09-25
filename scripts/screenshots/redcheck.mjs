// Captures RedCheck in every theme × language the site supports, so the
// Projects page can show it the way the visitor is viewing this site:
//   landing   — the redcheckapp.com hero, after its demo animation settles
//   ai-plan   — SmartCheck AI's daily plan (a live Gemini call, ~20s)
//   dashboard — the month calendar with the task list
//   focus     — Focus Mode, calendar hidden, activity heatmap showing
//
//   npx -p playwright node scripts/screenshots/redcheck.mjs <out_dir>
//   then, for each PNG:
//   magick redcheck-<shot>-<theme>-<lang>.png -resize 1280x -strip -quality 78 \
//     public/images/projects/redcheck-<shot>-<theme>-<lang>.webp
//
// Theme/language are seeded in localStorage once per context (not on every
// navigation, so the pages can still change them): the app reads `theme` +
// `language`, the landing `theme` + `lang` — but the landing prefers the
// browser language, so it's switched with its own toggle when needed.
import { chromium } from "playwright";

const out = process.argv[2] ?? ".";
const VIEWPORT = { width: 1280, height: 900 };
const T = {
  en: { skip: /^Skip$/, analysis: "Daily Task Analysis", plan: /View today.s plan/i, focus: /^Focus Mode$/ },
  es: { skip: /^(Omitir|Saltar)$/, analysis: "Análisis Diario de Tareas", plan: /Ver (el )?plan/i, focus: /^Modo Foco$/ },
};

const browser = await chromium.launch();
for (const lang of ["en", "es"]) {
  for (const theme of ["light", "dark"]) {
    const ctx = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 2, colorScheme: theme });
    await ctx.addInitScript(([l, t]) => {
      if (sessionStorage.getItem("seeded")) return;
      for (const key of ["language", "lang"]) localStorage.setItem(key, l);
      localStorage.setItem("theme", t);
      sessionStorage.setItem("seeded", "1");
    }, [lang, theme]);
    const shot = (page, name) => page.screenshot({ path: `${out}/redcheck-${name}-${theme}-${lang}.png` });

    // Landing hero
    const landing = await ctx.newPage();
    await landing.goto("https://redcheckapp.com/", { waitUntil: "networkidle" });
    if ((await landing.evaluate(() => document.documentElement.lang)) !== lang) {
      await landing.getByRole("button", { name: /Cambiar idioma|Change language/ }).click();
    }
    // Hide the floating language/theme toggles: they'd sit in the corner of the shot.
    await landing.addStyleTag({
      content: "button[aria-label*='idioma'], button[aria-label*='language'], button[aria-label*='color'] { visibility: hidden !important; }",
    });
    await landing.waitForTimeout(5500); // let the "AI sorting" demo finish
    await shot(landing, "landing");
    await landing.close();

    // App: demo account
    const t = T[lang];
    const app = await ctx.newPage();
    await app.goto("https://my.redcheckapp.com/", { waitUntil: "networkidle" });
    await app.getByRole("button", { name: /^Demo$/ }).click();
    await app.waitForTimeout(3000);
    await app.getByRole("button", { name: t.skip }).first().click(); // onboarding
    await app.waitForTimeout(1500);
    await shot(app, "dashboard");

    await app.getByText(t.analysis).click();
    const viewPlan = app.getByRole("button", { name: t.plan }).first();
    await viewPlan.waitFor({ timeout: 90_000 });
    await viewPlan.click();
    await app.waitForTimeout(1500);
    await shot(app, "ai-plan");
    await app.keyboard.press("Escape");
    await app.waitForTimeout(800);

    await app.getByRole("button", { name: t.focus }).click();
    await app.waitForTimeout(1500);
    await shot(app, "focus");
    await ctx.close();
    console.log(`done: ${theme}/${lang}`);
  }
}
await browser.close();

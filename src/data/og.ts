import { readFileSync } from "node:fs";
import path from "node:path";
import satori from "satori";
import sharp from "sharp";

// Build-time social-preview cards (1200×630 JPEG) for pages that aren't
// worth a hand-rendered one — every blog entry with its own page gets one
// per language, automatically. Same look as the section cards from
// scripts/og/render.mjs: satori lays the card out with the site's own
// fonts (text becomes paths), sharp rasterises it. Server-only.

const font = (pkg: string, file: string) =>
  readFileSync(path.join(process.cwd(), "node_modules/@fontsource", pkg, "files", file));

const fonts = [
  { name: "Fraunces", weight: 500 as const, data: font("fraunces", "fraunces-latin-500-normal.woff") },
  { name: "Inter", weight: 400 as const, data: font("inter", "inter-latin-400-normal.woff") },
  { name: "Inter", weight: 500 as const, data: font("inter", "inter-latin-500-normal.woff") },
];

type Node = { type: string; props: Record<string, unknown> };
const el = (type: string, style: Record<string, unknown>, children?: unknown): Node => ({
  type,
  props: { style, children },
});

// Shortens at a word boundary.
const clamp = (s: string, max: number) =>
  s.length > max ? `${s.slice(0, max).replace(/\s+\S*$/, "").replace(/[\s,.;:—–-]+$/, "")}…` : s;

export async function renderOgCard(card: {
  kicker: string;
  title: string;
  accent: string;
  line: string;
}) {
  // Long titles step down so they stay within three lines.
  const titleSize = card.title.length > 60 ? 64 : card.title.length > 32 ? 76 : 92;
  const tree = el(
    "div",
    {
      width: 1200,
      height: 630,
      padding: 80,
      display: "flex",
      flexDirection: "column",
      fontFamily: "Inter",
      color: "#1c1917",
      backgroundImage: "linear-gradient(135deg, #fafaf9 0%, #fef3c7 45%, #fdba74 100%)",
    },
    [
      el("div", { display: "flex", justifyContent: "space-between", alignItems: "center" }, [
        el(
          "div",
          {
            width: 88,
            height: 88,
            borderRadius: 22,
            background: "#78350f",
            color: "#fef3c7",
            fontFamily: "Fraunces",
            fontSize: 52,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          },
          "P"
        ),
        el("div", { fontSize: 26, fontWeight: 500, color: "#78350f" }, "pacomolina.dev"),
      ]),
      el("div", { marginTop: "auto", display: "flex", flexDirection: "column" }, [
        el("div", { fontSize: 30, fontWeight: 500, color: "#57534e", marginBottom: 14 }, card.kicker),
        el(
          "div",
          { fontFamily: "Fraunces", fontSize: titleSize, lineHeight: 1.05, letterSpacing: "-0.02em" },
          clamp(card.title, 90)
        ),
        el("div", { marginTop: 22, fontSize: 36, fontWeight: 500, color: "#b45309" }, card.accent),
        el("div", { marginTop: 18, fontSize: 28, color: "#57534e" }, clamp(card.line, 68)),
      ]),
    ]
  );
  const svg = await satori(tree as Parameters<typeof satori>[0], { width: 1200, height: 630, fonts });
  return sharp(Buffer.from(svg)).jpeg({ quality: 87 }).toBuffer();
}

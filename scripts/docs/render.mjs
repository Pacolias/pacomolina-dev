// Renders the PDFs the site shows in its document viewer (CV, English C1
// certificate) into page images, so they can be read in-page on any
// device — phone browsers can't display an embedded PDF. Writes:
//   public/docs/<id>/page-<n>.webp          (1400px wide)
//   src/data/documents.json                 (pages + the PDF's sha256)
//   src/data/documents-text.json            (the text of `text: true` docs,
//                                           for the site assistant; phone
//                                           numbers stripped)
// CI (scripts/ci/check-documents.mjs) fails if a PDF changed without
// re-running this.
//
//   node scripts/docs/render.mjs [english-c1=<path to the original PDF>]
//
// Documents with `redact` are published as a rasterised copy with those
// boxes painted over (text layers would keep the hidden text): the
// certificate's national ID number. Needs pdftoppm (poppler) and magick.
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");
const DPI = 170; // A4 at 170dpi ≈ 1400px wide

const docs = [
  { id: "cv", pdf: "public/cv/CV-Paco.pdf", text: true },
  {
    id: "english-c1",
    pdf: "public/docs/english-c1-british-council.pdf",
    // Boxes in PDF points (top-left origin), page 1: the "ID number" value.
    redact: [{ page: 1, x: 440, y: 395, w: 66, h: 19 }],
  },
];

const sources = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const i = a.indexOf("=");
    return [a.slice(0, i), a.slice(i + 1)];
  })
);

const run = (cmd, args) => execFileSync(cmd, args, { stdio: ["ignore", "pipe", "inherit"] });
const sha = (file) => createHash("sha256").update(readFileSync(file)).digest("hex");
const manifest = {};
const texts = {};

for (const doc of docs) {
  const tmp = mkdtempSync(join(tmpdir(), `doc-${doc.id}-`));
  const out = join(root, doc.pdf);

  if (doc.redact) {
    // Build the published, redacted PDF from the original.
    const original = sources[doc.id];
    if (!original) {
      if (!existsSync(out)) throw new Error(`${doc.id}: pass ${doc.id}=<original.pdf>`);
      console.log(`${doc.id}: no original given, keeping ${doc.pdf}`);
    } else {
      run("pdftoppm", ["-r", "200", "-png", original, join(tmp, "src")]);
      const pages = readdirSync(tmp).filter((f) => f.startsWith("src")).sort();
      const scale = 200 / 72;
      const redactedPages = pages.map((file, i) => {
        const draws = doc.redact
          .filter((r) => r.page === i + 1)
          .flatMap((r) => [
            "-fill",
            "#1c1917",
            "-draw",
            `roundrectangle ${r.x * scale},${r.y * scale} ${(r.x + r.w) * scale},${(r.y + r.h) * scale} 6,6`,
          ]);
        const target = join(tmp, `red-${i + 1}.jpg`);
        run("magick", [join(tmp, file), ...draws, "-strip", "-quality", "78", target]);
        return target;
      });
      mkdirSync(join(out, ".."), { recursive: true });
      run("magick", [...redactedPages, "-density", "200", "-units", "PixelsPerInch", out]);
      console.log(`${doc.id}: wrote redacted ${doc.pdf}`);
    }
  }

  // Page images from the published PDF.
  const dir = join(root, "public/docs", doc.id);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  run("pdftoppm", ["-r", String(DPI), "-png", out, join(tmp, "page")]);
  const pngs = readdirSync(tmp).filter((f) => f.startsWith("page")).sort();
  const pages = pngs.map((file, i) => {
    const webp = join(dir, `page-${i + 1}.webp`);
    run("magick", [join(tmp, file), "-strip", "-quality", "82", webp]);
    const [width, height] = run("magick", ["identify", "-format", "%w %h", webp]).toString().split(" ").map(Number);
    return { src: `/docs/${doc.id}/page-${i + 1}.webp`, width, height };
  });
  rmSync(tmp, { recursive: true, force: true });
  if (doc.text) {
    texts[doc.id] = run("pdftotext", ["-layout", out, "-"])
      .toString()
      // The assistant points people to email/LinkedIn, never a phone.
      .replace(/\+?\d[\d ]{7,}\d\s*\|?\s*/g, "")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/^[ \t]+/gm, "")
      .replace(/ {3,}/g, " · ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }
  manifest[doc.id] = { pdf: `/${doc.pdf.replace(/^public\//, "")}`, sha256: sha(out), pages };
  console.log(`${doc.id}: ${pages.length} page(s)`);
}

writeFileSync(join(root, "src/data/documents.json"), JSON.stringify(manifest, null, 2) + "\n");
writeFileSync(join(root, "src/data/documents-text.json"), JSON.stringify(texts, null, 2) + "\n");
console.log("wrote src/data/documents.json");

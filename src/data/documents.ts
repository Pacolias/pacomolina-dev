import generated from "./documents.json";
import { withBase } from "./site";

// PDFs the site shows in its in-page viewer (DocumentViewer): the pages
// are pre-rendered images, see scripts/docs/render.mjs — re-run it when a
// PDF changes (CI checks the hash).

export type DocumentId = keyof typeof generated;

export type SiteDocument = {
  id: DocumentId;
  pdf: string;
  pages: { src: string; width: number; height: number }[];
  // A page where the document can be verified independently.
  verify?: string;
};

const verify: Partial<Record<DocumentId, string>> = {
  "english-c1":
    "https://credentials.britishcouncil.org/bec46bcd-cf45-4690-a914-46b4ec75225a?key=21c5bfc21b09d829082936195efa1540dadb7b2e55ae1ac8fa01b975df2e7544",
};

export const documents = Object.fromEntries(
  (Object.keys(generated) as DocumentId[]).map((id) => [
    id,
    {
      id,
      pdf: withBase(generated[id].pdf),
      pages: generated[id].pages.map((p) => ({ ...p, src: withBase(p.src) })),
      verify: verify[id],
    },
  ])
) as Record<DocumentId, SiteDocument>;

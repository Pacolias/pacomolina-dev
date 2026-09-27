import { createContext, useContext, useState, type MouseEvent, type ReactNode } from "react";
import { Download, ShieldCheck } from "lucide-react";
import { documents, type DocumentId } from "../data/documents";
import { dictionary } from "../data/i18n";
import type { LightboxImage } from "./Gallery";
import { Lightbox } from "./Lightbox";
import { useLanguage } from "./LanguageProvider";

// In-page viewer for the site's PDFs (CV, certificates): their pages, as
// pre-rendered images, in the same Lightbox as the photos — so they can be
// read (and zoomed) on any device without downloading anything; phone
// browsers can't show an embedded PDF. The top bar has "Download PDF" and,
// for a certificate, a link to verify it at the issuer. One viewer per
// page, mounted by SiteShell; anything opens it through useDocumentViewer
// or <DocumentLink>.

const DocumentViewerContext = createContext<(id: DocumentId) => void>(() => {});

export function useDocumentViewer() {
  return useContext(DocumentViewerContext);
}

export function DocumentViewerProvider({ children }: { children: ReactNode }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState<{ id: DocumentId; index: number } | null>(null);
  const doc = open ? documents[open.id] : null;

  // Each page is captioned with the document's title (the counter above
  // already says which page it is).
  const images: LightboxImage[] = doc
    ? doc.pages.map((page) => ({
        ...page,
        alt: { en: dictionary.en.docs.titles[doc.id], es: dictionary.es.docs.titles[doc.id] },
      }))
    : [];

  const action =
    "inline-flex h-10 items-center gap-1.5 rounded-full border border-white/15 bg-stone-900/60 px-3.5 text-sm text-stone-100 backdrop-blur transition-colors duration-200 hover:bg-stone-800/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400";

  return (
    <DocumentViewerContext.Provider value={(id) => setOpen({ id, index: 0 })}>
      {children}
      <Lightbox
        images={images}
        index={open?.index ?? null}
        onIndexChange={(index) => setOpen((o) => o && { ...o, index })}
        onClose={() => setOpen(null)}
        actions={
          doc && (
            <>
              {doc.verify && (
                <a
                  href={doc.verify}
                  target="_blank"
                  rel="noreferrer noopener"
                  title={t.docs.verifyTitle}
                  aria-label={t.docs.verifyTitle}
                  className={action}
                >
                  <ShieldCheck className="h-4 w-4" />
                  {/* Short labels on phones, so the bar fits at 360px. */}
                  <span className="hidden sm:inline">{t.docs.verify}</span>
                </a>
              )}
              <a href={doc.pdf} download aria-label={t.docs.download} title={t.docs.download} className={action}>
                <Download className="h-4 w-4" />
                <span className="sm:hidden">PDF</span>
                <span className="hidden sm:inline">{t.docs.download}</span>
              </a>
            </>
          )
        }
      />
    </DocumentViewerContext.Provider>
  );
}

// A link to the PDF that opens it in the viewer instead (a plain link
// without JS, and with Ctrl/⌘/middle-click, which open the PDF itself).
export function DocumentLink({
  id,
  className,
  title,
  children,
}: {
  id: DocumentId;
  className?: string;
  title?: string;
  children: ReactNode;
}) {
  const view = useDocumentViewer();
  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    view(id);
  };
  return (
    <a href={documents[id].pdf} onClick={onClick} className={className} title={title} aria-haspopup="dialog">
      {children}
    </a>
  );
}

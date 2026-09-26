import { useEffect, useState } from "react";
import { Check, Contact, Copy, Mail, QrCode } from "lucide-react";
import { SiGithub } from "@icons-pack/react-simple-icons";
import { site, withBase } from "../data/site";
import { useLanguage } from "./LanguageProvider";
import { Lightbox } from "./Lightbox";

// Pre-generated (static SVG, no QR library at runtime) for
// https://pacomolina.dev/?ref=qr — dark modules on white with a quiet zone,
// so it scans in either theme. Regenerate with the `qrcode` npm package if
// the URL ever changes.
const QR_SRC = withBase("/images/qr-pacomolina.svg");

export function ContactCard() {
  const { t } = useLanguage();
  // At an event without NFC: open this on the phone, the other person scans it.
  const [qrOpen, setQrOpen] = useState(false);
  // For visitors without a mail app set up (common on desktops), where
  // mailto: does nothing: copy the address instead.
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);
  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(site.email);
    } catch {
      // Clipboard API unavailable/denied: fall back to a hidden textarea.
      const area = document.createElement("textarea");
      area.value = site.email;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
    }
    setCopied(true);
  };
  const iconButton =
    "inline-flex h-10 w-10 items-center justify-center rounded-full border border-stone-300 text-stone-700 transition-colors duration-200 hover:border-amber-300 hover:bg-amber-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-stone-700 dark:text-stone-300 dark:hover:border-amber-700 dark:hover:bg-stone-800 dark:focus-visible:ring-offset-stone-900";

  return (
    <section className="fade-up-5 flex flex-col items-center gap-4 rounded-3xl border border-amber-100 bg-white px-5 py-6 text-center shadow-sm shadow-stone-200/50 sm:p-8 dark:border-stone-800 dark:bg-stone-900 dark:shadow-none">
      <h2 className="font-display text-lg font-medium text-stone-900 dark:text-stone-100">
        {t.contact.heading}
      </h2>
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        {/* A split button: send (mailto:) | copy the address. */}
        <div className="inline-flex items-stretch rounded-full bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
          <a
            href={`mailto:${site.email}`}
            className="inline-flex items-center gap-2 rounded-l-full py-2.5 pr-3 pl-5 text-sm font-medium transition-colors duration-200 hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:hover:bg-amber-950/60 dark:focus-visible:ring-offset-stone-900"
          >
            <Mail className="h-4 w-4" />
            {t.contact.button}
          </a>
          <span aria-hidden="true" className="my-2 w-px bg-amber-200 dark:bg-amber-900" />
          <button
            type="button"
            onClick={copyEmail}
            aria-label={t.contact.copyEmail}
            title={copied ? t.contact.emailCopied : t.contact.copyEmail}
            className="inline-flex items-center rounded-r-full py-2.5 pr-4 pl-3 transition-colors duration-200 hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:hover:bg-amber-950/60 dark:focus-visible:ring-offset-stone-900"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
          <span role="status" aria-live="polite" className="sr-only">
            {copied ? t.contact.emailCopied : ""}
          </span>
        </div>
        <a
          href={site.vcardHref}
          download
          className="inline-flex items-center gap-2 rounded-full border border-stone-300 px-4 py-2.5 text-sm font-medium text-stone-700 sm:px-5 transition-colors duration-200 hover:border-amber-300 hover:bg-amber-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-stone-700 dark:text-stone-300 dark:hover:border-amber-700 dark:hover:bg-stone-800 dark:focus-visible:ring-offset-stone-900"
        >
          <Contact className="h-4 w-4" />
          {t.contact.vcard}
        </a>
        <a
          href={site.github}
          target="_blank"
          rel="noreferrer noopener"
          aria-label={t.contact.github}
          title={t.contact.github}
          className={iconButton}
        >
          <SiGithub className="h-4 w-4" />
        </a>
        <button
          type="button"
          onClick={() => setQrOpen(true)}
          aria-label={t.contact.qr}
          title={t.contact.qr}
          className={iconButton}
        >
          <QrCode className="h-4 w-4" />
        </button>
      </div>
      <Lightbox
        images={[
          {
            src: QR_SRC,
            alt: { en: t.contact.qrAlt, es: t.contact.qrAlt },
            caption: { en: t.contact.qrCaption, es: t.contact.qrCaption },
            width: 740,
            height: 740,
          },
        ]}
        index={qrOpen ? 0 : null}
        onIndexChange={() => {}}
        onClose={() => setQrOpen(false)}
      />
    </section>
  );
}

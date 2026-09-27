import type { Lang } from "./i18n";

// Indexable Spanish URLs: every page exists at /<path> (English prerender)
// and /es/<path> (Spanish prerender), from the same file under
// src/pages/[...lang]/. The NFC/QR target stays the bare domain, which
// keeps detecting the visitor's language client-side.

export const LOCALES: Lang[] = ["en", "es"];

// getStaticPaths entries for a page that exists in both languages.
export const localePaths = () =>
  LOCALES.map((lang) => ({
    params: { lang: lang === "en" ? undefined : lang },
    props: { lang },
  }));

// "/projects/" → "/es/projects/" (lang "es"), unchanged for "en".
export const localizePath = (path: string, lang: Lang) =>
  lang === "en" ? path : `/${lang}${path === "/" ? "/" : path}`;

// "/es/projects/" → "/projects/"; English paths pass through.
export const delocalizePath = (path: string) => path.replace(/^\/es(\/|$)/, "/");

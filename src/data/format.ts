import type { Lang } from "./i18n";

// "2022-04" → "Apr 2022" / "abr 2022". UTC so prerender and client agree.
export function formatMonth(yearMonth: string, lang: Lang) {
  const [y, m] = yearMonth.split("-").map(Number);
  return new Intl.DateTimeFormat(lang, {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(y, m - 1, 1)));
}

// Full date for blog posts: "25 Sep 2026" / "25 sept 2026".
export function formatDate(date: Date | string, lang: Lang) {
  return new Intl.DateTimeFormat(lang, {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(date));
}

// "3 days ago" / "hace 3 días" — relative to `now`. Only call it on the
// client after hydration (the server's "now" is the build time).
export function formatRelative(date: Date | string, lang: Lang, now = Date.now()) {
  const seconds = (new Date(date).getTime() - now) / 1000;
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  const rtf = new Intl.RelativeTimeFormat(lang, { numeric: "auto" });
  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit);
  }
  return rtf.format(0, "minute");
}

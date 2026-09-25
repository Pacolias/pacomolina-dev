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

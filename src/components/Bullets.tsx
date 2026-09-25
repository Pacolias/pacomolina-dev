import type { Localized } from "../data/i18n";
import { useLanguage } from "./LanguageProvider";

// A list of highlights, each with a small amber dot.
export function Bullets({ items }: { items: Localized[] }) {
  const { lang } = useLanguage();
  if (items.length === 0) return null;
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li
          key={item.en}
          className="relative pl-4 text-sm leading-relaxed text-stone-600 before:absolute before:left-0 before:top-[0.6em] before:h-1.5 before:w-1.5 before:rounded-full before:bg-amber-400 dark:text-stone-400 dark:before:bg-amber-500"
        >
          {item[lang]}
        </li>
      ))}
    </ul>
  );
}

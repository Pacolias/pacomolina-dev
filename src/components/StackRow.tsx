import {
  SiPython,
  SiSpringboot,
  SiReact,
  SiLanggraph,
  SiDocker,
  SiGooglegemini,
} from "@icons-pack/react-simple-icons";
import { stack, type StackItem } from "../data/site";
import { useLanguage } from "./LanguageProvider";

const ICONS: Record<StackItem["icon"], typeof SiPython> = {
  python: SiPython,
  springboot: SiSpringboot,
  react: SiReact,
  langgraph: SiLanggraph,
  docker: SiDocker,
  gemini: SiGooglegemini,
};

// The curated tech stack as a row of small chips: same monochrome amber
// brand icons as before, a fraction of the space of the old tile grid.
export function StackRow() {
  const { t } = useLanguage();
  return (
    <section>
      <h2 className="text-xs font-medium uppercase tracking-wider text-stone-500 dark:text-stone-400">
        {t.stack.heading}
      </h2>
      <ul className="mt-3 flex flex-wrap gap-2">
        {stack.map((item) => {
          const Icon = ICONS[item.icon];
          return (
            <li
              key={item.name}
              className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-1 text-xs text-stone-700 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300"
            >
              <Icon className="h-3.5 w-3.5 text-amber-700 dark:text-amber-400" aria-hidden="true" />
              {item.name}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

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

export function StackGrid() {
  const { t } = useLanguage();

  return (
    <section className="fade-up-4 flex h-full flex-col rounded-3xl border border-amber-100 bg-white p-6 shadow-sm shadow-stone-200/50 sm:p-8 dark:border-stone-800 dark:bg-stone-900 dark:shadow-none">
      <h2 className="font-display text-lg font-medium text-stone-900 dark:text-stone-100">
        {t.stack.heading}
      </h2>
      <div className="mt-5 grid grid-cols-2 gap-3">
        {stack.map((item) => {
          const Icon = ICONS[item.icon];
          return (
            <div
              key={item.name}
              title={item.name}
              className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-stone-100 bg-stone-50/60 px-2 py-3 text-center transition-colors duration-200 hover:border-amber-200 hover:bg-amber-50/50 dark:border-stone-800 dark:bg-stone-800/40 dark:hover:border-amber-800 dark:hover:bg-amber-950/30"
            >
              <Icon className="h-5 w-5 text-amber-700 dark:text-amber-400" />
              <span className="text-[11px] font-medium leading-tight text-stone-600 dark:text-stone-400">
                {item.name}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

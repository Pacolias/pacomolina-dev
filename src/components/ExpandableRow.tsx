import { useId, useState, type ReactNode } from "react";
import { Plus } from "lucide-react";
import { Collapsible } from "./Collapsible";
import { focusRing } from "./ui";

// One row of a compact list (Projects, Work): a one-glance summary with a
// "+" that smoothly reveals everything else. The heading wraps the toggle
// button (the WAI-ARIA disclosure pattern), so the page keeps a real
// outline. Meant to sit in a card padded px-6 sm:px-8 (the panel bleeds to
// its edges so galleries can scroll edge to edge).
export function ExpandableRow({
  leading,
  title,
  subtitle,
  aside,
  children,
}: {
  leading?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  // Right-aligned, before the "+" (e.g. dates). Callers hide it on phones
  // and repeat it under the subtitle if it matters there.
  aside?: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <li className="border-t border-stone-100 first:border-t-0 dark:border-stone-800">
      <h2>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls={panelId}
          className={`group flex w-full items-start gap-3 rounded-2xl py-4 text-left sm:gap-4 ${focusRing}`}
        >
          {leading}
          <span className="min-w-0 flex-1">
            <span className="block">{title}</span>
            {subtitle && (
              <span className="mt-0.5 block text-sm text-stone-600 dark:text-stone-400">
                {subtitle}
              </span>
            )}
          </span>
          {aside}
          <Plus
            aria-hidden="true"
            className={`mt-1 h-4 w-4 shrink-0 text-stone-400 transition-transform duration-300 group-hover:text-amber-600 dark:text-stone-500 dark:group-hover:text-amber-400 ${open ? "rotate-45" : ""}`}
          />
        </button>
      </h2>
      <Collapsible id={panelId} open={open} bleed className="space-y-4 pb-6">
        {children}
      </Collapsible>
    </li>
  );
}

// Row title text: turns amber when its row is hovered.
export const rowTitle =
  "font-medium text-stone-900 transition-colors group-hover:text-amber-700 dark:text-stone-100 dark:group-hover:text-amber-400";

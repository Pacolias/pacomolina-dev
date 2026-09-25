// Shared class strings for the multi-page sections, matching the look the
// original home cards established (RedCheckCard, ContactCard, StackGrid).

export const card =
  "rounded-3xl border border-amber-100 bg-white shadow-sm shadow-stone-200/50 dark:border-stone-800 dark:bg-stone-900 dark:shadow-none";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-stone-900";

const buttonBase = `inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 ${focusRing}`;

export const button = {
  primary: `${buttonBase} bg-stone-800 text-stone-50 hover:bg-stone-700 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white`,
  accent: `${buttonBase} border border-amber-200 bg-amber-50/60 text-amber-800 hover:border-amber-300 hover:bg-amber-100 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300 dark:hover:border-amber-700 dark:hover:bg-amber-950/50`,
  outline: `${buttonBase} border border-stone-300 text-stone-700 hover:border-amber-300 hover:bg-amber-50 dark:border-stone-700 dark:text-stone-300 dark:hover:border-amber-700 dark:hover:bg-stone-800`,
};

export const textLink = `inline-flex items-center gap-1 rounded text-sm font-medium text-amber-700 underline decoration-amber-300 underline-offset-4 transition-colors hover:decoration-amber-600 dark:text-amber-400 dark:decoration-amber-800 dark:hover:decoration-amber-400 ${focusRing}`;

export const tag =
  "inline-block rounded-full bg-amber-50 px-3 py-1 text-xs font-medium tracking-wide text-amber-700 dark:bg-amber-950/40 dark:text-amber-300";

export const sectionHeading =
  "font-display text-xl font-medium text-stone-900 dark:text-stone-100";

export { focusRing };

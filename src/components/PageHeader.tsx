export function PageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  // A div, not <header>: a header would read as a second page "banner" next
  // to the site nav. It sits inside SiteShell's <main>.
  return (
    <div className="px-6 pt-10 pb-8 sm:pt-14 sm:pb-10">
      <h1 className="fade-up-1 font-display text-3xl font-medium tracking-tight text-stone-900 sm:text-4xl dark:text-stone-100">
        {title}
        <span className="text-amber-600 dark:text-amber-400">.</span>
      </h1>
      {subtitle && (
        <p className="fade-up-2 mt-3 max-w-xl text-pretty text-base leading-relaxed text-stone-600 dark:text-stone-400">
          {subtitle}
        </p>
      )}
    </div>
  );
}

import { ArrowLeft } from "lucide-react";
import { sections, withBase } from "../../data/site";
import { useLanguage } from "../LanguageProvider";
import { SiteShell } from "../SiteShell";
import { PageHeader } from "../PageHeader";
import { button, textLink } from "../ui";

// GitHub Pages serves this for any unknown URL (a mistyped link, an old QR),
// so it keeps the site's look and offers a way back instead of GitHub's
// generic page.
export function NotFoundPage() {
  const { t } = useLanguage();
  const copy = t.pages.notFound;

  return (
    <>
      <PageHeader title={copy.title} subtitle={copy.subtitle} />
      <div className="fade-up-3 px-6 pb-10">
        <a href={withBase("/")} className={button.primary}>
          <ArrowLeft className="h-4 w-4" />
          {copy.home}
        </a>
        <p className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-stone-600 dark:text-stone-400">
          <span>{copy.orTry}</span>
          {sections
            .filter((s) => s.id !== "home")
            .map((s) => (
              <a key={s.id} href={withBase(s.path)} className={textLink}>
                {t.nav[s.id]}
              </a>
            ))}
        </p>
      </div>
    </>
  );
}

export function NotFoundApp() {
  return (
    <SiteShell current={null}>
      <NotFoundPage />
    </SiteShell>
  );
}

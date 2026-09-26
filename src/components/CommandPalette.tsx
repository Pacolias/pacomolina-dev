import { useEffect, useMemo, useRef, useState, type ComponentType } from "react";
import {
  Briefcase,
  CalendarDays,
  Copy,
  Download,
  FileText,
  FolderGit2,
  Home,
  Languages,
  Search,
  SunMoon,
  User,
} from "lucide-react";
import { projects } from "../data/projects";
import { jobs } from "../data/work";
import { readBlogIndex } from "../data/blogIndex";
import { sections, site, withBase } from "../data/site";
import { useLanguage } from "./LanguageProvider";
import { useTheme } from "./ThemeProvider";
import { focusRing } from "./ui";

// Ctrl/⌘+K: jump to any page, project, job or blog entry, or run a small
// action (theme, language, CV, copy email). Desktop-first: the nav only
// shows its trigger button from `sm` up, but the shortcut works anywhere.

type Group = "page" | "project" | "job" | "post" | "action";
type Item = {
  id: string;
  group: Group;
  title: string;
  subtitle?: string;
  // Extra words matched but not shown (both languages, stack…).
  keywords?: string;
  Icon: ComponentType<{ className?: string }>;
  run: () => void;
};

const GROUP_ORDER: Group[] = ["page", "project", "job", "post", "action"];

// Lowercase and strip accents, so "matematicas" finds "Matemáticas".
const normalize = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

const go = (path: string) => {
  window.location.href = withBase(path);
};

export function CommandPalette() {
  const { t, lang, toggle: toggleLang } = useLanguage();
  const { toggle: toggleTheme } = useTheme();
  const copy = t.search;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [notice, setNotice] = useState("");

  // Global shortcut, plus the nav button (which dispatches "open-search").
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && !e.altKey && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("open-search", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("open-search", onOpen);
    };
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      setQuery("");
      setActive(0);
      setNotice("");
      dialog.showModal();
      inputRef.current?.focus();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const items = useMemo<Item[]>(() => {
    // Built only while open: blog entries come from the client-only
    // #blog-index data, so rendering them in the (server) prerender would
    // mismatch on hydration.
    if (!open) return [];
    const pageIcons: Record<string, Item["Icon"]> = {
      home: Home,
      projects: FolderGit2,
      work: Briefcase,
      blog: FileText,
      about: User,
    };
    const pages: Item[] = [
      ...sections.map((s) => ({
        id: `page-${s.id}`,
        group: "page" as const,
        title: t.nav[s.id],
        Icon: pageIcons[s.id],
        run: () => go(s.path),
      })),
      {
        id: "page-now",
        group: "page",
        title: t.pages.now.title,
        subtitle: t.pages.now.subtitle,
        keywords: "now ahora",
        Icon: CalendarDays,
        run: () => go("/now/"),
      },
    ];
    const projectItems: Item[] = projects.map((p) => ({
      id: `project-${p.slug}`,
      group: "project",
      title: p.name,
      subtitle: p.blurb[lang],
      keywords: `${p.tagline.en} ${p.tagline.es} ${p.stack.join(" ")}`,
      Icon: FolderGit2,
      run: () => go(`/projects/#${p.slug}`),
    }));
    const jobItems: Item[] = jobs.map((j) => ({
      id: `job-${j.company}`,
      group: "job",
      title: j.company,
      subtitle: j.role[lang],
      keywords: `${j.role.en} ${j.role.es} ${j.stack.join(" ")}`,
      Icon: Briefcase,
      run: () => go(`/work/#${j.company.toLowerCase()}`),
    }));
    const postItems: Item[] = readBlogIndex().map((post) => {
      const v = post.versions[lang] ?? post.versions.en ?? post.versions.es!;
      const other = post.versions[lang === "en" ? "es" : "en"];
      return {
        id: `post-${post.slug}`,
        group: "post",
        title: v.title,
        subtitle: t.pages.blog.types[post.type],
        keywords: `${other?.title ?? ""} ${v.description} ${post.project?.name ?? ""}`,
        Icon: FileText,
        run: () => go(post.hasPage ? `/blog/${post.slug}/` : `/blog/#${post.slug}`),
      };
    });
    const actions: Item[] = [
      { id: "action-theme", group: "action", title: copy.actions.theme, keywords: "theme tema dark light oscuro claro", Icon: SunMoon, run: () => { toggleTheme(); setOpen(false); } },
      { id: "action-lang", group: "action", title: copy.actions.lang, keywords: "language idioma english español", Icon: Languages, run: () => { toggleLang(); setOpen(false); } },
      {
        id: "action-cv",
        group: "action",
        title: copy.actions.cv,
        keywords: "cv resume curriculum",
        Icon: Download,
        run: () => {
          const a = document.createElement("a");
          a.href = site.cvHref;
          a.download = "";
          a.click();
          setOpen(false);
        },
      },
      {
        id: "action-email",
        group: "action",
        title: copy.actions.email,
        subtitle: site.email,
        keywords: "email correo contact contacto",
        Icon: Copy,
        run: () => {
          navigator.clipboard?.writeText(site.email).then(
            () => setNotice(copy.actions.emailCopied),
            () => {}
          );
        },
      },
    ];
    return [...pages, ...projectItems, ...jobItems, ...postItems, ...actions];
    // `t` changes with `lang`.
  }, [open, t, lang, copy, toggleLang, toggleTheme]);

  const results = useMemo(() => {
    const words = normalize(query).split(/\s+/).filter(Boolean);
    const matched = words.length
      ? items.filter((item) => {
          const hay = normalize(`${item.title} ${item.subtitle ?? ""} ${item.keywords ?? ""}`);
          return words.every((w) => hay.includes(w));
        })
      : items;
    // Grouped in a fixed order, so arrow keys follow what's on screen.
    return GROUP_ORDER.flatMap((g) => matched.filter((i) => i.group === g));
  }, [items, query]);

  useEffect(() => {
    setActive(0);
    setNotice("");
  }, [query]);

  // Keep the highlighted row in view while arrowing through a long list.
  useEffect(() => {
    dialogRef.current
      ?.querySelector(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const onInputKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      results[active]?.run();
    }
  };

  let lastGroup: Group | null = null;

  return (
    <dialog
      ref={dialogRef}
      aria-label={copy.label}
      onClose={() => setOpen(false)}
      onClick={(e) => {
        if (e.target === dialogRef.current) setOpen(false);
      }}
      className="m-0 h-dvh max-h-none w-screen max-w-none bg-transparent p-4 backdrop:bg-stone-950/40 backdrop:backdrop-blur-sm sm:pt-[12vh]"
    >
      <div className="mx-auto flex max-h-[70vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-amber-100 bg-white shadow-xl shadow-stone-900/10 dark:border-stone-800 dark:bg-stone-900">
        <div className="flex items-center gap-3 border-b border-stone-100 px-4 dark:border-stone-800">
          <Search className="h-4 w-4 shrink-0 text-stone-400" aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onInputKey}
            placeholder={copy.placeholder}
            aria-label={copy.label}
            role="combobox"
            aria-expanded="true"
            aria-controls="search-results"
            aria-activedescendant={results[active] ? `search-${results[active].id}` : undefined}
            className="h-12 w-full bg-transparent text-sm text-stone-900 outline-none placeholder:text-stone-400 dark:text-stone-100"
          />
          <kbd className="hidden shrink-0 rounded border border-stone-200 px-1.5 py-0.5 text-[10px] text-stone-400 sm:inline dark:border-stone-700">
            Esc
          </kbd>
        </div>
        <ul id="search-results" role="listbox" className="flex-1 overflow-y-auto p-2">
          {open && results.length === 0 && (
            <li className="px-3 py-6 text-center text-sm text-stone-500 dark:text-stone-400">
              {copy.empty}
            </li>
          )}
          {results.map((item, i) => {
            const header = item.group !== lastGroup ? copy.groups[item.group] : null;
            lastGroup = item.group;
            const selected = i === active;
            return (
              <li key={item.id} role="presentation">
                {header && (
                  <p className="px-3 pt-3 pb-1 text-[11px] font-medium uppercase tracking-wider text-stone-400 dark:text-stone-500">
                    {header}
                  </p>
                )}
                <button
                  type="button"
                  id={`search-${item.id}`}
                  role="option"
                  aria-selected={selected}
                  data-index={i}
                  tabIndex={-1}
                  onMouseMove={() => setActive(i)}
                  onClick={() => item.run()}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left ${focusRing} ${
                    selected ? "bg-amber-50 dark:bg-stone-800" : ""
                  }`}
                >
                  <item.Icon className="h-4 w-4 shrink-0 text-amber-700 dark:text-amber-400" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-stone-900 dark:text-stone-100">
                      {item.title}
                    </span>
                    {item.subtitle && (
                      <span className="block truncate text-xs text-stone-500 dark:text-stone-400">
                        {item.subtitle}
                      </span>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <p
          role="status"
          aria-live="polite"
          className="border-t border-stone-100 px-4 py-2 text-[11px] text-stone-400 dark:border-stone-800 dark:text-stone-500"
        >
          {notice || copy.hint}
        </p>
      </div>
    </dialog>
  );
}

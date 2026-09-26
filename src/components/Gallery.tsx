import { useEffect, useState } from "react";
import { ImageOff } from "lucide-react";
import type { Lang, Localized } from "../data/i18n";
import { useLanguage } from "./LanguageProvider";
import { useTheme } from "./ThemeProvider";
import { Lightbox } from "./Lightbox";
import { useRevealed } from "./Collapsible";
import { focusRing } from "./ui";

type Theme = "light" | "dark";

// A screenshot can follow the page's look: one file, one per language, one
// per theme, or one per theme *and* language — so a Spanish/dark visitor sees
// the app itself in Spanish/dark.
type LocalizedSrc = string | Localized;
export type ImageSource = LocalizedSrc | Record<Theme, LocalizedSrc>;

export type GalleryImage = {
  src: ImageSource;
  alt: Localized;
  width: number;
  height: number;
  caption?: Localized;
};

// What the Lightbox shows: a single, already-resolved file.
export type LightboxImage = Omit<GalleryImage, "src"> & { src: string };

function isThemed(src: ImageSource): src is Record<Theme, LocalizedSrc> {
  return typeof src === "object" && "light" in src;
}

function pickLang(src: LocalizedSrc, lang: Lang) {
  return typeof src === "string" ? src : src[lang];
}

export function resolveImageSrc(src: ImageSource, theme: Theme, lang: Lang) {
  return pickLang(isThemed(src) ? src[theme] : src, lang);
}

// True from the first client render after hydration on. Variant images wait
// for it: the prerendered HTML only knows English/light, so putting a `src` in
// it would make every other visitor download a variant they never see. The
// providers' detected theme/lang and this flag are all set from mount effects,
// which React batches into one render, so the first <img> is already right.
function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}

// One image fills the width; several become a swipeable scroll-snap strip
// (each slide ~85% wide so the next one peeks in and signals "swipe").
// Tapping an image opens it in the in-page Lightbox; the link to the file
// is kept as a no-JS fallback (and for middle-click / "open in new tab").
export function Gallery({
  images,
  eager = false,
}: {
  images: GalleryImage[];
  eager?: boolean;
}) {
  const { t, lang } = useLanguage();
  const { theme } = useTheme();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  // Images that failed to load (typically: offline, never seen before, so
  // not in the service worker's cache) show a quiet placeholder instead of
  // the browser's broken-image alt text.
  const [failed, setFailed] = useState<Set<string>>(() => new Set());
  const hydrated = useHydrated();
  // Inside a panel that was never opened: keep the space, skip the download.
  const revealed = useRevealed();
  if (images.length === 0) return null;
  const single = images.length === 1;
  const imgClass = "h-auto w-full transition-transform duration-500 hover:scale-[1.02]";

  return (
    <>
      <ul
        className={
          single
            ? "block"
            : "no-scrollbar -mx-6 flex snap-x snap-mandatory gap-3 overflow-x-auto px-6 sm:-mx-8 sm:px-8"
        }
      >
        {images.map((image, i) => {
          const common = {
            alt: image.alt[lang],
            width: image.width,
            height: image.height,
            decoding: "async" as const,
          };
          return (
            <li
              key={image.alt.en}
              className={single ? "" : "w-[85%] shrink-0 snap-center sm:w-[80%]"}
            >
              <figure>
                <a
                  href={resolveImageSrc(image.src, theme, lang)}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={`${t.lightbox.open}: ${image.alt[lang]}`}
                  onClick={(e) => {
                    // Let modified clicks (new tab/window) behave as links.
                    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                    e.preventDefault();
                    setOpenIndex(i);
                  }}
                  className={`block cursor-zoom-in overflow-hidden rounded-2xl border border-stone-200 bg-stone-100 dark:border-stone-800 dark:bg-stone-800 ${focusRing}`}
                >
                  {failed.has(resolveImageSrc(image.src, theme, lang)) ? (
                    <div
                      style={{ aspectRatio: `${image.width} / ${image.height}` }}
                      className="flex w-full items-center justify-center text-stone-400 dark:text-stone-600"
                    >
                      <ImageOff className="h-6 w-6" aria-hidden="true" />
                      <span className="sr-only">{image.alt[lang]}</span>
                    </div>
                  ) : revealed && (typeof image.src === "string" || hydrated) ? (
                    <img
                      {...common}
                      src={resolveImageSrc(image.src, theme, lang)}
                      loading={eager && i === 0 ? "eager" : "lazy"}
                      onError={() => {
                        const src = resolveImageSrc(image.src, theme, lang);
                        setFailed((prev) => new Set(prev).add(src));
                      }}
                      className={imgClass}
                    />
                  ) : (
                    // Same box the image will fill, so nothing shifts.
                    <div
                      aria-hidden="true"
                      style={{ aspectRatio: `${image.width} / ${image.height}` }}
                      className="w-full"
                    />
                  )}
                </a>
                {image.caption && (
                  <figcaption className="mt-2 text-xs text-stone-500 dark:text-stone-400">
                    {image.caption[lang]}
                  </figcaption>
                )}
              </figure>
            </li>
          );
        })}
      </ul>
      <Lightbox
        images={images.map((image) => ({
          ...image,
          src: resolveImageSrc(image.src, theme, lang),
        }))}
        index={openIndex}
        onIndexChange={setOpenIndex}
        onClose={() => setOpenIndex(null)}
      />
    </>
  );
}

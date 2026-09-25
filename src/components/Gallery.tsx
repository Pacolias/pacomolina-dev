import { useState } from "react";
import type { Localized } from "../data/i18n";
import { useLanguage } from "./LanguageProvider";
import { Lightbox } from "./Lightbox";
import { focusRing } from "./ui";

export type GalleryImage = {
  src: string;
  alt: Localized;
  width: number;
  height: number;
  caption?: Localized;
};

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
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  if (images.length === 0) return null;
  const single = images.length === 1;

  return (
    <>
      <ul
        className={
          single
            ? "block"
            : "no-scrollbar -mx-6 flex snap-x snap-mandatory gap-3 overflow-x-auto px-6 sm:-mx-8 sm:px-8"
        }
      >
        {images.map((image, i) => (
          <li
            key={image.src}
            className={single ? "" : "w-[85%] shrink-0 snap-center sm:w-[80%]"}
          >
            <figure>
              <a
                href={image.src}
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
                <img
                  src={image.src}
                  alt={image.alt[lang]}
                  width={image.width}
                  height={image.height}
                  loading={eager && i === 0 ? "eager" : "lazy"}
                  decoding="async"
                  className="h-auto w-full transition-transform duration-500 hover:scale-[1.02]"
                />
              </a>
              {image.caption && (
                <figcaption className="mt-2 text-xs text-stone-500 dark:text-stone-400">
                  {image.caption[lang]}
                </figcaption>
              )}
            </figure>
          </li>
        ))}
      </ul>
      <Lightbox
        images={images}
        index={openIndex}
        onIndexChange={setOpenIndex}
        onClose={() => setOpenIndex(null)}
      />
    </>
  );
}

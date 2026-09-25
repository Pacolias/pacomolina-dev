import { useEffect, useRef, type TouchEvent } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useLanguage } from "./LanguageProvider";
import type { LightboxImage } from "./Gallery";

// Full-screen image viewer. A native <dialog> opened with showModal() gives
// the top layer (escapes any card's overflow/stacking), a focus trap, Esc to
// close and inert page content for free; the page behind is blurred via
// ::backdrop. Arrow keys, the side buttons or a horizontal swipe move
// between images (wrapping around).
export function Lightbox({
  images,
  index,
  onIndexChange,
  onClose,
}: {
  images: LightboxImage[];
  index: number | null;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}) {
  const { t, lang } = useLanguage();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const touchStartX = useRef<number | null>(null);
  const open = index !== null;
  const many = images.length > 1;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // Lock page scroll while open (a modal dialog doesn't do this by itself).
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = previous;
    };
  }, [open]);

  const go = (delta: number) => {
    if (index === null) return;
    onIndexChange((index + delta + images.length) % images.length);
  };

  useEffect(() => {
    if (!open || !many) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const onTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: TouchEvent) => {
    if (touchStartX.current === null || !many) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
  };

  const image = index !== null ? images[index] : null;
  // No `display` utility here — each use adds `inline-flex` or
  // `hidden sm:inline-flex`, since both in one class list is order-dependent.
  const controlClass =
    "h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-stone-900/60 text-stone-100 backdrop-blur transition-colors duration-200 hover:bg-stone-800/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400";

  return (
    <dialog
      ref={dialogRef}
      aria-label={image ? image.alt[lang] : undefined}
      onClose={onClose}
      // Clicking anywhere that isn't the image or a control closes it.
      onClick={(e) => {
        if (!(e.target as HTMLElement).closest("img, button")) onClose();
      }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      className="m-0 h-dvh max-h-none w-screen max-w-none overflow-hidden bg-transparent p-0 text-stone-100 backdrop:animate-backdrop-in backdrop:bg-stone-950/60 backdrop:backdrop-blur-md"
    >
      {image && index !== null && (
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-4 pt-4 sm:px-6 sm:pt-6">
            <span className="text-sm font-medium tabular-nums text-stone-200">
              {many && `${index + 1} ${t.lightbox.of} ${images.length}`}
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label={t.lightbox.close}
              title={t.lightbox.close}
              className={`${controlClass} inline-flex`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 py-4 sm:px-20">
            <img
              key={image.src}
              src={image.src}
              alt={image.alt[lang]}
              width={image.width}
              height={image.height}
              className="max-h-full w-auto max-w-full animate-lightbox-in rounded-2xl object-contain shadow-2xl shadow-black/40"
            />
            {many && (
              <>
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label={t.lightbox.prev}
                  title={t.lightbox.prev}
                  className={`${controlClass} absolute left-5 top-1/2 hidden -translate-y-1/2 sm:inline-flex`}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label={t.lightbox.next}
                  title={t.lightbox.next}
                  className={`${controlClass} absolute right-5 top-1/2 hidden -translate-y-1/2 sm:inline-flex`}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>

          <div className="flex flex-col items-center gap-3 px-6 pb-6 text-center sm:pb-8">
            <p className="max-w-xl text-pretty text-sm leading-relaxed text-stone-200">
              {(image.caption ?? image.alt)[lang]}
            </p>
            {many && (
              // On phones the arrows live down here, next to the dots, so
              // they don't cover the image (swiping works too).
              <div className="flex items-center gap-5">
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label={t.lightbox.prev}
                  className={`${controlClass} inline-flex sm:hidden`}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <div className="flex gap-1.5" aria-hidden="true">
                  {images.map((img, i) => (
                    <span
                      key={img.src}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === index ? "w-4 bg-amber-400" : "w-1.5 bg-stone-400/60"
                      }`}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label={t.lightbox.next}
                  className={`${controlClass} inline-flex sm:hidden`}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </dialog>
  );
}

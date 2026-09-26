import { useEffect } from "react";
import { sections, withBase, type SectionId } from "../data/site";

// Horizontal swipe = previous/next section, in nav order (Home → Projects →
// Work → Blog → About). Not circular: nothing before Home, nothing after
// About. Deliberately conservative so it never fights the page:
// - ignores gestures that start in something that already handles
//   horizontal swipes (a scrollable strip like a gallery, an open dialog
//   such as the lightbox) or in form fields;
// - ignores the outer 24px, where iOS/Android have their own "back" swipe;
// - ignores multi-touch, pinch-zoomed pages and mostly-vertical gestures
//   (that's scrolling).
// The direction is handed to the next page (sessionStorage) so its view
// transition can slide that way instead of cross-fading (Layout.astro).

const EDGE = 24;
const MIN_DISTANCE = 70;
const MAX_DURATION = 800;

function scrollsHorizontally(el: Element) {
  const style = getComputedStyle(el);
  return (
    (style.overflowX === "auto" || style.overflowX === "scroll") &&
    el.scrollWidth > el.clientWidth + 1
  );
}

function startsInExcludedArea(target: EventTarget | null) {
  for (let el = target as Element | null; el && el !== document.body; el = el.parentElement) {
    if (el.matches("dialog, input, textarea, select, [contenteditable]")) return true;
    if (scrollsHorizontally(el)) return true;
  }
  return false;
}

export function useSwipeNavigation(current: SectionId | null) {
  useEffect(() => {
    if (current === null) return;
    const index = sections.findIndex((s) => s.id === current);
    let start: { x: number; y: number; t: number } | null = null;

    const onStart = (e: TouchEvent) => {
      start = null;
      if (e.touches.length !== 1) return;
      if ((window.visualViewport?.scale ?? 1) > 1.01) return;
      const touch = e.touches[0];
      if (touch.clientX < EDGE || touch.clientX > window.innerWidth - EDGE) return;
      if (startsInExcludedArea(e.target)) return;
      start = { x: touch.clientX, y: touch.clientY, t: performance.now() };
    };

    const onEnd = (e: TouchEvent) => {
      if (!start) return;
      const touch = e.changedTouches[0];
      const dx = touch.clientX - start.x;
      const dy = touch.clientY - start.y;
      const quick = performance.now() - start.t <= MAX_DURATION;
      start = null;
      if (!quick || Math.abs(dx) < MIN_DISTANCE || Math.abs(dy) > Math.abs(dx) * 0.6) return;

      // Finger moving left = go forward (next section), right = back.
      const direction = dx < 0 ? "next" : "prev";
      const target = sections[index + (direction === "next" ? 1 : -1)];
      if (!target) return; // first/last section: not circular
      try {
        sessionStorage.setItem("swipe-nav", direction);
      } catch {
        // Without storage the page still changes, just with the plain fade.
      }
      window.location.href = withBase(target.path);
    };

    const onCancel = () => {
      start = null;
    };

    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchend", onEnd, { passive: true });
    window.addEventListener("touchcancel", onCancel, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchend", onEnd);
      window.removeEventListener("touchcancel", onCancel);
    };
  }, [current]);
}

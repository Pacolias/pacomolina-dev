import { useEffect, useRef, useState, type ComponentType } from "react";
import { sections, withBase, type SectionId } from "../data/site";

// Swipe between sections, in nav order (Home → Projects → Work → Blog →
// About), with the neighbouring page visible while you drag:
// - the current page follows the finger and the real neighbour page (its
//   actual component, in the visitor's language/theme) slides in beside it;
// - released past a threshold (or flicked), it finishes the slide and
//   navigates; otherwise it springs back;
// - not circular: nothing before Home or after About — at the ends the page
//   gives a little (rubber band) and springs back.
// It claims the gesture (preventDefault on touchmove) only once it's clearly
// horizontal, so vertical scrolling is untouched and the browser can't
// cancel the touch midway (the passive, measure-at-the-end version was
// losing gestures that way on real phones, notably on short pages).
// Stays out of the way of things that already swipe (a scrollable strip
// like a gallery, an open dialog), form fields, the screen edges the OS
// uses for "back", pinch zoom and multi-touch.

const EDGE = 24;
const LOCK_DISTANCE = 10;
const COMMIT_FRACTION = 0.28;
const FLICK_VELOCITY = 0.5; // px/ms
const SETTLE_MS = 220;

type Direction = "prev" | "next";
type PageComponent = ComponentType;

const loaders: Record<SectionId, () => Promise<PageComponent>> = {
  home: () => import("./pages/HomePage").then((m) => m.HomePage),
  projects: () => import("./pages/ProjectsPage").then((m) => m.ProjectsPage),
  work: () => import("./pages/WorkPage").then((m) => m.WorkPage),
  blog: () => import("./pages/BlogPages").then((m) => m.BlogIndexPreview),
  about: () => import("./pages/AboutPage").then((m) => m.AboutPage),
};

function scrollsHorizontally(el: Element) {
  const style = getComputedStyle(el);
  return (
    (style.overflowX === "auto" || style.overflowX === "scroll") &&
    el.scrollWidth > el.clientWidth + 1
  );
}

function startsInExcludedArea(target: EventTarget | null) {
  for (let el = target as Element | null; el && el !== document.documentElement; el = el.parentElement) {
    if (el.matches("dialog, input, textarea, select, [contenteditable]")) return true;
    if (scrollsHorizontally(el)) return true;
  }
  return false;
}

const prefersReducedMotion = () =>
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

export function useSwipeNavigation(current: SectionId | null) {
  // The page's own content (below the nav), moved with the finger.
  const contentRef = useRef<HTMLDivElement>(null);
  // The fixed layer holding the neighbour page while dragging.
  const previewRef = useRef<HTMLDivElement>(null);
  const [preview, setPreview] = useState<{ direction: Direction; Page: PageComponent } | null>(
    null
  );
  const loaded = useRef<Partial<Record<SectionId, PageComponent>>>({});

  const index = current === null ? -1 : sections.findIndex((s) => s.id === current);
  const neighbour = (direction: Direction) =>
    index < 0 ? undefined : sections[index + (direction === "next" ? 1 : -1)];

  // Warm up both neighbours when the browser is idle, so the preview can
  // render the moment a swipe starts.
  useEffect(() => {
    if (index < 0) return;
    const load = () => {
      for (const direction of ["prev", "next"] as const) {
        const section = neighbour(direction);
        if (section && !loaded.current[section.id]) {
          loaders[section.id]().then((Page) => {
            loaded.current[section.id] = Page;
          });
        }
      }
    };
    const w = window as typeof window & {
      requestIdleCallback?: (cb: () => void) => number;
    };
    if (w.requestIdleCallback) w.requestIdleCallback(load);
    else setTimeout(load, 300);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  useEffect(() => {
    if (index < 0) return;
    const content = contentRef.current;
    if (!content) return;

    let start: { x: number; y: number; t: number } | null = null;
    let mode: "pending" | "horizontal" | "ignored" = "ignored";
    let direction: Direction | null = null;
    let dx = 0;
    let width = window.innerWidth;

    const setX = (x: number, animate: boolean) => {
      const transition = animate && !prefersReducedMotion() ? `transform ${SETTLE_MS}ms cubic-bezier(0.2, 0.8, 0.2, 1)` : "none";
      content.style.transition = transition;
      content.style.transform = x === 0 ? "" : `translate3d(${x}px, 0, 0)`;
      const layer = previewRef.current;
      if (layer && direction) {
        layer.style.transition = transition;
        const offset = direction === "next" ? width : -width;
        layer.style.transform = `translate3d(${x + offset}px, 0, 0)`;
      }
    };

    const reset = () => {
      start = null;
      mode = "ignored";
      direction = null;
      dx = 0;
      content.style.transition = "none";
      content.style.transform = "";
      setPreview(null);
    };

    const springBack = () => {
      setX(0, true);
      window.setTimeout(reset, prefersReducedMotion() ? 0 : SETTLE_MS);
    };

    const onStart = (e: TouchEvent) => {
      mode = "ignored";
      if (e.touches.length !== 1) return;
      if ((window.visualViewport?.scale ?? 1) > 1.01) return;
      const touch = e.touches[0];
      width = window.innerWidth;
      if (touch.clientX < EDGE || touch.clientX > width - EDGE) return;
      if (startsInExcludedArea(e.target)) return;
      start = { x: touch.clientX, y: touch.clientY, t: performance.now() };
      mode = "pending";
    };

    const onMove = (e: TouchEvent) => {
      if (mode === "ignored" || !start) return;
      if (e.touches.length !== 1) {
        if (mode === "horizontal") springBack();
        mode = "ignored";
        return;
      }
      const touch = e.touches[0];
      const mx = touch.clientX - start.x;
      const my = touch.clientY - start.y;

      if (mode === "pending") {
        if (Math.abs(my) > LOCK_DISTANCE && Math.abs(my) >= Math.abs(mx)) {
          mode = "ignored"; // a vertical scroll: leave it alone
          return;
        }
        if (Math.abs(mx) < LOCK_DISTANCE || Math.abs(mx) < Math.abs(my) * 1.2) return;
        mode = "horizontal";
        direction = mx < 0 ? "next" : "prev";
        const section = neighbour(direction);
        const Page = section && loaded.current[section.id];
        if (Page) setPreview({ direction, Page });
      }

      e.preventDefault();
      const current = mx < 0 ? "next" : "prev";
      // Changed direction mid-drag: swap which neighbour is shown.
      if (current !== direction) {
        direction = current;
        const section = neighbour(direction);
        const Page = section && loaded.current[section.id];
        setPreview(Page ? { direction, Page } : null);
      }
      // No neighbour that way (first/last section): resist, don't follow.
      dx = neighbour(direction) ? mx : mx * 0.25;
      setX(dx, false);
    };

    const onEnd = () => {
      if (mode !== "horizontal" || !start || !direction) {
        mode = "ignored";
        return;
      }
      const elapsed = performance.now() - start.t;
      const velocity = Math.abs(dx) / Math.max(elapsed, 1);
      const target = neighbour(direction);
      const commit =
        target &&
        loaded.current[target.id] !== undefined &&
        (Math.abs(dx) > width * COMMIT_FRACTION || (velocity > FLICK_VELOCITY && Math.abs(dx) > 40));
      mode = "ignored";
      if (!commit || !target) {
        springBack();
        return;
      }
      setX(direction === "next" ? -width : width, true);
      window.setTimeout(
        () => {
          try {
            // The next page is already on screen (the preview): the view
            // transition just settles into it (Layout.astro).
            sessionStorage.setItem("swipe-nav", "commit");
          } catch {
            // Without storage it still navigates, with the plain fade.
          }
          window.location.href = withBase(target.path);
        },
        prefersReducedMotion() ? 0 : SETTLE_MS
      );
    };

    const onCancel = () => {
      if (mode === "horizontal") springBack();
      mode = "ignored";
    };

    // Coming back with the browser's back button can restore this page
    // from the back/forward cache mid-slide: put it back in place.
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) reset();
    };

    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onEnd, { passive: true });
    window.addEventListener("touchcancel", onCancel, { passive: true });
    window.addEventListener("pageshow", onPageShow);
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
      window.removeEventListener("touchcancel", onCancel);
      window.removeEventListener("pageshow", onPageShow);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  return { contentRef, previewRef, preview };
}

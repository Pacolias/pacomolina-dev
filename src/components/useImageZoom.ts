import { useEffect, useRef, useState, type RefObject } from "react";

// Zoom and pan for the lightbox image:
//   - phones: pinch with two fingers (zooms around them, and moving them
//     pans), drag with one finger once zoomed, double-tap to zoom in/out;
//   - desktop: mouse wheel (or trackpad pinch) around the cursor,
//     double-click to zoom in on that spot / back out, drag to pan;
//   - keyboard: + / - / 0.
// The transform is written straight to the <img> (origin top-left,
// translate + scale), not through state, so gestures stay at 60fps; the
// image can't be dragged past its own edges. `resetKey` (the image's src)
// resets it when the lightbox moves to another image.

const MAX = 4;
const DOUBLE = 2.5; // double-click / double-tap zoom
const TAP_MS = 300;

type View = { s: number; x: number; y: number };
type Point = { x: number; y: number };

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
const dist = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
const mid = (a: Point, b: Point) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });

export function useImageZoom(
  areaRef: RefObject<HTMLElement | null>,
  imgRef: RefObject<HTMLImageElement | null>,
  // Listeners are attached while this is true (the lightbox is open).
  active: boolean,
  resetKey: unknown
) {
  const view = useRef<View>({ s: 1, x: 0, y: 0 });
  const [zoomed, setZoomed] = useState(false);
  // The last gesture moved (a pan/pinch, not a tap): its click is ignored.
  const dragged = useRef(false);
  const lastPointerType = useRef("mouse");

  // The image's untransformed box, in viewport coordinates.
  const box = () => {
    const img = imgRef.current!;
    const area = areaRef.current!.getBoundingClientRect();
    return { L: area.left + img.offsetLeft, T: area.top + img.offsetTop, w: img.offsetWidth, h: img.offsetHeight };
  };

  const apply = (next: View, animate: boolean) => {
    const img = imgRef.current;
    if (!img) return;
    const { w, h } = box();
    const s = clamp(next.s, 1, MAX);
    const v = { s, x: clamp(next.x, w * (1 - s), 0), y: clamp(next.y, h * (1 - s), 0) };
    view.current = v;
    img.style.transformOrigin = "0 0";
    img.style.transition = animate ? "transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)" : "none";
    img.style.transform = s === 1 ? "" : `translate(${v.x}px, ${v.y}px) scale(${s})`;
    setZoomed(s > 1);
  };

  // Zoom to `s`, keeping the image point under (cx, cy) where it is.
  const zoomAt = (cx: number, cy: number, s: number, animate: boolean) => {
    const { L, T } = box();
    const c = view.current;
    const u = (cx - L - c.x) / c.s;
    const v = (cy - T - c.y) / c.s;
    apply({ s, x: cx - L - s * u, y: cy - T - s * v }, animate);
  };

  const reset = (animate = true) => apply({ s: 1, x: 0, y: 0 }, animate);

  const toggleAt = (cx: number, cy: number) => {
    if (view.current.s > 1) reset();
    else zoomAt(cx, cy, DOUBLE, true);
  };

  const zoomCenter = (factor: number) => {
    const { L, T, w, h } = box();
    zoomAt(L + w / 2, T + h / 2, view.current.s * factor, true);
  };

  useEffect(() => {
    view.current = { s: 1, x: 0, y: 0 };
    setZoomed(false);
  }, [resetKey]);

  useEffect(() => {
    const area = areaRef.current;
    if (!active || !area) return;
    const pointers = new Map<number, Point>();
    let pinch: { d0: number; s0: number; u: number; v: number } | null = null;
    let pan: { start: Point; x0: number; y0: number } | null = null;
    let downAt: Point | null = null;
    let lastTap = { t: 0, x: 0, y: 0 };

    const startPan = (p: Point) => {
      pan = { start: p, x0: view.current.x, y0: view.current.y };
    };
    const startPinch = () => {
      const [a, b] = [...pointers.values()];
      const m = mid(a, b);
      const { L, T } = box();
      const c = view.current;
      pinch = { d0: dist(a, b) || 1, s0: c.s, u: (m.x - L - c.x) / c.s, v: (m.y - T - c.y) / c.s };
      pan = null;
    };

    const onDown = (e: PointerEvent) => {
      if (!imgRef.current || (e.target as HTMLElement).closest("button")) return;
      if (e.pointerType === "mouse" && e.button !== 0) return;
      lastPointerType.current = e.pointerType;
      const p = { x: e.clientX, y: e.clientY };
      pointers.set(e.pointerId, p);
      area.setPointerCapture?.(e.pointerId);
      if (pointers.size === 1) {
        downAt = p;
        dragged.current = false;
        if (view.current.s > 1) startPan(p);
      } else if (pointers.size === 2) {
        dragged.current = true;
        startPinch();
      }
    };

    const onMove = (e: PointerEvent) => {
      if (!pointers.has(e.pointerId)) return;
      const p = { x: e.clientX, y: e.clientY };
      pointers.set(e.pointerId, p);
      if (downAt && dist(p, downAt) > 6) dragged.current = true;
      if (pinch && pointers.size >= 2) {
        const [a, b] = [...pointers.values()];
        const m = mid(a, b);
        const s = clamp((pinch.s0 * dist(a, b)) / pinch.d0, 1, MAX);
        const { L, T } = box();
        apply({ s, x: m.x - L - s * pinch.u, y: m.y - T - s * pinch.v }, false);
      } else if (pan) {
        apply(
          { s: view.current.s, x: pan.x0 + p.x - pan.start.x, y: pan.y0 + p.y - pan.start.y },
          false
        );
      }
    };

    const onUp = (e: PointerEvent) => {
      if (!pointers.has(e.pointerId)) return;
      const p = { x: e.clientX, y: e.clientY };
      pointers.delete(e.pointerId);
      if (pointers.size === 1) {
        // Pinch → one finger left: keep panning from where it is.
        pinch = null;
        if (view.current.s > 1) startPan([...pointers.values()][0]);
        return;
      }
      if (pointers.size > 0) return;
      pinch = null;
      pan = null;
      downAt = null;
      // Double-tap (touch only; mice get the native dblclick).
      if (e.type === "pointerup" && e.pointerType !== "mouse" && !dragged.current) {
        const now = performance.now();
        if (now - lastTap.t < TAP_MS && Math.hypot(p.x - lastTap.x, p.y - lastTap.y) < 40) {
          toggleAt(p.x, p.y);
          lastTap = { t: 0, x: 0, y: 0 };
          dragged.current = true; // not a click that closes/resets
        } else {
          lastTap = { t: now, x: p.x, y: p.y };
        }
      }
    };

    const onWheel = (e: WheelEvent) => {
      if (!imgRef.current) return;
      e.preventDefault();
      const delta = e.deltaY * (e.deltaMode === 1 ? 16 : 1);
      zoomAt(e.clientX, e.clientY, view.current.s * Math.exp(-delta * 0.002), false);
    };

    const onDblClick = (e: MouseEvent) => {
      if (lastPointerType.current !== "mouse" || (e.target as HTMLElement).closest("button")) return;
      toggleAt(e.clientX, e.clientY);
    };

    const onResize = () => reset(false);

    area.addEventListener("pointerdown", onDown);
    area.addEventListener("pointermove", onMove);
    area.addEventListener("pointerup", onUp);
    area.addEventListener("pointercancel", onUp);
    area.addEventListener("wheel", onWheel, { passive: false });
    area.addEventListener("dblclick", onDblClick);
    window.addEventListener("resize", onResize);
    return () => {
      area.removeEventListener("pointerdown", onDown);
      area.removeEventListener("pointermove", onMove);
      area.removeEventListener("pointerup", onUp);
      area.removeEventListener("pointercancel", onUp);
      area.removeEventListener("wheel", onWheel);
      area.removeEventListener("dblclick", onDblClick);
      window.removeEventListener("resize", onResize);
    };
    // Only the refs and stable setters are used inside, so the listeners
    // (and an ongoing gesture's state) survive re-renders.
  }, [active]);

  return {
    zoomed,
    isZoomed: () => view.current.s > 1,
    // True once per gesture that moved: its trailing click shouldn't act.
    consumeDrag: () => {
      const d = dragged.current;
      dragged.current = false;
      return d;
    },
    reset,
    zoomIn: () => zoomCenter(1.5),
    zoomOut: () => zoomCenter(1 / 1.5),
  };
}

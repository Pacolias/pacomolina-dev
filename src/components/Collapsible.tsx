import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

// Whether the content is (or has been) visible. Galleries read it to hold off
// downloading images inside a panel that was never opened: a collapsed panel
// is 0px tall but still "in the viewport", so `loading="lazy"` alone doesn't
// stop the browser fetching every photo on the page. Outside any Collapsible
// it's true.
const RevealedContext = createContext(true);
export const useRevealed = () => useContext(RevealedContext);

// Smoothly expands/collapses to its content's real height, both ways: a
// one-row grid animating `grid-template-rows` between 0fr and 1fr (no height
// measuring in JS). While closed the content is `inert` — out of the tab
// order and the accessibility tree, like `hidden` was.
//
// The clipping wrapper needs `overflow: hidden`, which would also cut off
// anything bleeding past the panel on purpose (a Gallery strip scrolls
// edge-to-edge of its card) — `bleed` pads it back out to the card's edges.
export function Collapsible({
  id,
  open,
  bleed = false,
  className = "",
  children,
}: {
  id?: string;
  open: boolean;
  bleed?: boolean;
  className?: string;
  children: ReactNode;
}) {
  // Stays true after the first opening, so closing doesn't unload anything.
  const [revealed, setRevealed] = useState(open);
  useEffect(() => {
    if (open) setRevealed(true);
  }, [open]);

  return (
    <div
      id={id}
      inert={!open}
      className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none ${
        open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
      }`}
    >
      <div className={`min-h-0 overflow-hidden ${bleed ? "-mx-6 px-6 sm:-mx-8 sm:px-8" : ""}`}>
        <div className={className}>
          <RevealedContext.Provider value={revealed}>{children}</RevealedContext.Provider>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Horizontal scroller with real arrows.
 *
 * Founder feedback, 2026-08-25: "images from the catalogue are perfectly
 * aligned with the phone screen. People think there are only two pieces in our
 * catalogue." Measured and true -- at 390px exactly one card is fully visible
 * with one peeking, and the edge fade reads as a crop rather than as "there is
 * more". Eight pieces looked like two, on the page most traffic lands on.
 *
 * Desktop was worse in a quieter way: five cards visible, three off-screen, and
 * no affordance at all. A trackpad user can swipe horizontally; a mouse user
 * has nothing. That is three of eight garments invisible to anyone on a laptop.
 *
 * The arrows show on every size rather than desktop-only, because the phone is
 * where the misreading was actually reported.
 */
export default function ProductRailScroller({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    // "At start" is NOT scrollLeft === 0. The container is padded (px-6, and a
    // much larger calc() from sm up) and snap-mandatory rests the first card
    // against that padding, so the resting scrollLeft is the first card's
    // offsetLeft -- measured at 24 on a phone. Comparing against 0 left the
    // back arrow looking available before anyone had scrolled anywhere.
    // Reading the offset from the DOM keeps this correct at every breakpoint
    // rather than hardcoding a padding that changes.
    const firstCard = el.querySelector<HTMLElement>(":scope > div");
    const restingLeft = firstCard ? firstCard.offsetLeft : 0;
    setAtStart(el.scrollLeft <= restingLeft + 2);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 2);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    update();
    el.addEventListener("scroll", update, { passive: true });
    // Card width is viewport-dependent, so the end state changes on resize.
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update]);

  function scrollBy(direction: 1 | -1) {
    const el = ref.current;
    if (!el) return;
    // One card plus its gap, measured from the DOM rather than hardcoded, so
    // this keeps working when the card width changes at a breakpoint.
    const card = el.querySelector<HTMLElement>(":scope > div");
    const step = card ? card.offsetWidth + 20 : Math.round(el.clientWidth * 0.8);
    el.scrollBy({ left: step * direction, behavior: "smooth" });
  }

  const arrow =
    "absolute top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-border bg-white/95 text-text shadow-[var(--shadow)] backdrop-blur-sm transition-opacity hover:bg-white disabled:pointer-events-none disabled:opacity-0 [@media(min-width:0px)]:grid";

  return (
    <div className="relative">
      <div
        ref={ref}
        role="group"
        aria-label={label}
        className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-3 sm:px-[max(1.5rem,calc((100vw-72rem)/2))]"
      >
        {children}
      </div>

      <button
        type="button"
        onClick={() => scrollBy(-1)}
        disabled={atStart}
        aria-label="Previous pieces"
        className={`${arrow} left-2 sm:left-4`}
      >
        <span aria-hidden>&#8249;</span>
      </button>
      <button
        type="button"
        onClick={() => scrollBy(1)}
        disabled={atEnd}
        aria-label="Next pieces"
        className={`${arrow} right-2 sm:right-4`}
      >
        <span aria-hidden>&#8250;</span>
      </button>
    </div>
  );
}

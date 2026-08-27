"use client";

import { useEffect, useState } from "react";

/**
 * A way back up, for a page that is long on purpose.
 *
 * The home page runs hero → concept → demo → eight product cards → why choose
 * us → FAQ, and the catalogue is in the middle of it. Someone who has scrolled
 * the pieces and wants the menu again has a long way back, and on a phone the
 * nav bar scrolls away with everything else.
 *
 * Appears only after a screenful, so it is never on top of the hero, and it
 * scrolls rather than jumping so the customer keeps their bearings. Respects
 * prefers-reduced-motion, where an instant jump is the correct behaviour
 * rather than a degraded one.
 */
export default function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // A sentinel plus IntersectionObserver rather than a scroll listener: no
    // main-thread work on every scroll frame, which is the whole cost of this
    // kind of control done badly.
    const sentinel = document.createElement("div");
    sentinel.style.cssText = "position:absolute;top:100vh;height:1px;width:1px;pointer-events:none";
    document.body.appendChild(sentinel);
    const io = new IntersectionObserver(([e]) => setShow(!e.isIntersecting));
    io.observe(sentinel);
    return () => {
      io.disconnect();
      sentinel.remove();
    };
  }, []);

  if (!show) return null;

  return (
    <button
      type="button"
      onClick={() => {
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
      }}
      aria-label="Back to top"
      title="Back to top"
      className="fixed right-5 bottom-5 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-border-strong bg-white/95 text-text shadow-sm backdrop-blur-sm transition-colors hover:border-text hover:bg-text hover:text-white"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 19V5M12 5l-6 6M12 5l6 6"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

"use client";

import { useEffect, useId, useRef } from "react";

/**
 * PHONES ONLY: the bottom sheet that holds everything which used to be stacked
 * under Add to cart on a product page.
 *
 * Founder, 2026-11-20, on the page ads land on ("the page that makes our
 * customers flee"): "there are still too many things… overwhelming for the
 * customer… maybe a tab that opens with all the info on the side." She approved
 * a mockup: the first screen stays as it is, and Size, the special request,
 * All included and Product information move behind ONE row.
 *
 * ⚠️ ONE DOM TREE, TWO LAYOUTS, AND THAT IS DELIBERATE. From lg up this is a
 * plain block in the page flow: `.details-sheet` has no rules there and the
 * sheet's own chrome is lg:hidden, so desktop renders what it rendered before.
 * Below lg the same element is position:fixed (globals.css). It is not a
 * portal and not a second copy because:
 *   - SizePicker and the request field hold state and an id; two copies means
 *     two textareas with one id and two effects writing the same spec;
 *   - choosing by JavaScript (matchMedia) would leave the server-rendered
 *     desktop page without its size section until hydration.
 *
 * ⚠️ NOTHING ABOVE THIS ELEMENT MAY GET A transform, filter OR contain: a
 * fixed element is positioned against the nearest such ancestor, and the
 * sheet would then open somewhere down the page instead of on the screen.
 *
 * Dialog behaviour, all of it only while open: role="dialog" + aria-modal,
 * focus moved in and trapped, Esc / backdrop / × close it, focus goes back to
 * whatever opened it, and the page behind cannot scroll.
 */
export default function DetailsSheet({
  open,
  section,
  onClose,
  children,
}: {
  open: boolean;
  /** `data-sheet-section` value to scroll to on open; null opens at the top. */
  section: string | null;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  // The latest onClose without making the effect below re-run (and so
  // re-steal focus) every time the parent re-renders.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    if (!panel) return;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    // The page behind must not scroll under the sheet.
    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.overflow;
    const prevBody = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";

    // The mockup shows the request box ready to type in. The field itself is
    // SizePicker's own <details>, untouched; it is only opened for her.
    const request = panel.querySelector<HTMLDetailsElement>("details[data-sheet-open]");
    if (request) request.open = true;

    const target = section ? panel.querySelector<HTMLElement>(`[data-sheet-section="${section}"]`) : null;
    panel.scrollTop = target
      ? target.getBoundingClientRect().top - panel.getBoundingClientRect().top + panel.scrollTop - (headRef.current?.offsetHeight ?? 0)
      : 0;

    closeRef.current?.focus({ preventScroll: true });

    const focusables = () =>
      Array.from(
        panel.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, summary, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => el.getClientRects().length > 0);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab") return;
      const list = focusables();
      if (list.length === 0) return;
      const first = list[0];
      const last = list[list.length - 1];
      const active = document.activeElement;
      if (!panel.contains(active)) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("keydown", onKey);
      html.style.overflow = prevHtml;
      body.style.overflow = prevBody;
      trigger?.focus({ preventScroll: true });
    };
  }, [open, section]);

  return (
    <>
      <div
        aria-hidden="true"
        data-open={open}
        onClick={onClose}
        className="details-sheet-backdrop lg:hidden"
      />
      <div
        ref={panelRef}
        id="size"
        data-open={open}
        role={open ? "dialog" : undefined}
        aria-modal={open ? true : undefined}
        aria-labelledby={open ? titleId : undefined}
        className="details-sheet bg-white lg:mt-8"
      >
        <div ref={headRef} className="sticky top-0 z-10 bg-white px-4 pt-2 lg:hidden">
          <span aria-hidden="true" className="mx-auto block h-1 w-10 rounded-full bg-border-strong" />
          <div className="flex items-center justify-between">
            <p id={titleId} className="font-display text-[19px] text-text">
              Details
            </p>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Close details"
              className="-mr-3 flex h-11 w-11 items-center justify-center text-2xl leading-none text-text"
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
        </div>
        <div className="max-lg:px-4 max-lg:pb-6">{children}</div>
      </div>
    </>
  );
}

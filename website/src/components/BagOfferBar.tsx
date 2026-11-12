"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

// THE LAUNCH OFFER BAR, founder 2026-11-07: a thin line at the top of every
// page so the bag offer survives the opening (the coming-soon page that carried
// it disappears on 11·11). Wording is the coming-soon wording, already checked
// by the marketing agent. ⚠️ The bag is a LINEN BLEND: never write "linen bag"
// (planning/OPEN.md launch-gift-initials). Take this out once the fifty are gone.
//
// ⚠️ "first 50" is a gift-with-purchase advert from a Dubai DET licence; whether
// it needs a DET promotion permit is open (planning/OPEN.md det-permit).
export const BAG_INITIALS_KEY = "shaklek-bag-initials";

export default function BagOfferBar() {
  const [open, setOpen] = useState(false);
  const [initials, setInitials] = useState("");
  // Letters only, at most three, shown the way the embroidery is: "N.T".
  const letters = initials.replace(/[^a-z]/gi, "").toUpperCase().slice(0, 3);
  const shown = (letters || "NT").split("").join(".");

  // Kept in localStorage so checkout can prefill "Initials for your bag" and
  // the order carries them (founder, 2026-11-11). Same key as CheckoutForm.
  useEffect(() => {
    const saved = localStorage.getItem(BAG_INITIALS_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read once after mount (SSR has no storage)
    if (saved) setInitials(saved);
  }, []);
  // Saved only on the explicit button (founder, 2026-11-11: silent autosave
  // left customers unsure whether anything was kept).
  const [saved, setSaved] = useState(false);
  const save = () => {
    if (!letters) return;
    localStorage.setItem(BAG_INITIALS_KEY, letters);
    setSaved(true);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // "DELIVERY INCLUDED" JOINED THE BAR ON 2026-11-12. Opening-night feedback
  // via the founder: friends wanted delivery-included to be prominent, and the
  // bar is the one line on every page. Wording matches STEPS_NOTE in
  // homeContent.ts ("everywhere in the UAE" there, "across the UAE" here), and
  // the shipping page is the source of truth for what is actually covered.
  //
  // On a phone the bag sentence alone already wraps to two lines at 390px, so
  // showing both messages stacked would make the bar three lines tall. Instead,
  // below `sm` the two messages ALTERNATE every six seconds in the same two-line
  // slot (CSS grid stacks them in one cell, so the bar never changes height and
  // nothing below it shifts). From `sm` up both sit on one line. The inactive
  // message is aria-hidden and not focusable so a screen reader hears each
  // once, and the bag button is the only thing that opens the popup.
  const [showDelivery, setShowDelivery] = useState(false);
  useEffect(() => {
    const id = window.setInterval(() => setShowDelivery((v) => !v), 6000);
    return () => window.clearInterval(id);
  }, []);

  const bagLine = (
    <>
      The first 50 orders come in a Shaklek bag embroidered with your initials.
      <span className="ml-1 underline underline-offset-2">Customise your bag</span>
    </>
  );
  const deliveryLine = "Delivery included across the UAE.";

  return (
    <>
      {/* Phone: one two-line slot, the two messages crossfade. */}
      <div className="grid w-full bg-surface-2 px-4 py-2 text-center text-[11px] tracking-wide text-text sm:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-hidden={showDelivery}
          tabIndex={showDelivery ? -1 : 0}
          className={`col-start-1 row-start-1 block w-full transition-opacity duration-500 ${
            showDelivery ? "pointer-events-none opacity-0" : "opacity-100"
          }`}
        >
          {bagLine}
        </button>
        <span
          aria-hidden={!showDelivery}
          className={`col-start-1 row-start-1 flex items-center justify-center transition-opacity duration-500 ${
            showDelivery ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          {deliveryLine}
        </span>
      </div>
      {/* Tablet and up: both on one line. */}
      <div className="hidden w-full items-center justify-center gap-x-3 bg-surface-2 px-4 py-2 text-center text-xs tracking-wide text-text sm:flex sm:flex-wrap">
        <button type="button" onClick={() => setOpen(true)} className="block">
          {bagLine}
        </button>
        <span aria-hidden="true" className="text-text-3">
          ·
        </span>
        <span>{deliveryLine}</span>
      </div>
      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="The launch offer"
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-6"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-sm overflow-y-auto bg-white px-5 pb-5 pt-11 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="absolute right-2 top-1 flex h-11 w-11 items-center justify-center text-2xl text-text-2"
            >
              ×
            </button>
            {/* Height-capped (40vh) and width derived from the 2:3 ratio, so on an
                iPhone 13/SE the Save button sits inside the visible modal without
                scrolling. The box stays exactly 2:3, so the cqw overlay below keeps
                its lock on the embroidery -- founder review 2026-11-11. */}
            <div className="relative mx-auto aspect-[2/3] h-[min(40vh,516px)] w-auto overflow-hidden bg-surface-2 [container-type:inline-size]">
              <Image
                src="/coming-soon/bag-blank-v1.jpg"
                alt="The Shaklek bag with your initials embroidered in gold under the logo"
                fill
                sizes="(min-width: 640px) 384px, 90vw"
                className="object-cover"
              />
              {/* Placed where the embroidery sits on the photo: centre of the
                  letters measured at x 416/832, y 796/1248; letter height ~2%
                  of the frame; colour sampled from the stitched letters. */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 -translate-x-1/2 -translate-y-1/2 font-display font-semibold italic leading-none"
                style={{ top: "63.8%", fontSize: "4cqw", color: "#966c36" }}
              >
                {shown}
              </span>
            </div>
            <label className="mt-4 block text-left text-xs tracking-wide text-text-2 uppercase">
              Your initials
              <input
                type="text"
                value={initials}
                onChange={(e) => {
                  setInitials(e.target.value);
                  setSaved(false);
                }}
                maxLength={5}
                autoComplete="off"
                autoFocus // founder review 2026-11-11: cursor ready when the modal opens
                placeholder="N T"
                className="mt-1 block w-full border border-border px-3 py-2 text-base tracking-widest text-text normal-case"
              />
            </label>
            <button
              type="button"
              onClick={save}
              disabled={!letters}
              className="mt-3 min-h-[44px] w-full rounded-full bg-accent px-5 py-2.5 text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              {saved ? "Saved" : "Save my initials"}
            </button>
            <p aria-live="polite" className="mt-3 text-sm leading-relaxed text-text">
              {saved
                ? `Saved: ${shown}. Your initials will be on your order at checkout.`
                : "The first 50 orders come in a Shaklek bag embroidered with your initials."}
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}

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
export default function BagOfferBar() {
  const [open, setOpen] = useState(false);
  const [initials, setInitials] = useState("");
  // Letters only, at most three, shown the way the embroidery is: "N.T".
  const letters = initials.replace(/[^a-z]/gi, "").toUpperCase().slice(0, 3);
  const shown = (letters || "NT").split("").join(".");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="block w-full bg-surface-2 px-4 py-2 text-center text-[11px] tracking-wide text-text sm:text-xs"
      >
        The first 50 orders come in a Shaklek bag embroidered with your initials.
        <span className="ml-1 underline underline-offset-2">Customise your bag</span>
      </button>
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
              className="absolute right-2 top-1 flex h-10 w-10 items-center justify-center text-2xl text-text-2"
            >
              ×
            </button>
            <div className="relative mx-auto aspect-[2/3] w-full overflow-hidden bg-surface-2 [container-type:inline-size]">
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
                onChange={(e) => setInitials(e.target.value)}
                maxLength={5}
                autoComplete="off"
                placeholder="N T"
                className="mt-1 block w-full border border-border px-3 py-2 text-base tracking-widest text-text normal-case"
              />
            </label>
            <p className="mt-4 text-sm leading-relaxed text-text">
              The first 50 orders come in a Shaklek bag embroidered with your
              initials.
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}

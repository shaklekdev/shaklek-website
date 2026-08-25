"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { colors } from "@/data/colors";
import type { DesignSpec, Fabric, SilhouetteChangeType } from "@/data/designSpec";
import { renderParamsForCategory, premiumParamsForCategory } from "@/data/parameterSliders";
import FabricColorPicker from "@/components/FabricColorPicker";

const PREVIEW_SIZES = "(min-width: 640px) 576px, 100vw";

// Examples have to match the garment in front of you -- "no chest pocket" on a
// pair of trousers reads as a page that isn't paying attention. Anything not
// listed gets an empty placeholder rather than a wrong one.
const NOTE_EXAMPLES: Record<string, string> = {
  Shirt: "e.g. a wider collar, no chest pocket, sleeves a little shorter",
  Pants: "e.g. deeper pockets, a higher waist, no turn-up on the hem",
  Skirt: "e.g. a longer hem, a side slit, a flatter waistband",
  Dress: "e.g. a higher neckline, a looser waist, longer sleeves",
};

export default function CustomizeParameters({
  spec,
  onSpecChange,
  itemName,
  price,
  category,
  previewImage,
  previewBackImage,
  previewGradient,
  preloadImages = [],
  deferredPreloads = [],
  // The "any detail" field used to live here. It now renders on the page
  // AFTER the size step, because the founder's order is options, then size,
  // then the optional detail, then add to cart -- the optional thing should
  // not sit between a customer and the decision they came to make.
  detailField,
  primaryAction,
}: {
  spec: DesignSpec;
  onSpecChange: (spec: DesignSpec) => void;
  itemName: string;
  price: number;
  category: string;
  previewImage?: string | null;
  previewBackImage?: string | null;
  previewGradient: [string, string];
  preloadImages?: string[];
  // Other colourways. Warmed AFTER the visible preview rather than in front of
  // it -- see the tiering note in DesignCustomizer.
  deferredPreloads?: string[];
  detailField?: React.ReactNode;
  // Rendered directly beneath the choices, above the Shaklek+ note. The CTA
  // used to sit after everything, so getting to checkout meant scrolling past
  // an upsell for features that are not purchasable yet.
  primaryAction?: React.ReactNode;
}) {
  function handleFabricChange(fabric: Fabric) {
    onSpecChange({ ...spec, fabric });
  }
  function handleColorChange(color: string) {
    onSpecChange({ ...spec, color });
  }
  function setChange(type: SilhouetteChangeType, value: string, label: string) {
    const changes = spec.changes.filter((c) => c.type !== type);
    changes.push({ type, value, label });
    onSpecChange({ ...spec, changes });
  }

  const [view, setView] = useState<"front" | "back">("front");
  const activeImage = view === "back" && previewBackImage ? previewBackImage : previewImage;
  const canSlide = Boolean(previewBackImage);
  const touchStartX = useRef(0);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }
  function handleTouchEnd(e: React.TouchEvent) {
    if (!canSlide) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) < 40) return;
    setView(delta < 0 ? "back" : "front");
  }

  const colorHex = colors.find((c) => c.name === spec.color)?.hex ?? previewGradient[0];
  const params = renderParamsForCategory(category);
  const premiumParams = premiumParamsForCategory(category);

  return (
    // Ten out of ten people shown this read the old layout as a bug, and they
    // were right: the preview was sticky and the controls sat in the SAME
    // single column, so on scroll every option slid underneath the photo and
    // got sliced in half. A black pill button clipped by the image edge does
    // not read as "pinned preview", it reads as broken rendering.
    //
    // The width was also derived from the viewport HEIGHT (w-[40.5vh]), so the
    // control column got narrower on short windows and wider on tall ones, and
    // anything that would not fit overflowed sideways out of the column.
    //
    // Now: one column on phones, two from lg up -- preview sticky in its own
    // column, controls scrolling in theirs. Nothing can pass behind anything,
    // and the desktop layout stops wasting ~60% of the viewport.
    <div className="mx-auto grid w-full max-w-md min-w-0 grid-cols-1 gap-6 lg:max-w-none lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:items-start lg:gap-12">
      <div className="min-w-0 lg:sticky lg:top-[98px]">
      {/* Preview.
          NOT STICKY ON PHONES. It was, and it was the "ten out of ten people
          read this as a bug" complaint all over again in a smaller form: the
          photo pinned under the header while everything below scrolled
          UNDERNEATH it, so the footnote rendered as "* Images" ... photo ...
          "is hand-cu", and the missing-combination notice was sliced into
          fragments around the image. Screenshots from the founder's phone,
          2026-08-25.
          The earlier fix only split the layout into two columns at `lg`, which
          cured the desktop overlap and left the phone exactly as it was --
          one column with a sticky element painting over its own siblings.
          A pinned preview is worth having on a wide screen, where it lives in
          its OWN column and cannot cover anything. On a phone there is only
          one column, so nothing may be sticky in it. object-contain because
          the box is not 3:4. */}
      <div
        className="relative mx-auto aspect-[2/3] max-h-[54vh] w-auto touch-pan-y select-none overflow-hidden bg-white lg:max-h-none lg:w-full"
        style={
          activeImage
            ? undefined
            : { background: `linear-gradient(135deg, ${colorHex}, ${previewGradient[1]})` }
        }
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {activeImage && (
          <Image
            src={activeImage}
            alt={view === "back" ? "Back view" : "Front view"}
            fill
            sizes={PREVIEW_SIZES}
            className="object-contain"
            priority
            draggable={false}
          />
        )}
        {canSlide && (
          <>
            <button
              aria-label="Show front"
              onClick={() => setView("front")}
              className={`absolute top-1/2 left-3 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-text shadow-[var(--shadow)] backdrop-blur-sm transition-opacity hover:bg-white ${
                view === "front" ? "pointer-events-none opacity-0" : "opacity-100"
              }`}
            >
              ‹
            </button>
            <button
              aria-label="Show back"
              onClick={() => setView("back")}
              className={`absolute top-1/2 right-3 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-text shadow-[var(--shadow)] backdrop-blur-sm transition-opacity hover:bg-white ${
                view === "back" ? "pointer-events-none opacity-0" : "opacity-100"
              }`}
            >
              ›
            </button>
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
              <span
                className={`h-1.5 w-1.5 rounded-full transition-colors ${
                  view === "front" ? "bg-white" : "bg-white/40"
                }`}
              />
              <span
                className={`h-1.5 w-1.5 rounded-full transition-colors ${
                  view === "back" ? "bg-white" : "bg-white/40"
                }`}
              />
            </div>
          </>
        )}
      </div>

      {/* What the picture is, and is not.

          Added 2026-08-25, because /how-it-works had been telling customers
          every combination was "a real photograph ... the actual piece you
          will receive". The images are generated, so that was a false claim,
          sitting where a customer decides to spend AED 389.

          DELIBERATELY SHORT, and deliberately carries NO remedy. A first
          version ended with "we remake or refund it" and the founder cut it:
          this is a made-to-order business where a returned piece cannot be
          resold, and advertising a refund at the moment of purchase invites
          the claim it describes. The remedy ladder belongs in /legal/terms,
          which is where it is, and where it is properly qualified. Say what
          the image is; do not make promises about what happens if it is
          wrong. */}
      {/* Name and price sit UNDER the photograph, in the catalog's own type,
          rather than as a pill floating on top of the garment. A label laid
          over the picture covers the thing the customer came to look at, and
          the price was only visible two steps later on the fit tab. */}
      <div className="mt-3 text-center">
        <p className="font-display text-[15px] text-text">{itemName}</p>
        <p className="mt-1 text-xs text-text-2">AED {price}</p>
      </div>

      <p className="mt-3 px-1 text-[11px] leading-relaxed text-text-3">
        * Images are illustrative of the combination you chose. Every piece is
        hand-cut, so fabric fall and shade vary slightly.
      </p>

      </div>

      {/* Controls column. min-w-0 so a wide control shrinks instead of
          overflowing the grid track -- the old layout had no such guard, which
          is how a button ended up rendering outside the column. */}
      <div className="min-w-0">
      {/* Preloads every other color/view so switching hits the browser
          cache instead of a fresh fetch -- same `sizes` as the visible
          image above so next/image resolves to the same cached URL.
          `priority` is what actually matters here: it skips next/image's
          IntersectionObserver-based lazy loading, which would otherwise
          never fire for an always-invisible 0x0 element. */}
      <div aria-hidden="true" className="pointer-events-none h-0 w-0 overflow-hidden opacity-0">
        {preloadImages
          .filter((src) => src !== activeImage)
          .map((src) => (
            <div key={src} className="relative h-1 w-1">
              <Image src={src} alt="" fill sizes={PREVIEW_SIZES} priority />
            </div>
          ))}
        {/* Other colourways: no `priority`, and fetchPriority="low", so they
            queue behind the preview the customer is looking at instead of
            ahead of it. They still arrive well before anyone taps a swatch.
            `loading="eager"` is kept because next/image's lazy path uses an
            IntersectionObserver that never fires for a 0x0 element. */}
        {deferredPreloads
          .filter((src) => src !== activeImage && !preloadImages.includes(src))
          .map((src) => (
            <div key={src} className="relative h-1 w-1">
              <Image
                src={src}
                alt=""
                fill
                sizes={PREVIEW_SIZES}
                loading="eager"
                fetchPriority="low"
              />
            </div>
          ))}
      </div>

      <FabricColorPicker
        fabric={spec.fabric}
        color={spec.color}
        onFabricChange={handleFabricChange}
        onColorChange={handleColorChange}
      />

      {/* Sliders */}
      {params.length > 0 && (
        <div className="mt-5 flex flex-col gap-4">
          {params.map((param) => {
            const current = spec.changes.find((c) => c.type === param.type);
            const activeIndex = Math.max(
              0,
              param.options.findIndex((o) => o.value === current?.value),
            );
            return (
              <div key={param.type}>
                {/* Native radios behind styled labels, not buttons with
                    role="radio". ARIA radiogroup semantics tell a screen
                    reader to press arrow keys; buttons do not implement them,
                    so the page was promising an interaction it did not honour.
                    The browser supplies arrow keys, roving focus, grouping and
                    the accessibility tree here for free, and none of it can
                    drift. Each label is a 44px-tall full-width target. */}
                <fieldset>
                  <legend className="text-[11px] tracking-wide text-text-3 uppercase">
                    {param.name}
                  </legend>
                  {/* max-w stops a two-option row stretching across the whole
                      control column on desktop. Full-width slabs read as
                      utilitarian; the brand wants restraint, and a option that
                      is 500px wide to say "Long" is neither. Phones keep the
                      full width, where it is the only way to hold a 44px
                      target. */}
                  <div
                    className="mt-1.5 grid gap-1.5 lg:max-w-xs"
                    style={{ gridTemplateColumns: `repeat(${param.options.length}, minmax(0, 1fr))` }}
                  >
                    {param.options.map((option, i) => {
                      const selected = i === activeIndex;
                      return (
                        <label
                          key={option.value}
                          className={`flex min-h-11 cursor-pointer items-center justify-center border px-2 py-2 text-center text-xs transition-colors focus-within:ring-2 focus-within:ring-accent focus-within:ring-offset-1 lg:min-h-0 lg:py-1.5 lg:text-[11px] ${
                            selected
                              ? "border-text bg-text text-white"
                              : "border-border bg-white text-text-2 hover:border-border-strong hover:text-text"
                          }`}
                        >
                          <input
                            type="radio"
                            name={param.type}
                            value={option.value}
                            checked={selected}
                            onChange={() => setChange(param.type, option.value, param.labelFor(option.text))}
                            className="sr-only"
                          />
                          {option.text}
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              </div>
            );
          })}
        </div>
      )}

      {detailField}

      {primaryAction}

      {detailField}

      {primaryAction}


      </div>
    </div>
  );
}

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
  category,
  previewImage,
  previewBackImage,
  previewGradient,
  preloadImages = [],
  primaryAction,
}: {
  spec: DesignSpec;
  onSpecChange: (spec: DesignSpec) => void;
  itemName: string;
  category: string;
  previewImage?: string | null;
  previewBackImage?: string | null;
  previewGradient: [string, string];
  preloadImages?: string[];
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
      {/* Preview. Sticky under the 98px header and shortened to 40vh, so the
          garment stays on screen while the options below are changed --
          previously it was 704px of a 2028px page and scrolled away
          immediately, which meant tapping an option then scrolling back up to
          see what it did. object-contain because the box is no longer 3:4. */}
      <div
        className="sticky top-[98px] z-10 h-[54vh] max-h-[560px] w-full touch-pan-y select-none overflow-hidden border border-border bg-white shadow-[0_8px_16px_-12px_rgba(0,0,0,0.35)] lg:static lg:h-auto lg:aspect-[3/4] lg:max-h-none lg:shadow-none"
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
            className="object-cover"
            priority
            draggable={false}
          />
        )}
        <span className="absolute top-4 left-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-medium tracking-wide text-text backdrop-blur-sm">
          {itemName}
        </span>

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
      </div>

      <FabricColorPicker
        fabric={spec.fabric}
        color={spec.color}
        onFabricChange={handleFabricChange}
        onColorChange={handleColorChange}
      />

      {/* Sliders */}
      {params.length > 0 && (
        <div className="mt-6 flex flex-col gap-6">
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
                    className="mt-2 grid gap-2 lg:max-w-sm"
                    style={{ gridTemplateColumns: `repeat(${param.options.length}, minmax(0, 1fr))` }}
                  >
                    {param.options.map((option, i) => {
                      const selected = i === activeIndex;
                      return (
                        <label
                          key={option.value}
                          className={`flex min-h-11 cursor-pointer items-center justify-center rounded-shaklek-xs border px-2 py-2.5 text-center text-xs transition-colors focus-within:ring-2 focus-within:ring-accent focus-within:ring-offset-1 lg:min-h-0 lg:py-2 lg:text-[11px] ${
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

      {/* Free-text requests. The sliders only cover what we can pre-render;
          this is the escape hatch for everything else, and unlike the
          measurement notes in SizePicker it is available in both size modes.
          Carried through to the tailor's spec sheet via spec.freeformNotes. */}
      <div className="mt-6">
        <label htmlFor="customization-notes" className="mb-1 block text-xs text-text">
          Anything you&apos;d like to specify to your tailor? (optional)
        </label>
        <textarea
          id="customization-notes"
          value={spec.freeformNotes}
          onChange={(e) => onSpecChange({ ...spec, freeformNotes: e.target.value })}
          rows={3}
          maxLength={500}
          placeholder={NOTE_EXAMPLES[category] ?? ""}
          className="w-full rounded-shaklek-xs border border-border-strong bg-white p-3 text-sm text-text placeholder:text-text-3 focus:border-accent focus:outline-none"
        />
        <p className="mt-1.5 text-[11px] text-text-3">
          Tell us and we&apos;ll do our best. A stylist confirms what&apos;s possible
          before anything is cut.
        </p>
      </div>

      {primaryAction}

      {/* Shaklek+ is a list, not a demo. It previously rendered every locked
          slider plus a dead subscribe button -- a wall of controls nobody can
          use, sitting between the customer and checkout. */}
      {premiumParams.length > 0 && (
        <div className="mt-6 flex items-start gap-2 border border-dashed border-gold/40 bg-surface-2 p-3">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" className="mt-0.5 shrink-0 text-gold" aria-hidden="true">
            <rect x="5" y="11" width="14" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <p className="text-[11px] leading-relaxed text-text-3">
            <span className="text-text">Shaklek+</span> — coming soon:{" "}
            {premiumParams.map((p) => p.name.toLowerCase()).join(", ")}, fit, and
            more colours.
          </p>
        </div>
      )}

      {spec.changes.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {spec.changes.map((c) => (
            <span
              key={c.type}
              className="rounded-full border border-border bg-surface px-3 py-1 text-xs text-text-2"
            >
              {c.label}
            </span>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}

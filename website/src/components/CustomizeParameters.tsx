"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { colors } from "@/data/colors";
import type { DesignSpec, Fabric, SilhouetteChangeType } from "@/data/designSpec";
import { renderParamsForCategory, premiumParamsForCategory } from "@/data/parameterSliders";
import FabricColorPicker from "@/components/FabricColorPicker";

const PREVIEW_SIZES = "(min-width: 640px) 576px, 100vw";

export default function CustomizeParameters({
  spec,
  onSpecChange,
  itemName,
  category,
  previewImage,
  previewBackImage,
  previewGradient,
  preloadImages = [],
}: {
  spec: DesignSpec;
  onSpecChange: (spec: DesignSpec) => void;
  itemName: string;
  category: string;
  previewImage?: string | null;
  previewBackImage?: string | null;
  previewGradient: [string, string];
  preloadImages?: string[];
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
    <div>
      {/* Preview */}
      <div
        className="relative aspect-[3/4] w-full touch-pan-y select-none overflow-hidden border border-border"
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
        <span className="absolute top-4 right-4 rounded-full bg-accent px-3 py-1 text-[10px] font-medium tracking-wide text-white">
          LIVE PREVIEW
        </span>
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
                <p className="text-xs text-text">{param.name}</p>
                {/* Segmented buttons, not a slider. Every render param is a
                    two-way choice, and a drag gesture to pick between two
                    options is pure friction -- worse on a phone, where the
                    thumb covers the thing it is selecting. Each button is a
                    44px-tall full-width target. radiogroup semantics rather
                    than aria-pressed, because these are one-of-N, not toggles. */}
                <div
                  role="radiogroup"
                  aria-label={param.name}
                  className="mt-2 grid gap-2"
                  style={{ gridTemplateColumns: `repeat(${param.options.length}, minmax(0, 1fr))` }}
                >
                  {param.options.map((option, i) => {
                    const selected = i === activeIndex;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => setChange(param.type, option.value, param.labelFor(option.text))}
                        className={`min-h-11 rounded-shaklek-xs border px-2 py-2.5 text-xs transition-colors ${
                          selected
                            ? "border-text bg-text text-white"
                            : "border-border bg-white text-text-2 hover:border-border-strong hover:text-text"
                        }`}
                      >
                        {option.text}
                      </button>
                    );
                  })}
                </div>
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
          Anything else you&apos;d like changed? (optional)
        </label>
        <textarea
          id="customization-notes"
          value={spec.freeformNotes}
          onChange={(e) => onSpecChange({ ...spec, freeformNotes: e.target.value })}
          rows={3}
          maxLength={500}
          placeholder="e.g. a wider collar, no chest pocket, sleeves a little shorter"
          className="w-full rounded-shaklek-xs border border-border-strong bg-white p-3 text-sm text-text placeholder:text-text-3 focus:border-accent focus:outline-none"
        />
        <p className="mt-1.5 text-[11px] text-text-3">
          Tell us and we&apos;ll do our best. A stylist confirms what&apos;s possible
          before anything is cut.
        </p>
      </div>

      {premiumParams.length > 0 && (
        <div className="mt-6 rounded-shaklek-sm border border-dashed border-gold/40 bg-surface-2 p-4">
          <div className="flex items-center gap-1.5">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" className="shrink-0 text-gold" aria-hidden="true">
              <rect x="5" y="11" width="14" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
              <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <p className="text-xs text-text">Unlock more on Shaklek+</p>
          </div>
          <p className="mt-1 text-[11px] text-text-3">
            Coming soon: {premiumParams.map((p) => p.name.toLowerCase()).join(", ")}, fit, and more colours.
          </p>
          <div className="mt-4 flex flex-col gap-4 opacity-50">
            {premiumParams.map((param) => (
              <div key={param.type}>
                <p className="text-xs text-text">{param.name}</p>
                <div
                  className="mt-2 grid gap-2"
                  style={{ gridTemplateColumns: `repeat(${param.options.length}, minmax(0, 1fr))` }}
                >
                  {param.options.map((option) => (
                    <span
                      key={option.value}
                      className="min-h-11 rounded-shaklek-xs border border-border px-2 py-2.5 text-center text-xs text-text-3"
                    >
                      {option.text}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            disabled
            className="mt-4 w-full cursor-not-allowed rounded-full border border-gold/40 py-2 text-[11px] text-gold"
          >
            Subscribe to get access in preview
          </button>
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

      <p className="mt-4 text-xs text-text-3">
        Fabric, colour and every option selected above is committed — that is exactly what
        gets made. Anything written in the box is a request we will confirm with you first.
      </p>
    </div>
  );
}

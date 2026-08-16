"use client";

import { useRef, useState } from "react";
import { colors } from "@/data/colors";
import type { DesignSpec, Fabric, SilhouetteChangeType } from "@/data/designSpec";
import { paramsForCategory } from "@/data/parameterSliders";
import FabricColorPicker from "@/components/FabricColorPicker";

export default function CustomizeParameters({
  spec,
  onSpecChange,
  itemName,
  category,
  previewImage,
  previewBackImage,
  previewGradient,
}: {
  spec: DesignSpec;
  onSpecChange: (spec: DesignSpec) => void;
  itemName: string;
  category: string;
  previewImage?: string | null;
  previewBackImage?: string | null;
  previewGradient: [string, string];
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
  const params = paramsForCategory(category);

  return (
    <div>
      {/* Preview */}
      <div
        className="relative aspect-[3/4] w-full touch-pan-y select-none overflow-hidden rounded-shaklek border border-border"
        style={
          activeImage
            ? undefined
            : { background: `linear-gradient(135deg, ${colorHex}, ${previewGradient[1]})` }
        }
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {activeImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={activeImage}
            alt={view === "back" ? "Back view" : "Front view"}
            className="h-full w-full object-cover"
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

      <FabricColorPicker
        fabric={spec.fabric}
        color={spec.color}
        onFabricChange={handleFabricChange}
        onColorChange={handleColorChange}
      />

      {/* Sliders */}
      {params && (
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
                <input
                  type="range"
                  min={0}
                  max={param.options.length - 1}
                  step={1}
                  value={activeIndex}
                  onChange={(e) => {
                    const option = param.options[Number(e.target.value)];
                    setChange(param.type, option.value, param.labelFor(option.text));
                  }}
                  className="mt-3 h-1 w-full cursor-pointer accent-gold"
                />
                <div className="mt-1.5 flex justify-between">
                  {param.options.map((option, i) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setChange(param.type, option.value, param.labelFor(option.text))}
                      className={`text-[11px] transition-colors ${
                        i === activeIndex ? "text-text-2" : "text-text-3 hover:text-text-2"
                      } ${i === 0 ? "text-left" : i === param.options.length - 1 ? "text-right" : ""}`}
                    >
                      {option.text}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
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
        Everything above is what gets made — fabric, color, and every option selected here is
        committed, not a best-effort guess.
      </p>
    </div>
  );
}

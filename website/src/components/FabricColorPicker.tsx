"use client";

import { colors, LINEN_UPCHARGE } from "@/data/colors";
import type { Fabric } from "@/data/designSpec";

export default function FabricColorPicker({
  fabric,
  color,
  onFabricChange,
  onColorChange,
}: {
  fabric: Fabric;
  color: string;
  onFabricChange: (fabric: Fabric) => void;
  onColorChange: (color: string) => void;
}) {
  return (
    <>
      <div className="mt-8">
        <p className="mb-3 text-sm text-text">Fabric</p>
        <div className="flex gap-3">
          <button
            onClick={() => onFabricChange("cotton")}
            aria-pressed={fabric === "cotton"}
            className={`flex-1 rounded-shaklek-xs border px-4 py-3 text-left text-sm transition-colors ${
              fabric === "cotton" ? "border-accent bg-surface-2" : "border-border-strong"
            }`}
          >
            <span className="block font-medium text-text">Cotton</span>
            <span className="text-xs text-text-3">Included</span>
          </button>
          <button
            onClick={() => onFabricChange("linen")}
            aria-pressed={fabric === "linen"}
            className={`flex-1 rounded-shaklek-xs border px-4 py-3 text-left text-sm transition-colors ${
              fabric === "linen" ? "border-accent bg-surface-2" : "border-border-strong"
            }`}
          >
            <span className="block font-medium text-text">Linen</span>
            <span className="text-xs text-gold">+AED {LINEN_UPCHARGE}</span>
          </button>
        </div>
      </div>

      <div className="mt-8">
        <p className="mb-3 text-sm text-text">Color</p>
        <div className="flex flex-wrap gap-3">
          {colors.map((c) => (
            <button
              key={c.name}
              aria-label={c.name}
              aria-pressed={c.name === color}
              onClick={() => onColorChange(c.name)}
              className={`h-9 w-9 rounded-full border-2 transition-all ${
                c.name === color ? "border-accent scale-110" : "border-transparent"
              }`}
              style={{ background: c.hex }}
            />
          ))}
        </div>
      </div>
    </>
  );
}

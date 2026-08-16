"use client";

import { colors } from "@/data/colors";
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
    <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap items-center gap-3">
        {colors.map((c) => (
          <button
            key={c.name}
            aria-label={c.name}
            aria-pressed={c.name === color}
            onClick={() => onColorChange(c.name)}
            className={`h-8 w-8 rounded-full border-2 transition-all ${
              c.name === color ? "border-accent scale-110" : "border-transparent"
            }`}
            style={{ background: c.hex }}
          />
        ))}
      </div>

      <div className="flex shrink-0 gap-1.5 rounded-full border border-border-strong p-1">
        <button
          onClick={() => onFabricChange("linen")}
          aria-pressed={fabric === "linen"}
          className={`rounded-full px-3 py-1.5 text-xs transition-colors ${
            fabric === "linen" ? "bg-text text-white" : "text-text-2"
          }`}
        >
          Linen
        </button>
        <button
          onClick={() => onFabricChange("cotton")}
          aria-pressed={fabric === "cotton"}
          className={`rounded-full px-3 py-1.5 text-xs transition-colors ${
            fabric === "cotton" ? "bg-text text-white" : "text-text-2"
          }`}
        >
          Organic cotton
        </button>
      </div>
    </div>
  );
}

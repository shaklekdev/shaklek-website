"use client";

import { colors } from "@/data/colors";
import { FABRIC_OPTIONS, SELLABLE_FABRICS } from "@/data/fabrics";
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
  // One sellable fabric today (linen), so this is a statement of what the
  // piece is made of rather than a choice. Rendering it as a two-button
  // toggle with one button dead would be a control that punishes the tap.
  // The moment a second fabric goes `available` in fabrics.ts it becomes a
  // real toggle again, with no change here.
  const single = SELLABLE_FABRICS.length === 1 ? SELLABLE_FABRICS[0] : null;
  const upcoming = FABRIC_OPTIONS.filter((f) => !f.available);

  return (
    <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap items-center gap-3">
        {colors.map((c) => (
          <button
            key={c.name}
            aria-label={c.name}
            aria-pressed={c.name === color}
            onClick={() => onColorChange(c.name)}
            className={`h-6 w-6 rounded-full border-2 transition-all ${
              c.name === color ? "border-accent scale-110" : "border-transparent"
            }`}
            style={{ background: c.hex }}
          />
        ))}
      </div>

      {single ? (
        <div className="shrink-0 text-right">
          <p className="border border-border-strong px-3 py-1.5 text-xs text-text">
            {single.label}
          </p>
          {upcoming.length > 0 && (
            <p className="mt-1 text-[10px] text-text-3">
              {upcoming.map((f) => f.label).join(", ")} coming soon
            </p>
          )}
        </div>
      ) : (
        <div className="flex shrink-0 gap-1.5 border border-border-strong p-1">
          {SELLABLE_FABRICS.map((f) => (
            <button
              key={f.id}
              onClick={() => onFabricChange(f.id)}
              aria-pressed={fabric === f.id}
              className={`px-3 py-1.5 text-xs transition-colors ${
                fabric === f.id ? "bg-text text-white" : "text-text-2"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

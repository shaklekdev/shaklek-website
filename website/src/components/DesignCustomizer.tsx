"use client";

import { useState } from "react";
import Link from "next/link";
import type { CatalogItem } from "@/data/catalog";
import { LINEN_UPCHARGE } from "@/data/colors";
import { createSpecFromCatalog, type DesignSpec } from "@/data/designSpec";
import CustomizeChat from "@/components/CustomizeChat";
import FabricColorPicker from "@/components/FabricColorPicker";
import SizePicker from "@/components/SizePicker";

export default function DesignCustomizer({ item }: { item: CatalogItem }) {
  const [spec, setSpec] = useState<DesignSpec>(() => createSpecFromCatalog(item));

  const price = item.price + (spec.fabric === "linen" ? LINEN_UPCHARGE : 0);

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-10 px-6 py-10 lg:grid-cols-2">
      {/* Preview + chat */}
      <div>
        <CustomizeChat spec={spec} onSpecChange={setSpec} previewGradient={item.gradient} />
      </div>

      {/* Options */}
      <div>
        <p className="text-xs tracking-wide text-text-3 uppercase">
          {item.category}
        </p>
        <h1 className="mt-1 text-[26px] text-text">{item.name}</h1>
        <p className="subtitle">{item.descriptor}</p>

        <FabricColorPicker
          fabric={spec.fabric}
          color={spec.color}
          onFabricChange={(fabric) => setSpec((s) => ({ ...s, fabric }))}
          onColorChange={(color) => setSpec((s) => ({ ...s, color }))}
        />

        <SizePicker
          sizeMode={spec.sizeMode}
          size={spec.size}
          measurements={spec.measurements}
          onSizeModeChange={(sizeMode) => setSpec((s) => ({ ...s, sizeMode }))}
          onSizeChange={(size) => setSpec((s) => ({ ...s, size }))}
          onMeasurementsChange={(measurements) => setSpec((s) => ({ ...s, measurements }))}
        />

        <div className="mt-10 flex items-center justify-between border-t border-border pt-6">
          <div>
            <p className="text-xs text-text-3">Total</p>
            <p className="font-display text-2xl text-text">AED {price}</p>
          </div>
          {spec.constraints.passed ? (
            <Link
              href={{
                pathname: "/checkout",
                query: {
                  slug: item.slug,
                  size: spec.sizeMode === "tailored" ? "Tailored" : spec.size,
                  fabric: spec.fabric,
                  color: spec.color,
                  request: [
                    ...spec.changes.map((c) => c.label),
                    spec.sizeMode === "tailored" && spec.measurements
                      ? `Measurements: ${spec.measurements}`
                      : "",
                    spec.freeformNotes,
                  ]
                    .filter(Boolean)
                    .join("; "),
                },
              }}
              className="rounded-full bg-accent px-8 py-3.5 text-sm text-white transition-opacity hover:opacity-90"
            >
              Continue
            </Link>
          ) : (
            <button
              disabled
              className="rounded-full bg-accent px-8 py-3.5 text-sm text-white opacity-40"
              title="Resolve the flagged request above before continuing"
            >
              Continue
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

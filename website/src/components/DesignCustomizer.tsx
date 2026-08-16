"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CatalogItem } from "@/data/catalog";
import { createSpecFromCatalog, type DesignSpec } from "@/data/designSpec";
import { useCart } from "@/lib/CartContext";
import CustomizeParameters from "@/components/CustomizeParameters";
import SizePicker from "@/components/SizePicker";

export default function DesignCustomizer({ item }: { item: CatalogItem }) {
  const [spec, setSpec] = useState<DesignSpec>(() => createSpecFromCatalog(item));
  const [step, setStep] = useState<2 | 3>(2);
  const { addItem } = useCart();
  const router = useRouter();

  const price = item.price;
  const colorVariant = item.colorImages?.[spec.color];
  const previewImage = colorVariant?.front ?? item.image;
  const previewBackImage = colorVariant?.back ?? item.backImage;

  function handleAddToCart() {
    addItem({
      slug: item.slug,
      name: item.name,
      category: item.category,
      gradient: item.gradient,
      price,
      fabric: spec.fabric,
      color: spec.color,
      size: spec.sizeMode === "tailored" ? "Tailored" : spec.size,
      measurements: spec.sizeMode === "tailored" ? spec.measurements : "",
      changes: spec.changes.map((c) => c.label),
      freeformNotes: spec.freeformNotes,
    });
    router.push("/cart");
  }

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex w-fit gap-1 rounded-full border border-border-strong p-1">
        <button
          onClick={() => setStep(2)}
          aria-pressed={step === 2}
          className={`rounded-full px-4 py-2 text-xs transition-colors ${
            step === 2 ? "bg-text text-white" : "text-text-2 hover:text-text"
          }`}
        >
          Step 2 · Make it yours
        </button>
        <button
          onClick={() => setStep(3)}
          aria-pressed={step === 3}
          className={`rounded-full px-4 py-2 text-xs transition-colors ${
            step === 3 ? "bg-text text-white" : "text-text-2 hover:text-text"
          }`}
        >
          Step 3 · Size
        </button>
      </div>

      {step === 2 && (
        <div className="mt-6">
          <CustomizeParameters
            spec={spec}
            onSpecChange={setSpec}
            itemName={item.name}
            category={item.category}
            previewImage={previewImage}
            previewBackImage={previewBackImage}
            previewGradient={item.gradient}
          />

          <button
            onClick={() => setStep(3)}
            className="mt-6 w-full rounded-full bg-accent px-8 py-3.5 text-sm text-white transition-opacity hover:opacity-90"
          >
            Continue to size
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="mt-6">
          <p className="text-xs tracking-wide text-text-3 uppercase">Step 3</p>
          <h2 className="mt-1 text-lg text-text">Choose the size</h2>

          <SizePicker
            sizeMode={spec.sizeMode}
            size={spec.size}
            measurements={spec.measurements}
            onSizeModeChange={(sizeMode) => setSpec((s) => ({ ...s, sizeMode }))}
            onSizeChange={(size) => setSpec((s) => ({ ...s, size }))}
            onMeasurementsChange={(measurements) => setSpec((s) => ({ ...s, measurements }))}
          />

          <div className="mt-10 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs text-text-3">Total</p>
              <p className="font-display text-2xl text-text">AED {price}</p>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={!spec.constraints.passed}
              className="w-full rounded-full bg-accent px-8 py-3.5 text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-40 sm:w-auto"
              title={spec.constraints.passed ? undefined : "Resolve the flagged request above before continuing"}
            >
              Add to cart
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import CustomizeChat from "@/components/CustomizeChat";
import SizePicker from "@/components/SizePicker";
import { createSpecFromUpload, type DesignSpec, type GarmentType } from "@/data/designSpec";
import { BASE_PRICE_BY_CATEGORY } from "@/data/catalog";
import { useCart } from "@/lib/CartContext";

const GARMENT_TYPES: GarmentType[] = ["Shirt", "Skirt", "Pants", "Dress"];

type Stage = "select" | "customize";

export default function UploadPage() {
  const [stage, setStage] = useState<Stage>("select");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [spec, setSpec] = useState<DesignSpec | null>(null);
  // Same gate as the catalog customizer: Tailored requires complete,
  // plausible measurements before Add to cart is enabled.
  const [measurementsValid, setMeasurementsValid] = useState(true);
  const { addItem } = useCart();
  const router = useRouter();

  function handleFile(f: File | null) {
    setFile(f);
    if (!f) {
      setPreview(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
  }

  function startCustomizing(garmentType: GarmentType) {
    if (!file || !preview) return;
    const s = createSpecFromUpload(file.name, preview);
    s.garmentType = garmentType;
    setSpec(s);
    setStage("customize");
  }

  function handleAddToCart() {
    if (!spec || spec.garmentType === "Unspecified" || !preview) return;
    const price = BASE_PRICE_BY_CATEGORY[spec.garmentType];
    addItem({
      slug: "",
      quantity: 1,
      name: `Custom ${spec.garmentType}`,
      category: spec.garmentType,
      gradient: ["#f5f0e8", "#e8e4dc"],
      previewImage: preview,
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

  if (stage === "customize" && spec) {
    const price =
      BASE_PRICE_BY_CATEGORY[spec.garmentType === "Unspecified" ? "Shirt" : spec.garmentType];
    return (
      <div className="flex flex-1 flex-col bg-bg">
        <Header />
        <div className="mx-auto grid w-full max-w-5xl gap-10 px-6 py-10 lg:grid-cols-2">
          <div>
            <button
              type="button"
              onClick={() => setStage("select")}
              className="mb-4 text-xs text-text-3 hover:text-text-2"
            >
              ← Start over
            </button>
            <CustomizeChat
              spec={spec}
              onSpecChange={setSpec}
              itemName="Your upload"
              previewImage={preview}
              previewGradient={["#f5f0e8", "#e8e4dc"]}
              suggestions={["Add side slits", "Add a front pocket", "Shorter sleeves"]}
            />
          </div>

          <div>
            <p className="text-xs tracking-wide text-text-3 uppercase">Custom {spec.garmentType}</p>
            <h1 className="mt-1 text-[26px] text-text">Customize it</h1>

            <SizePicker
              sizeMode={spec.sizeMode}
              size={spec.size}
              measurements={spec.measurements}
              onSizeModeChange={(sizeMode) => setSpec((s) => (s ? { ...s, sizeMode } : s))}
              onSizeChange={(size) => setSpec((s) => (s ? { ...s, size } : s))}
              onMeasurementsChange={(measurements) =>
                setSpec((s) => (s ? { ...s, measurements } : s))
              }
              onMeasurementsValidChange={setMeasurementsValid}
            />

            <div className="mt-10 flex items-center justify-between border-t border-border pt-6">
              <div>
                <p className="text-xs text-text-3">Total</p>
                <p className="font-display text-2xl text-text">AED {price}</p>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={!spec.constraints.passed || !measurementsValid}
                className="rounded-full bg-accent px-8 py-3.5 text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                title={
                  !spec.constraints.passed
                    ? "Resolve the flagged request in the chat above"
                    : !measurementsValid
                      ? "Add your measurements above before continuing"
                      : undefined
                }
              >
                Add to cart
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col bg-bg">
      <Header />
      <div className="mx-auto w-full max-w-md flex-1 px-6 py-14">
        <h1 className="text-[26px] text-text">Upload your own</h1>
        <p className="subtitle max-w-sm">
          Bring a photo, screenshot, or sketch — even something you saw on
          another brand. We&apos;ll adapt it into something that&apos;s
          clearly yours, made in cotton or linen, at the same fixed prices as
          the catalog.
        </p>

        <label className="mt-8 block cursor-pointer rounded-shaklek-sm border-2 border-dashed border-border-strong p-8 text-center transition-colors hover:border-accent">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt="Reference preview"
              className="mx-auto max-h-56 rounded-shaklek-xs object-contain"
            />
          ) : (
            <>
              <p className="text-sm text-text">Tap to upload</p>
              <p className="mt-1 text-xs text-text-3">PNG, JPG, or HEIC</p>
            </>
          )}
        </label>

        {preview && (
          <div className="mt-6">
            <p className="mb-2 text-sm text-text">Confirm the category</p>
            <div className="grid grid-cols-2 gap-2">
              {GARMENT_TYPES.map((g) => (
                <button
                  key={g}
                  onClick={() => startCustomizing(g)}
                  className="rounded-shaklek-xs border border-border-strong py-3 text-sm text-text transition-colors hover:border-accent"
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

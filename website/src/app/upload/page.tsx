"use client";

import { useState } from "react";
import Header from "@/components/Header";
import CustomizeChat from "@/components/CustomizeChat";
import FabricColorPicker from "@/components/FabricColorPicker";
import SizePicker from "@/components/SizePicker";
import { createSpecFromUpload, type DesignSpec, type GarmentType } from "@/data/designSpec";

const GARMENT_TYPES: GarmentType[] = ["Shirt", "Skirt", "Pants", "Dress"];

type Stage = "select" | "customize" | "contact" | "sent";

export default function UploadPage() {
  const [stage, setStage] = useState<Stage>("select");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [spec, setSpec] = useState<DesignSpec | null>(null);
  const [note, setNote] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !preview || !email || !spec) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/custom-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          notes: [spec.freeformNotes, note].filter(Boolean).join("\n"),
          fileName: file.name,
          fileDataUrl: preview,
          garmentType: spec.garmentType,
          fabric: spec.fabric,
          color: spec.color,
          size: spec.sizeMode === "tailored" ? "Tailored" : spec.size,
          measurements: spec.sizeMode === "tailored" ? spec.measurements : "",
          changes: spec.changes.map((c) => c.label),
        }),
      });
      if (!res.ok) throw new Error("failed");
      setStage("sent");
    } catch {
      setStatus("error");
    }
  }

  if (stage === "sent") {
    return (
      <div className="flex flex-1 flex-col bg-bg">
        <Header />
        <div className="mx-auto w-full max-w-md flex-1 px-6 py-20 text-center">
          <h1 className="text-[26px] text-text">Got it</h1>
          <p className="subtitle mt-2">
            A stylist will look at your reference and follow up at{" "}
            <strong className="text-text">{email}</strong> within 24 hours
            to confirm details and get it to your tailor.
          </p>
        </div>
      </div>
    );
  }

  if (stage === "contact" && spec) {
    return (
      <div className="flex flex-1 flex-col bg-bg">
        <Header />
        <form
          onSubmit={handleSubmit}
          className="mx-auto w-full max-w-md flex-1 px-6 py-14"
        >
          <button
            type="button"
            onClick={() => setStage("customize")}
            className="mb-4 text-xs text-text-3 hover:text-text-2"
          >
            ← Back to customizing
          </button>
          <p className="text-xs tracking-wide text-text-3 uppercase">Last step</p>
          <h1 className="mt-1 text-[26px] text-text">Send it in</h1>
          <p className="subtitle">
            Your fabric, color, and every change you made are committed — a
            stylist confirms feasibility and pricing, they won&apos;t change
            what you designed.
          </p>

          <div className="mt-8">
            <label className="mb-2 block text-sm text-text">
              Add a note (optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="e.g. timing, sizing concerns, anything not covered above"
              className="w-full rounded-shaklek-xs border border-border-strong bg-white p-3 text-sm text-text placeholder:text-text-3 focus:border-accent focus:outline-none"
            />
            <p className="mt-2 text-xs text-text-3">
              We&apos;ll do our best to accommodate anything you add here —
              unlike the customization above, it&apos;s a request, not a
              commitment.
            </p>
          </div>

          <div className="mt-6">
            <label className="mb-2 block text-sm text-text">Your email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-shaklek-xs border border-border-strong bg-white p-3 text-sm text-text placeholder:text-text-3 focus:border-accent focus:outline-none"
            />
          </div>

          {status === "error" && (
            <p className="mt-4 text-sm text-red-600">
              Something went wrong sending that — try again in a moment.
            </p>
          )}

          <button
            type="submit"
            disabled={!email || status === "sending"}
            className="mt-8 w-full rounded-full bg-accent py-4 text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {status === "sending" ? "Sending…" : "Send to a stylist"}
          </button>
          <p className="mt-3 text-center text-xs text-text-3">
            A person reviews every upload — no logos, and it becomes clearly
            your own, not a copy.
          </p>
        </form>
      </div>
    );
  }

  if (stage === "customize" && spec) {
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
              previewImage={preview}
              previewGradient={["#f5f0e8", "#e8e4dc"]}
              suggestions={["Add side slits", "Add a front pocket", "Shorter sleeves"]}
            />
          </div>

          <div>
            <p className="text-xs tracking-wide text-text-3 uppercase">Step 2 of 3 — Your upload</p>
            <h1 className="mt-1 text-[26px] text-text">Customize it</h1>
            <p className="subtitle">
              Set a fabric and color, or leave it to the stylist to advise what fits best.
            </p>

            <FabricColorPicker
              fabric={spec.fabric}
              color={spec.color}
              onFabricChange={(fabric) => setSpec((s) => (s ? { ...s, fabric } : s))}
              onColorChange={(color) => setSpec((s) => (s ? { ...s, color } : s))}
            />

            <SizePicker
              sizeMode={spec.sizeMode}
              size={spec.size}
              measurements={spec.measurements}
              onSizeModeChange={(sizeMode) => setSpec((s) => (s ? { ...s, sizeMode } : s))}
              onSizeChange={(size) => setSpec((s) => (s ? { ...s, size } : s))}
              onMeasurementsChange={(measurements) =>
                setSpec((s) => (s ? { ...s, measurements } : s))
              }
            />

            <button
              onClick={() => setStage("contact")}
              disabled={!spec.constraints.passed}
              className="mt-10 w-full rounded-full bg-accent py-4 text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              Continue
            </button>
            {!spec.constraints.passed && (
              <p className="mt-2 text-center text-xs text-text-3">
                Resolve the flagged request in the chat before continuing.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col bg-bg">
      <Header />
      <div className="mx-auto w-full max-w-md flex-1 px-6 py-14">
        <p className="text-xs tracking-wide text-text-3 uppercase">Step 1 of 3</p>
        <h1 className="mt-1 text-[26px] text-text">Upload your own</h1>
        <p className="subtitle max-w-sm">
          Bring a photo, screenshot, or sketch — even something you saw on
          another brand. We&apos;ll adapt it into something that&apos;s
          clearly yours, made in cotton or linen.
        </p>
        <ol className="subtitle mt-3 list-decimal space-y-1 pl-4 text-xs">
          <li>Upload a reference and tell us what it is</li>
          <li>Customize fabric, color, and details with our stylist chat</li>
          <li>Send it in — a person confirms feasibility and price</li>
        </ol>

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
            <p className="mb-2 text-sm text-text">What kind of piece is this?</p>
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

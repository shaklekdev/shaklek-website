"use client";

import { useState } from "react";
import Header from "@/components/Header";
import CustomizeChat from "@/components/CustomizeChat";
import FabricColorPicker from "@/components/FabricColorPicker";
import { createSpecFromUpload, type DesignSpec, type GarmentType } from "@/data/designSpec";

const GARMENT_TYPES: GarmentType[] = ["Shirt", "Skirt", "Pants", "Dress"];

export default function UploadPage() {
  const [stage, setStage] = useState<"select" | "customize" | "sent">("select");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [spec, setSpec] = useState<DesignSpec | null>(null);
  const [notes, setNotes] = useState("");
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
          notes: [spec.freeformNotes, notes].filter(Boolean).join("\n"),
          fileName: file.name,
          fileDataUrl: preview,
          garmentType: spec.garmentType,
          fabric: spec.fabric,
          color: spec.color,
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
            with what&apos;s feasible and a price.
          </p>
        </div>
      </div>
    );
  }

  if (stage === "customize" && spec) {
    return (
      <div className="flex flex-1 flex-col bg-bg">
        <Header />
        <form
          onSubmit={handleSubmit}
          className="mx-auto grid w-full max-w-5xl gap-10 px-6 py-10 lg:grid-cols-2"
        >
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
            <p className="text-xs tracking-wide text-text-3 uppercase">Your upload</p>
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

            <div className="mt-8">
              <label className="mb-2 block text-sm text-text">
                Anything else the stylist should know?
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Optional — sizing, timing, anything not covered above"
                className="w-full rounded-shaklek-xs border border-border-strong bg-white p-3 text-sm text-text placeholder:text-text-3 focus:border-accent focus:outline-none"
              />
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
              disabled={!email || status === "sending" || !spec.constraints.passed}
              className="mt-8 w-full rounded-full bg-accent py-4 text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              {status === "sending" ? "Sending…" : "Send to a stylist"}
            </button>
            <p className="mt-3 text-center text-xs text-text-3">
              A person reviews every upload — no logos, and it becomes clearly
              your own, not a copy.
            </p>
          </div>
        </form>
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
          clearly yours, made in cotton or linen.
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

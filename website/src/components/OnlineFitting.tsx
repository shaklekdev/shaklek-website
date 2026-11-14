"use client";

import { useEffect, useRef, useState } from "react";
import { type Estimate, MeasureError, type Problem, type View, estimate } from "@/lib/bodyMeasure";
import { BRA_BANDS, BRA_CUPS, bustFromBra } from "@/lib/onlineFitting";

// ONLINE FITTING, the screen. Founder, 2026-11-13: "now your highest priority
// is to make that fitting online because many people don't want home
// fitting". The maths is in lib/bodyMeasure.ts.
//
// ⚠️ PRIVACY IS THE DESIGN, NOT A FEATURE:
//   - The photos are read from a file input, analysed in this tab, and
//     dropped. Nothing is uploaded, nothing is written to storage, nothing is
//     logged. Only the resulting NUMBERS leave, inside the order's existing
//     `measurements` string, when she adds to cart.
//   - The engine and model are self-hosted under /fitting/ (no third-party
//     origin sees the request) and loaded only when she starts.
//   - Consent is the "I agree, start" button, under the line saying exactly
//     that. Do not move the camera before that button.
//
// ⚠️ NEVER NAME THE TECHNOLOGY IN COPY (founder rule): no "AI", no library
// names, in text, alt or labels. It is "online fitting".
//
// ⚠️ THE NUMBERS ARE ESTIMATES until calibrated against tape measurements
// (bodyMeasure.ts CALIBRATION). The copy says "estimated" and that our team
// confirms them on WhatsApp, and she can correct every number before using it.

const TOPS = ["XS", "S", "M", "L", "XL", "XXL"];
const TROUSERS = ["32", "34", "36", "38", "40", "42", "44", "46"];

const PROBLEM_TEXT: Record<Problem, string> = {
  "no-person": "We could not see you in this photo. Use a plain wall and good light.",
  "not-full-body": "Your whole body must be in the photo, from the top of your head to your feet.",
  "front-not-facing": "Face the camera for the front photo.",
  "side-not-profile": "Turn fully to the side for the side photo.",
  "arms-touching": "Arms straight and pointing down, held out from your body like an A.",
  "legs-together": "Stand with your feet apart, about the width of your shoulders.",
  implausible: "These photos did not give reliable measurements. Please take them again following the tips.",
};

export type OnlineFittingResult = {
  estimate: Estimate;
  topSize: string;
  trouserSize: string;
  bra: string; // "75B" or ""
};

type Step = "height" | "front" | "side" | "working" | "result";

// Ranges for her corrections: bust/waist/hip match FIELD_LABELS in
// lib/measurements.ts; the rest are wide adult ranges. Out of range blocks
// "Use these measurements" (security review 2026-11-13: 99999 and 1e300 used
// to reach the order string).
const FIELDS: { key: keyof Estimate; label: string; min: number; max: number }[] = [
  { key: "bust", label: "Bust", min: 60, max: 160 },
  { key: "waist", label: "Waist", min: 50, max: 150 },
  { key: "hip", label: "Hip", min: 60, max: 170 },
  { key: "shoulder", label: "Shoulders", min: 25, max: 60 },
  { key: "sleeve", label: "Arm length", min: 30, max: 90 },
  { key: "outseam", label: "Waist to floor", min: 60, max: 140 },
  { key: "inseam", label: "Inside leg", min: 40, max: 110 },
];
// Inside leg may be left blank: it cannot be measured when the feet are
// together, and our team confirms it on WhatsApp.
const inRange = (f: (typeof FIELDS)[number], v: string | undefined) => {
  const n = Number(v);
  return v !== undefined && v.trim() !== "" && Number.isFinite(n) && n >= f.min && n <= f.max;
};

// The engine is ~25 MB; load it once per tab, only after consent.
type Landmarker = {
  detect: (img: HTMLCanvasElement) => {
    landmarks: { x: number; y: number; visibility?: number }[][];
    segmentationMasks?: { width: number; height: number; getAsFloat32Array: () => Float32Array; close: () => void }[];
  };
};
let landmarkerPromise: Promise<Landmarker> | null = null;
async function getCpuLandmarker(): Promise<Landmarker> {
  const { FilesetResolver, PoseLandmarker } = await import("@mediapipe/tasks-vision");
  const files = await FilesetResolver.forVisionTasks("/fitting");
  return (await PoseLandmarker.createFromOptions(files, {
    baseOptions: { modelAssetPath: "/fitting/pose-full.task", delegate: "CPU" },
    runningMode: "IMAGE",
    numPoses: 1,
    outputSegmentationMasks: true,
  })) as unknown as Landmarker;
}
function getLandmarker(): Promise<Landmarker> {
  if (!landmarkerPromise) {
    landmarkerPromise = (async () => {
      const { FilesetResolver, PoseLandmarker } = await import("@mediapipe/tasks-vision");
      const files = await FilesetResolver.forVisionTasks("/fitting");
      const make = (delegate: "GPU" | "CPU") =>
        PoseLandmarker.createFromOptions(files, {
          baseOptions: { modelAssetPath: "/fitting/pose-full.task", delegate },
          runningMode: "IMAGE",
          numPoses: 1,
          outputSegmentationMasks: true,
        });
      try {
        return (await make("GPU")) as unknown as Landmarker;
      } catch {
        return (await make("CPU")) as unknown as Landmarker;
      }
    })();
    landmarkerPromise.catch(() => {
      landmarkerPromise = null;
    });
  }
  return landmarkerPromise;
}

/** A failure the customer can quote to us: which stage broke. */
class StageError extends Error {
  constructor(public code: "decode" | "engine" | "detect", cause: unknown) {
    super(`${code}: ${cause instanceof Error ? cause.message : String(cause)}`);
  }
}

// ⚠️ DECODE THROUGH AN <img>, NOT createImageBitmap. On the founder's iPhone
// (2026-11-13) the first version looped back to photo 1 with nothing measured:
// iPhone photos are often HEIC, which Safari's <img> decodes but
// createImageBitmap(file, {imageOrientation}) does not reliably. An <img>
// also applies the EXIF rotation by default in every current browser.
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("image could not be read"));
    };
    img.src = url;
  });
}

/** Decode, downscale, analyse, drop the pixels. */
async function analyse(file: File): Promise<View> {
  let img: HTMLImageElement;
  try {
    img = await loadImage(file);
  } catch (e) {
    throw new StageError("decode", e);
  }
  const w0 = img.naturalWidth;
  const h0 = img.naturalHeight;
  const scale = Math.min(1, 1280 / Math.max(w0, h0));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(w0 * scale);
  canvas.height = Math.round(h0 * scale);
  canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
  img.src = "";
  let lm: Landmarker;
  try {
    lm = await getLandmarker();
  } catch (e) {
    throw new StageError("engine", e);
  }
  let res: ReturnType<Landmarker["detect"]>;
  try {
    res = lm.detect(canvas);
  } catch (e) {
    // Some phones create the GPU engine but fail on first use; retry on CPU.
    try {
      landmarkerPromise = getCpuLandmarker();
      res = (await landmarkerPromise).detect(canvas);
    } catch (e2) {
      throw new StageError("detect", e2 ?? e);
    }
  }
  const maskObj = res.segmentationMasks?.[0];
  const landmarks = res.landmarks[0] ?? [];
  let mask = new Uint8Array(0);
  let width = canvas.width;
  let height = canvas.height;
  if (maskObj) {
    const f = maskObj.getAsFloat32Array();
    width = maskObj.width;
    height = maskObj.height;
    mask = new Uint8Array(f.length);
    for (let i = 0; i < f.length; i++) mask[i] = f[i] > 0.5 ? 1 : 0;
    maskObj.close();
  }
  // Release the pixels: the canvas is never attached to the page.
  canvas.width = 0;
  canvas.height = 0;
  return { mask, width, height, landmarks };
}

function Pose({ side }: { side?: boolean }) {
  // A plain outline of the pose to copy. Line drawing, no photograph.
  return side ? (
    <svg viewBox="0 0 60 120" className="h-28 w-14 text-text-3" aria-hidden="true">
      <circle cx="30" cy="12" r="8" fill="none" stroke="currentColor" />
      <path d="M30 20v38M30 26l4 30M30 58l-2 28 0 26M30 58l2 28 0 26" fill="none" stroke="currentColor" strokeLinecap="round" />
    </svg>
  ) : (
    <svg viewBox="0 0 80 120" className="h-28 w-20 text-text-3" aria-hidden="true">
      <circle cx="40" cy="12" r="8" fill="none" stroke="currentColor" />
      <path d="M40 20v38M40 26l-24 24M40 26l24 24M40 58l-14 54M40 58l14 54" fill="none" stroke="currentColor" strokeLinecap="round" />
    </svg>
  );
}

export default function OnlineFitting({
  onDone,
  onClose,
}: {
  onDone: (r: OnlineFittingResult) => void;
  onClose: () => void;
}) {
  // No intro screen (founder, 2026-11-13: "I agree" felt like asking for
  // something private). The privacy line sits under the photo buttons.
  const [step, setStep] = useState<Step>("height");
  const [braBand, setBraBand] = useState("");
  const [braCup, setBraCup] = useState("");
  const [height, setHeight] = useState("");
  const [topSize, setTopSize] = useState("");
  const [trouserSize, setTrouserSize] = useState("");
  const [front, setFrontFile] = useState<File | null>(null);
  // Local preview of the front photo (an object URL: stays in this tab,
  // never uploaded), so she can see which photo she is about to use.
  const [frontUrl, setFrontUrl] = useState<string | null>(null);
  const urlRef = useRef<string | null>(null);
  const setFront = (file: File | null) => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = file ? URL.createObjectURL(file) : null;
    setFrontUrl(urlRef.current);
    setFrontFile(file);
  };
  useEffect(
    () => () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    },
    [],
  );
  const [error, setError] = useState<string | null>(null);
  const [est, setEst] = useState<Estimate | null>(null);
  const [edits, setEdits] = useState<Record<string, string>>({});
  const frontCam = useRef<HTMLInputElement>(null);
  const frontLib = useRef<HTMLInputElement>(null);
  const sideCam = useRef<HTMLInputElement>(null);
  const sideLib = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  useEffect(() => {
    void getLandmarker().catch(() => {});
  }, []);

  const h = Number(height);
  const heightOk = Number.isFinite(h) && h >= 130 && h <= 210;

  async function run(sideFile: File) {
    if (!front) return;
    setStep("working");
    setError(null);
    try {
      const [fv, sv] = await Promise.all([analyse(front), analyse(sideFile)]);
      const e = estimate(fv, sv, h);
      // A bra size she gave beats the photo bust (its weakest number).
      const fromBra = braBand && braCup ? bustFromBra(Number(braBand), braCup) : null;
      if (fromBra) e.bust = fromBra;
      setEst(e);
      setEdits(Object.fromEntries(FIELDS.map((f) => [f.key, String(e[f.key])])));
      setStep("result");
    } catch (err) {
      if (err instanceof MeasureError) {
        const which = err.view === "side" ? "side photo" : err.view === "front" ? "front photo" : "photos";
        setError(`${PROBLEM_TEXT[err.problem]} (Your ${which}. Code: ${err.problem})`);
        setStep(err.view === "side" ? "side" : "front");
        if (err.view !== "side") setFront(null);
      } else {
        const code = err instanceof StageError ? err.code : "other";
        setError(
          `We could not read the photos on this phone. Try again, or choose the private home fitting. (Code: ${code})`,
        );
        setStep("front");
        setFront(null);
      }
    }
  }

  function pick(which: "front" | "side", input: HTMLInputElement) {
    const file = input.files?.[0];
    // Cleared so choosing the SAME photo again still fires onChange (a retake
    // with the same file used to do nothing at all).
    input.value = "";
    if (!file) return;
    setError(null);
    if (which === "front") {
      setFront(file);
      setStep("side");
    } else {
      void run(file);
    }
  }

  function finish() {
    if (!est) return;
    const out = { ...est };
    for (const f of FIELDS) {
      if (!inRange(f, edits[f.key])) return;
      out[f.key] = Math.round(Number(edits[f.key]));
    }
    onDone({ estimate: out, topSize, trouserSize, bra: braBand && braCup ? `${braBand}${braCup}` : "" });
  }

  const btn = "flex min-h-11 w-full items-center justify-center bg-text px-6 text-sm text-white disabled:opacity-40";
  const btn2 = "flex min-h-11 w-full items-center justify-center border border-border-strong px-6 text-sm text-text";
  const label = "text-[11px] uppercase tracking-[0.14em] text-text-2";

  const BACK: Partial<Record<Step, Step>> = { front: "height", side: "front", result: "side" };
  const STEP_NO: Partial<Record<Step, [number, string]>> = {
    height: [1, "Height"],
    front: [2, "Front photo"],
    side: [3, "Side photo"],
  };
  const header = (
    // pointer-events-none on the bar: it spans the top of the sheet and sat on
    // top of the close button, so × did nothing (founder, 2026-11-13).
    <div className="pointer-events-none absolute left-0 right-0 top-0 flex h-12 items-center justify-between px-2">
      {BACK[step] ? (
        <button
          type="button"
          onClick={() => {
            setError(null);
            setStep(BACK[step]!);
          }}
          className="pointer-events-auto flex h-11 items-center px-3 text-[13px] text-text-2"
        >
          ← Back
        </button>
      ) : (
        <span />
      )}
      {STEP_NO[step] ? (
        <span className="text-[11px] uppercase tracking-[0.14em] text-text-3">
          Step {STEP_NO[step]![0]} of 3
        </span>
      ) : null}
      <span className="w-11" />
    </div>
  );

  const fileInputs = (
    <>
      <input ref={frontCam} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => pick("front", e.currentTarget)} />
      <input ref={frontLib} type="file" accept="image/*" className="hidden" onChange={(e) => pick("front", e.currentTarget)} />
      <input ref={sideCam} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => pick("side", e.currentTarget)} />
      <input ref={sideLib} type="file" accept="image/*" className="hidden" onChange={(e) => pick("side", e.currentTarget)} />
    </>
  );

  return (
    <div role="dialog" aria-modal="true" aria-label="Virtual fitting" className="fixed inset-0 z-[70] flex items-end justify-center bg-black/40 sm:items-center">
      <div className="relative max-h-[92dvh] w-full overflow-y-auto bg-white px-6 pb-8 pt-12 sm:max-w-md">
        <button type="button" onClick={onClose} aria-label="Close" className="absolute right-2 top-1 z-10 flex h-11 w-11 items-center justify-center text-2xl text-text-2">
          ×
        </button>
        {fileInputs}
        {header}

        {/* LEAST TEXT (founder, 2026-11-13: "people don't like reading
            anymore. concise steps, bullet points"). Keep every screen to a
            title, at most three short bullets and one button. */}
        {step === "height" && (
          <>
            <p className="font-display text-[22px] leading-tight text-text">Your height</p>
            <label className="mt-5 block">
              <span className={label}>cm, without shoes</span>
              <input
                type="number"
                inputMode="numeric"
                min={130}
                max={210}
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="mt-2 block w-full border border-border-strong px-3 py-3 text-[16px] text-text"
                placeholder="130–210"
              />
            </label>
            <p className={`mt-6 ${label}`}>Usual size (optional)</p>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <label className="block text-[12px] text-text-2">
                Tops
                <select value={topSize} onChange={(e) => setTopSize(e.target.value)} className="mt-1 block w-full border border-border-strong bg-white px-2 py-2.5 text-[15px] text-text">
                  <option value="">Not sure</option>
                  {TOPS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </label>
              <label className="block text-[12px] text-text-2">
                Trousers
                <select value={trouserSize} onChange={(e) => setTrouserSize(e.target.value)} className="mt-1 block w-full border border-border-strong bg-white px-2 py-2.5 text-[15px] text-text">
                  <option value="">Not sure</option>
                  {TROUSERS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </label>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <label className="block text-[12px] text-text-2">
                Bra (EU / UK)
                <select value={braBand} onChange={(e) => setBraBand(e.target.value)} className="mt-1 block w-full border border-border-strong bg-white px-2 py-2.5 text-[15px] text-text">
                  <option value="">Not sure</option>
                  {BRA_BANDS.map((b) => <option key={b.eu} value={b.eu}>{b.eu} / {b.uk}</option>)}
                </select>
              </label>
              <label className="block text-[12px] text-text-2">
                Cup
                <select value={braCup} onChange={(e) => setBraCup(e.target.value)} className="mt-1 block w-full border border-border-strong bg-white px-2 py-2.5 text-[15px] text-text">
                  <option value="">–</option>
                  {BRA_CUPS.map((c) => <option key={c}>{c}</option>)}
                </select>
              </label>
            </div>
            <button type="button" disabled={!heightOk} className={`mt-8 ${btn}`} onClick={() => setStep("front")}>
              Next
            </button>
          </>
        )}

        {(step === "front" || step === "side") && (
          <>
            <p className="font-display text-[22px] leading-tight text-text">
              {step === "front" ? "From the front" : "From the side"}
            </p>
            <div className="mt-5 flex items-center gap-5">
              <Pose side={step === "side"} />
              <ul className="space-y-1.5 text-[14px] text-text">
                {step === "front" ? (
                  <>
                    <li>Arms out, like an A</li>
                    <li>Feet apart</li>
                  </>
                ) : (
                  <>
                    <li>Turn to your right</li>
                    <li>Arms down, hair tied back</li>
                  </>
                )}
                <li>Head to feet in the photo</li>
              </ul>
            </div>
            {error && (
              <p role="alert" className="mt-5 bg-surface-2 px-4 py-3 text-[13px] leading-relaxed text-text">
                {error}
              </p>
            )}
            {step === "side" && frontUrl ? (
              <div className="mt-5 flex items-center gap-3 text-[12px] text-text-2">
                {/* eslint-disable-next-line @next/next/no-img-element -- local object URL, never uploaded */}
                <img src={frontUrl} alt="" className="h-14 w-10 object-cover" />
                <span>Front photo ✓</span>
                <button type="button" onClick={() => setStep("front")} className="ml-auto underline underline-offset-4">
                  Change
                </button>
              </div>
            ) : null}
            <div className="mt-6 space-y-2">
              <button type="button" className={btn} onClick={() => (step === "front" ? frontCam : sideCam).current?.click()}>
                Take the photo
              </button>
              <button type="button" className={btn2} onClick={() => (step === "front" ? frontLib : sideLib).current?.click()}>
                Choose from my photos
              </button>
            </div>
            <p className="mt-3 text-center text-[12px] text-text-3">
              Alone? Use your camera&apos;s timer. Photos stay on your phone.
            </p>
          </>
        )}

        {step === "working" && (
          <div className="py-16 text-center" aria-live="polite">
            <span aria-hidden="true" className="mx-auto mb-5 block h-8 w-8 animate-spin rounded-full border-2 border-border border-t-text" />
            <p className="font-display text-[20px] text-text">Measuring…</p>
          </div>
        )}

        {step === "result" && est && (
          <>
            <p className="font-display text-[22px] leading-tight text-text">Your measurements</p>
            <p className="mt-2 text-[12px] text-text-3">Edit if needed. We confirm them on WhatsApp.</p>
            <div className="mt-5 divide-y divide-border border-y border-border">
              {FIELDS.map((f) => (
                <label key={f.key} className="flex items-center justify-between py-2.5 text-[13px] text-text-2">
                  {f.label}
                  <span className="flex items-center gap-1.5">
                    <input
                      type="number"
                      inputMode="numeric"
                      value={edits[f.key] ?? ""}
                      onChange={(e) => setEdits((x) => ({ ...x, [f.key]: e.target.value }))}
                      min={f.min}
                      max={f.max}
                      aria-invalid={!inRange(f, edits[f.key])}
                      className={`w-16 border px-2 py-1.5 text-right text-[15px] text-text ${inRange(f, edits[f.key]) ? "border-border" : "border-red-400"}`}
                    />
                    <span className="text-text-3">cm</span>
                  </span>
                </label>
              ))}
            </div>
            <button type="button" disabled={!FIELDS.every((f) => inRange(f, edits[f.key]))} className={`mt-6 ${btn}`} onClick={finish}>
              Use these measurements
            </button>
            <button type="button" className="mt-3 w-full text-center text-[12px] text-text-2 underline underline-offset-4" onClick={() => { setFront(null); setEst(null); setStep("front"); }}>
              Retake
            </button>
          </>
        )}
      </div>
    </div>
  );
}

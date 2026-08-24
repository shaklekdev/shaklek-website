import fs from "node:fs";
import sharp from "../../node_modules/sharp/dist/index.cjs";

// Generate an edit and automatically verify it before accepting. Today's two
// dominant failure modes on this catalog were (1) the model returns the source
// essentially unchanged, and (2) the garment colour drifts to something else
// entirely (green/rust). Both are cheaply detectable, so check them here and
// retry rather than surfacing a bad image for manual review.

const GEMINI_API_KEY = fs.readFileSync(new URL("../../.env.local", import.meta.url), "utf8")
  .split("\n").find(l => l.startsWith("GEMINI_API_KEY="))?.split("=").slice(1).join("=").trim();
if (!GEMINI_API_KEY) throw new Error("no GEMINI_API_KEY");

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4;
    }
    h /= 6;
  }
  return [h * 360, s, l];
}

function hueDist(a, b) {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

// Dominant hue among sufficiently-saturated pixels == the dyed garment.
async function dominantHue(path) {
  const { data, info } = await sharp(path).raw().toBuffer({ resolveWithObject: true });
  const bins = new Array(36).fill(0);
  const sums = new Array(36).fill(0);
  for (let i = 0; i < data.length; i += info.channels) {
    const [h, s] = rgbToHsl(data[i], data[i + 1], data[i + 2]);
    if (s < 0.18) continue;
    const b = Math.floor(h / 10) % 36;
    bins[b]++; sums[b] += h;
  }
  let best = 0;
  for (let b = 1; b < 36; b++) if (bins[b] > bins[best]) best = b;
  return bins[best] ? sums[best] / bins[best] : null;
}

// Mean absolute difference against the source, on a common small canvas.
async function meanAbsDiff(a, b) {
  const W = 200, H = 240;
  const [ba, bb] = await Promise.all([
    sharp(a).resize(W, H, { fit: "fill" }).greyscale().raw().toBuffer(),
    sharp(b).resize(W, H, { fit: "fill" }).greyscale().raw().toBuffer(),
  ]);
  let sum = 0;
  for (let i = 0; i < ba.length; i++) sum += Math.abs(ba[i] - bb[i]);
  return sum / ba.length;
}

async function callModel(inputPath, prompt, model) {
  const imgB64 = fs.readFileSync(inputPath).toString("base64");
  const res = await fetch(
    // The key travels in a header, never in the URL. A URL carrying
    // `?key=...` ends up in proxy logs, gateway records and any error message
    // someone pastes into an issue -- and this key bills real money against a
    // capped budget. gen-flat.mjs already did this; these older scripts were
    // never brought in line, and they are the ones a catalog batch runs
    // through. Flagged by the pre-batch security review, 2026-08-25.
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }, { inline_data: { mime_type: "image/png", data: imgB64 } }] }],
      }),
    }
  );
  const json = await res.json();
  if (!res.ok) {
    const err = new Error(json?.error?.message || "request failed");
    err.status = json?.error?.code || res.status;
    throw err;
  }
  const parts = json?.candidates?.[0]?.content?.parts || [];
  const imgPart = parts.find(p => p.inlineData || p.inline_data);
  if (!imgPart) throw new Error("no image in response");
  return Buffer.from((imgPart.inlineData || imgPart.inline_data).data, "base64");
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

export async function generateVerified({
  inputPath, outputPath, prompt, expectedHex,
  model = "gemini-2.5-flash-image",
  maxAttempts = 4,
  minDiff = 3.0,        // below this, the model effectively returned the source
  maxHueDrift = 35,     // degrees away from the expected garment hue
}) {
  const [expH, expS] = rgbToHsl(
    parseInt(expectedHex.slice(1, 3), 16),
    parseInt(expectedHex.slice(3, 5), 16),
    parseInt(expectedHex.slice(5, 7), 16)
  );
  const checkHue = expS >= 0.15; // pale targets have no meaningful hue to check

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    let buf;
    try {
      buf = await callModel(inputPath, prompt, model);
    } catch (e) {
      if (e.status === 503 || e.status === 429) {
        const wait = 5000 * attempt;
        console.error(`  attempt ${attempt}: ${e.status}, backing off ${wait}ms`);
        await sleep(wait);
        continue;
      }
      console.error(`  attempt ${attempt}: ${e.message}`);
      continue;
    }

    const tmp = outputPath + ".tmp.png";
    fs.writeFileSync(tmp, buf);

    const diff = await meanAbsDiff(inputPath, tmp);
    const hue = checkHue ? await dominantHue(tmp) : null;
    const drift = hue == null ? 0 : hueDist(hue, expH);

    const changed = diff >= minDiff;
    const colorOk = !checkHue || drift <= maxHueDrift;

    if (changed && colorOk) {
      fs.renameSync(tmp, outputPath);
      console.log(`  OK attempt ${attempt} (diff=${diff.toFixed(1)}, hueDrift=${drift.toFixed(0)})`);
      return true;
    }

    // Keep rejected attempts instead of deleting them. A reject is the most
    // useful image in a failed batch: it is the only way to tell a bad
    // generation apart from a bad verifier setting. Deleting them cost a real
    // batch on 2026-08-21 -- four paid images destroyed by a wrong hue target.
    const rejectPath = `${outputPath}.rejected-${attempt}.png`;
    fs.renameSync(tmp, rejectPath);
    const why = !changed ? `unchanged (diff=${diff.toFixed(1)})` : `colour drift (${drift.toFixed(0)}deg)`;
    console.error(`  attempt ${attempt} rejected: ${why} -> ${rejectPath}`);
  }
  console.error(`  FAILED after ${maxAttempts} attempts`);
  return false;
}

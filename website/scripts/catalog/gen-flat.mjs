import fs from "node:fs";
import path from "node:path";
import sharp from "../../node_modules/sharp/dist/index.cjs";

// Turn a catalog photograph into a technical flat -- the line drawing a tailor
// cuts from. Conditioned image-to-image on the real combination photo rather
// than generated from a description, so the flat inherits the hem length,
// sleeve length and leg width that were actually photographed instead of
// whatever the model imagines a "wide cropped trouser" looks like.
//
// gen-verified.mjs cannot verify these: its two checks are colour drift and
// greyscale pixel-diff, and a flat is deliberately achromatic and deliberately
// enormously different from its source. So the checks here are the ones that
// actually distinguish a flat from the failure modes:
//
//   achromatic   the navy fabric and the model's skin are gone (a returned or
//                lightly-filtered photograph fails this outright)
//   background   the outer ring is white, not the photo's beige backdrop
//   ink          1.5-35% of the frame is line work -- catches both a blank
//                page and a returned photograph
//   symmetry     a flat is laid open and symmetric; a traced pose is not.
//                Reported always, enforced only past an egregious value,
//                because some garments here really are asymmetric (Wrap Top).
//
// None of these share a threshold with the prompt or with each other, so a
// pass is four independent signals rather than one restated four times.

const GEMINI_API_KEY = fs
  .readFileSync(new URL("../../.env.local", import.meta.url), "utf8")
  .split("\n")
  .find((l) => l.startsWith("GEMINI_API_KEY="))
  ?.split("=")
  .slice(1)
  .join("=")
  .trim();
if (!GEMINI_API_KEY) throw new Error("no GEMINI_API_KEY");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------- measuring

const GREY = { W: 400, H: 480 };

async function grey(file) {
  const { data, info } = await sharp(file)
    .resize(GREY.W, GREY.H, { fit: "fill" })
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return { data, w: info.width, h: info.height };
}

// Max saturation per pixel, cheaply: (max-min)/max on the raw RGB.
async function chroma(file) {
  const { data, info } = await sharp(file)
    .resize(300, 360, { fit: "fill" })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const ch = info.channels;
  let sum = 0,
    n = 0,
    loud = 0;
  for (let i = 0; i < data.length; i += ch) {
    const r = data[i],
      g = data[i + 1],
      b = data[i + 2];
    const max = Math.max(r, g, b),
      min = Math.min(r, g, b);
    const s = max === 0 ? 0 : (max - min) / max;
    sum += s;
    n++;
    if (s > 0.35) loud++;
  }
  return { meanSat: sum / n, loudFrac: loud / n };
}

// Fraction of the frame that is line work.
function inkFraction({ data }) {
  let ink = 0;
  for (let i = 0; i < data.length; i++) if (data[i] < 216) ink++;
  return ink / data.length;
}

// The outer ring must be paper-white. The photographs have a beige studio
// backdrop, so this alone separates "flat on white" from "filtered photo".
function borderWhiteness({ data, w, h }) {
  const m = Math.round(Math.min(w, h) * 0.03);
  let white = 0,
    n = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (x >= m && x < w - m && y >= m && y < h - m) continue;
      n++;
      if (data[y * w + x] >= 242) white++;
    }
  }
  return white / n;
}

// Mean absolute difference against the horizontal mirror, measured about the
// ink's own centre of mass rather than the frame centre -- otherwise a
// perfectly symmetric flat sitting slightly off-centre scores as asymmetric.
function symmetryScore({ data, w, h }) {
  let sx = 0,
    tot = 0;
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const v = 255 - data[y * w + x];
      sx += v * x;
      tot += v;
    }
  if (!tot) return 999;
  const cx = Math.round(sx / tot);
  let sum = 0,
    n = 0;
  for (let y = 0; y < h; y++) {
    for (let d = 1; d < Math.min(cx, w - cx); d++) {
      sum += Math.abs(data[y * w + (cx - d)] - data[y * w + (cx + d)]);
      n++;
    }
  }
  return n ? sum / n : 999;
}

export async function measureFlat(file) {
  const g = await grey(file);
  const { meanSat, loudFrac } = await chroma(file);
  return {
    meanSat,
    loudFrac,
    ink: inkFraction(g),
    border: borderWhiteness(g),
    symmetry: symmetryScore(g),
  };
}

// The ink bounds are set from the real distribution across 64 generated flats,
// not from guesswork. Genuine line art clusters tightly at 1.6-3.6% (median
// 2.4%). The first ceiling here was 35%, picked in the abstract, and it let
// through four drawings that filled the garment with solid grey instead of
// leaving it white -- a fill has no saturation, so the achromatic check cannot
// see it, and 15-28% ink was the only signal that separated them.
const LIMITS = {
  meanSat: 0.12, // above: colour survived
  loudFrac: 0.02, // above: saturated regions survived (fabric, skin)
  inkMin: 0.012, // below: blank page
  inkMax: 0.08, // above: the garment is filled or shaded, not drawn
  border: 0.97, // below: the photo backdrop survived
  symmetry: 42, // above: a traced pose, not a garment laid flat
};

export function judgeFlat(m, { symmetric = true } = {}) {
  const fails = [];
  if (m.meanSat > LIMITS.meanSat) fails.push(`colour survived (sat ${m.meanSat.toFixed(3)})`);
  if (m.loudFrac > LIMITS.loudFrac)
    fails.push(`saturated regions (${(m.loudFrac * 100).toFixed(1)}%)`);
  if (m.ink < LIMITS.inkMin) fails.push(`near-blank (ink ${(m.ink * 100).toFixed(1)}%)`);
  if (m.ink > LIMITS.inkMax) fails.push(`filled or shaded, not line art (ink ${(m.ink * 100).toFixed(1)}%)`);
  if (m.border < LIMITS.border)
    fails.push(`background not white (${(m.border * 100).toFixed(1)}%)`);
  if (symmetric && m.symmetry > LIMITS.symmetry)
    fails.push(`asymmetric (${m.symmetry.toFixed(0)})`);
  return fails;
}

// ---------------------------------------------------------------- the model

async function callModel(inputPath, prompt, model) {
  const imgB64 = fs.readFileSync(inputPath).toString("base64");
  // The key goes in a header, not the query string. A URL carrying `?key=...`
  // ends up in proxy logs, gateway records and any error message someone
  // pastes into an issue -- and this key bills real money. Verified both forms
  // authenticate; only this one keeps the secret out of the URL.
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": GEMINI_API_KEY },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }, { inline_data: { mime_type: "image/png", data: imgB64 } }],
          },
        ],
      }),
    },
  );
  const json = await res.json();
  if (!res.ok) {
    const err = new Error(json?.error?.message || "request failed");
    err.status = json?.error?.code || res.status;
    throw err;
  }
  const parts = json?.candidates?.[0]?.content?.parts || [];
  const imgPart = parts.find((p) => p.inlineData || p.inline_data);
  if (!imgPart) throw new Error("no image in response");
  return Buffer.from((imgPart.inlineData || imgPart.inline_data).data, "base64");
}

export async function generateFlat({
  inputPath,
  outputPath,
  prompt,
  symmetric = true,
  model = "gemini-2.5-flash-image",
  maxAttempts = 3,
}) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
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
    const m = await measureFlat(tmp);
    const fails = judgeFlat(m, { symmetric });

    if (fails.length === 0) {
      // Compress only AFTER the checks have passed. A flat is achromatic by
      // definition and the verifier has just proved it, so dropping to
      // greyscale is lossless here and takes ~490KB of RGB noise down to
      // ~86KB. Compressing first would make the achromatic check circular --
      // it would be testing sharp's greyscale conversion, not the model's
      // output. Palette PNG rather than the catalog's JPEG convention: q92
      // rings on line art, and 64 flats fit either way.
      await sharp(tmp)
        .greyscale()
        .png({ compressionLevel: 9, palette: true, colours: 16 })
        .toFile(outputPath);
      fs.unlinkSync(tmp);
      console.log(
        `  OK attempt ${attempt} (ink=${(m.ink * 100).toFixed(1)}% sym=${m.symmetry.toFixed(0)} border=${(m.border * 100).toFixed(1)}%)`,
      );
      return { ok: true, metrics: m };
    }

    // Rejected attempts are kept, per CLAUDE.md 4b -- every generation is money
    // already spent, and a reject is the only way to tell a bad generation
    // apart from a bad threshold.
    const rejectPath = `${outputPath}.rejected-${attempt}.png`;
    fs.renameSync(tmp, rejectPath);
    console.error(`  attempt ${attempt} rejected: ${fails.join("; ")} -> ${rejectPath}`);
  }
  console.error(`  FAILED after ${maxAttempts} attempts`);
  return { ok: false };
}

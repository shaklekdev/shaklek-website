import fs from "node:fs";

// Three-image edit. edit2 takes one reference; this takes two, because a shot
// can need a garment from one place and a construction detail from another.
//
// ⚠️ IT EXISTS FOR THE FOLD. The Open Abaya's folded front edge has been lost
// in almost every generation that changed anything else -- model, hijab, what
// is worn underneath -- and it is the entire design. Describing it has failed
// repeatedly across a dozen attempts; CLAUDE.md §4b says references beat
// descriptions and has said so since the trouser shoot. So the fold now
// travels as a CROP of the real thing, not as a sentence.
//
// ⚠️ FENCE EVERY REFERENCE TO ONE PROPERTY, in its label. A front view passed
// in "for framing" put front-facing shoes on a back view twice in another
// session. Say what to take AND what to ignore.

const [, , inputPath, ref1Path, ref2Path, outputPath, prompt, model] = process.argv;
const GEMINI_API_KEY = fs
  .readFileSync(new URL("../../.env.local", import.meta.url), "utf8")
  .split("\n").find((l) => l.startsWith("GEMINI_API_KEY="))?.split("=").slice(1).join("=").trim();
if (!GEMINI_API_KEY) throw new Error("no GEMINI_API_KEY");

const part = (label, p) => [
  { text: label },
  { inline_data: { mime_type: "image/png", data: fs.readFileSync(p).toString("base64") } },
];

const body = {
  contents: [{
    role: "user",
    parts: [
      ...part(process.env.EDIT3_INPUT_LABEL || "IMAGE 1 -- the photo to edit:", inputPath),
      ...part(process.env.EDIT3_REF1_LABEL || "IMAGE 2 -- reference only:", ref1Path),
      ...part(process.env.EDIT3_REF2_LABEL || "IMAGE 3 -- reference only:", ref2Path),
      { text: prompt },
    ],
  }],
};

const res = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/${model || "gemini-2.5-flash-image"}:generateContent`,
  { method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": GEMINI_API_KEY }, body: JSON.stringify(body) },
);
const json = await res.json();
if (!res.ok) { console.error(JSON.stringify(json, null, 2)); process.exit(1); }
const parts = json?.candidates?.[0]?.content?.parts || [];
const img = parts.find((p) => p.inlineData || p.inline_data);
if (!img) { console.error("no image:", JSON.stringify(json, null, 2)); process.exit(1); }
fs.writeFileSync(outputPath, Buffer.from((img.inlineData || img.inline_data).data, "base64"));
console.log("wrote", outputPath);

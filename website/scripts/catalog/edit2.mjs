import fs from "node:fs";

// Two-image edit: the image to change, plus a labelled reference image the
// model should copy a detail from. Sending the front view alongside the back
// gives the model something concrete to match instead of only a description.

const [, , inputPath, refPath, outputPath, prompt, model] = process.argv;
const GEMINI_API_KEY = fs.readFileSync(new URL("../../.env.local", import.meta.url), "utf8")
  .split("\n").find(l => l.startsWith("GEMINI_API_KEY="))?.split("=").slice(1).join("=").trim();
if (!GEMINI_API_KEY) throw new Error("no GEMINI_API_KEY");

const body = {
  contents: [{
    role: "user",
    parts: [
      { text: process.env.EDIT2_INPUT_LABEL || "IMAGE 1 -- this is the photo to edit:" },
      { inline_data: { mime_type: "image/png", data: fs.readFileSync(inputPath).toString("base64") } },
      { text: process.env.EDIT2_REF_LABEL || "IMAGE 2 -- reference only, do NOT edit this one. It shows the detail to copy:" },
      { inline_data: { mime_type: "image/png", data: fs.readFileSync(refPath).toString("base64") } },
      { text: prompt },
    ],
  }],
  // ⚠️ PIN THE ASPECT RATIO OR THE MODEL MAY RETURN A GRID. Three generations
  // came back as 2- and 3-panel contact sheets -- 1408x768, landscape -- and an
  // explicit "ONE SINGLE PHOTOGRAPH, no panels, no grid" line at the top of the
  // prompt did not stop it. Constraining the output to 2:3 portrait makes a
  // side-by-side layout impossible to draw. CLAUDE.md already documents this
  // config for the abaya shoot; it was simply never carried into these scripts.
  generationConfig: { imageConfig: { aspectRatio: "2:3" } },
};

const res = await fetch(
  // Key in a header, not the URL -- see the note in gen-verified.mjs.
  `https://generativelanguage.googleapis.com/v1beta/models/${model || "gemini-2.5-flash-image"}:generateContent`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": GEMINI_API_KEY },
    body: JSON.stringify(body),
  }
);
const json = await res.json();
if (!res.ok) { console.error(JSON.stringify(json, null, 2)); process.exit(1); }
const parts = json?.candidates?.[0]?.content?.parts || [];
const img = parts.find(p => p.inlineData || p.inline_data);
if (!img) { console.error("no image:", JSON.stringify(json, null, 2)); process.exit(1); }
fs.writeFileSync(outputPath, Buffer.from((img.inlineData || img.inline_data).data, "base64"));
console.log("wrote", outputPath);

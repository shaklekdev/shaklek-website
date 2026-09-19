// Pure text-to-image, no source photograph.
//
// ⚠️ WHY THIS EXISTS. The abaya masters were built by editing an existing
// catalogue photo nineteen times. Every edit re-renders the whole frame, so
// the model's face went flat and the fabric lost detail -- and each round was
// archived as JPEG q92 and then fed back in as the next input, compounding it.
// A fresh single-pass generation has none of that history.
import fs from "node:fs";
import path from "node:path";

const [, , outputPath, prompt, model] = process.argv;
const modelId = model || "gemini-3-pro-image";
const root = path.resolve(process.cwd());
const env = fs.readFileSync(path.join(root, ".env.local"), "utf8");
const key = env.match(/GEMINI_API_KEY=(.+)/)[1].trim();

const res = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${key}`,
  { method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      // ⚠️ THE CATALOGUE IS 2:3 PORTRAIT. Without this the model defaults to
      // landscape and the figure ends up small in a wide frame.
      generationConfig: { imageConfig: { aspectRatio: "2:3" } },
    }) });

const json = await res.json();
if (!res.ok) { console.error(JSON.stringify(json).slice(0, 600)); process.exit(1); }
const part = json.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
if (!part) { console.error("no image:", JSON.stringify(json).slice(0, 600)); process.exit(1); }
fs.writeFileSync(outputPath, Buffer.from(part.inlineData.data, "base64"));
console.log("wrote", outputPath);

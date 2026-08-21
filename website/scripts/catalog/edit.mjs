import fs from "node:fs";

const [, , inputPath, outputPath, prompt, model] = process.argv;
const GEMINI_API_KEY = fs.readFileSync(new URL("../../.env.local", import.meta.url), "utf8")
  .split("\n").find(l => l.startsWith("GEMINI_API_KEY="))?.split("=").slice(1).join("=").trim();

if (!GEMINI_API_KEY) throw new Error("no GEMINI_API_KEY");

const imgB64 = fs.readFileSync(inputPath).toString("base64");
const modelId = model || "gemini-2.5-flash-image";

// No wrapper template -- the prompt passed in is sent to the model exactly as-is.
const body = {
  contents: [
    {
      role: "user",
      parts: [
        { text: prompt },
        { inline_data: { mime_type: "image/png", data: imgB64 } },
      ],
    },
  ],
};

const res = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${GEMINI_API_KEY}`,
  { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }
);

const json = await res.json();
if (!res.ok) { console.error(JSON.stringify(json, null, 2)); process.exit(1); }

const parts = json?.candidates?.[0]?.content?.parts || [];
const imgPart = parts.find(p => p.inlineData || p.inline_data);
if (!imgPart) { console.error("No image returned:", JSON.stringify(json, null, 2)); process.exit(1); }
const data = (imgPart.inlineData || imgPart.inline_data).data;
fs.writeFileSync(outputPath, Buffer.from(data, "base64"));
console.log("wrote", outputPath);

// one-off: N labelled images + prompt -> one image, fixed aspect ratio
import fs from "node:fs";
const [, , out, promptFile, aspect, model, ...pairs] = process.argv; // pairs: label=path
const key = fs.readFileSync("/Users/nadatlohi/dev/Shaklek/website/.env.local","utf8").match(/^GEMINI_API_KEY=(.+)$/m)[1].trim();
const parts = [];
for (const p of pairs) { const i = p.indexOf("="); parts.push({ text: p.slice(0,i) }, { inline_data: { mime_type: "image/jpeg", data: fs.readFileSync(p.slice(i+1)).toString("base64") } }); }
parts.push({ text: fs.readFileSync(promptFile, "utf8") });
const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, { method: "POST",
  headers: { "Content-Type": "application/json", "x-goog-api-key": key },
  body: JSON.stringify({ contents: [{ role: "user", parts }], generationConfig: { responseModalities: ["IMAGE"], imageConfig: { aspectRatio: aspect, ...(process.env.IMG_SIZE ? { imageSize: process.env.IMG_SIZE } : {}) } } }) });
const j = await r.json(); if (!r.ok) { console.error(JSON.stringify(j).slice(0,800)); process.exit(1); }
const img = (j.candidates?.[0]?.content?.parts || []).find(p => p.inlineData || p.inline_data);
if (!img) { console.error("no image", JSON.stringify(j).slice(0,800)); process.exit(1); }
fs.writeFileSync(out, Buffer.from((img.inlineData || img.inline_data).data, "base64")); console.log("wrote", out);

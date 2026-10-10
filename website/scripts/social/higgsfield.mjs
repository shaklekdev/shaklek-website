#!/usr/bin/env node
// Image-to-video through the Higgsfield API, for reels.
//
//   node scripts/social/higgsfield.mjs <image> "<prompt>" [out.mp4]        estimate only, free
//   node scripts/social/higgsfield.mjs <image> "<prompt>" [out.mp4] --go   generate (costs money)
//
// Key: HIGGSFIELD_API_KEY="<id>:<secret>" in website/.env.local.
// Docs: https://docs.higgsfield.ai/docs/llms.txt
//
// Animate APPROVED catalogue photos only. Video models redraw collars, hems and
// closures; a reel showing a garment we do not make is a return item. Compare
// every clip against its source photo before it goes anywhere.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const WEBSITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const env = fs.readFileSync(path.join(WEBSITE, ".env.local"), "utf8");
const KEY = env.match(/^HIGGSFIELD_API_KEY=(.+)$/m)?.[1]?.trim();
if (!KEY) throw new Error("HIGGSFIELD_API_KEY missing from website/.env.local");

const API = "https://api.higgsfield.ai";
const MODEL = process.env.HF_MODEL || "kling-video/v2.5-turbo/pro/image-to-video";
const auth = { Authorization: `Key ${KEY}`, "Content-Type": "application/json" };

const args = process.argv.slice(2);
const go = args.includes("--go");
const [image, prompt, out = "/tmp/higgsfield.mp4"] = args.filter((a) => a !== "--go");
if (!image || !prompt) throw new Error("usage: higgsfield.mjs <image> <prompt> [out.mp4] [--go]");

async function call(url, body) {
  const r = await fetch(url, { method: body ? "POST" : "GET", headers: auth, body: body && JSON.stringify(body) });
  const text = await r.text();
  if (!r.ok) throw new Error(`${r.status} ${url}: ${text}`);
  return JSON.parse(text);
}

async function upload(file) {
  const type = file.endsWith(".png") ? "image/png" : "image/jpeg";
  const u = await call(`${API}/files/generate-upload-url`, { content_type: type });
  // Presigned storage URL: send its own headers, never our credentials.
  const r = await fetch(u.upload_url, { method: "PUT", headers: u.upload_headers, body: fs.readFileSync(file) });
  if (!r.ok) throw new Error(`upload ${r.status}: ${await r.text()}`);
  return u.public_url;
}

const body = {
  prompt,
  duration: 5,
  negative_prompt:
    "changing the garment, new seams, buttons, collar, belt, pockets, patterns, logos, text, extra limbs, face change, flicker",
};

const est = await call(`${API}/estimate/${MODEL}`, { ...body, image_url: "https://example.com/x.jpg" });
console.log(`model ${MODEL}  estimate: ${est.usd} USD (${est.credits} credits)`);
if (!go) process.exit(0);

body.image_url = await upload(image);
let job = await call(`${API}/${MODEL}`, body);
console.log("submitted", job.request_id);
for (let wait = 5000; !["completed", "failed", "nsfw", "canceled"].includes(job.status); wait = Math.min(wait * 1.5, 30000)) {
  await new Promise((r) => setTimeout(r, wait));
  job = await call(job.status_url);
  process.stdout.write(`${job.status} `);
}
console.log();
if (job.status !== "completed") throw new Error(`${job.status}: ${job.error ?? ""}`);
// Output is kept only 7 days on their side: download now.
fs.writeFileSync(out, Buffer.from(await (await fetch(job.video.url)).arrayBuffer()));
console.log("saved", out);

#!/usr/bin/env node
// Image-to-video through the Higgsfield API, for reels.
//
// Every clip is a shot in higgsfield-shots.json. Founder's rule, 2026-10-10:
// "we agree on every prompt before generating any video". So the gate is in
// code, not in a habit: a shot generates only if it carries an approval whose
// fingerprint matches its CURRENT image, prompt, model and duration. Change one
// word after approval and the shot is unapproved again.
//
//   node scripts/social/higgsfield.mjs list                      shots, status, estimates (free)
//   node scripts/social/higgsfield.mjs approve <id> --by <name>  record her approval of the shot as it stands
//   node scripts/social/higgsfield.mjs run <id>...               cost of those shots (free)
//   node scripts/social/higgsfield.mjs run <id>... --go          generate (costs money)
//
// Key: HIGGSFIELD_API_KEY="<id>:<secret>" in website/.env.local.
// Docs: https://docs.higgsfield.ai/docs/llms.txt
//
// Animate APPROVED catalogue photos only. Video models redraw collars, hems and
// closures; a reel showing a garment we do not make is a return item. Compare
// every clip against its source photo before it goes anywhere.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const WEBSITE = path.resolve(HERE, "../..");
const REPO = path.resolve(WEBSITE, "..");
const SHOTS = path.join(HERE, "higgsfield-shots.json");
// Clips are paid for: never overwritten, never deleted (CLAUDE.md §4b).
const OUT = path.join(REPO, "brand-assets/reels/clips");

const env = fs.readFileSync(path.join(WEBSITE, ".env.local"), "utf8");
const KEY = env.match(/^HIGGSFIELD_API_KEY=(.+)$/m)?.[1]?.trim();
if (!KEY) throw new Error("HIGGSFIELD_API_KEY missing from website/.env.local");

const API = "https://api.higgsfield.ai";
const DEFAULT_MODEL = "kling-video/v2.5-turbo/pro/image-to-video";
const NEGATIVE =
  "changing the garment, new seams, buttons, collar, belt, pockets, patterns, logos, text, extra limbs, face change, flicker";
const auth = { Authorization: `Key ${KEY}`, "Content-Type": "application/json" };

const shots = JSON.parse(fs.readFileSync(SHOTS, "utf8"));
const save = () => fs.writeFileSync(SHOTS, JSON.stringify(shots, null, 2) + "\n");
const find = (id) => shots.find((s) => s.id === id) ?? fail(`no shot "${id}" in higgsfield-shots.json`);
function fail(msg) { console.error(msg); process.exit(1); }

const model = (s) => s.model ?? DEFAULT_MODEL;
const duration = (s) => s.duration ?? 5;
const imagePath = (s) => path.resolve(REPO, s.image);
// The image's bytes are in the fingerprint, so swapping the photo under the
// same filename also voids the approval.
function fingerprint(s) {
  const h = crypto.createHash("sha256");
  h.update(JSON.stringify([s.prompt, model(s), duration(s), s.negative ?? NEGATIVE]));
  h.update(fs.readFileSync(imagePath(s)));
  return h.digest("hex").slice(0, 16);
}
const isApproved = (s) => s.approved?.fingerprint === fingerprint(s);

async function call(url, body) {
  const r = await fetch(url, { method: body ? "POST" : "GET", headers: auth, body: body && JSON.stringify(body) });
  const text = await r.text();
  if (!r.ok) throw new Error(`${r.status} ${url}: ${text}`);
  return JSON.parse(text);
}

const request = (s) => ({ prompt: s.prompt, duration: duration(s), negative_prompt: s.negative ?? NEGATIVE });
const estimate = (s) => call(`${API}/estimate/${model(s)}`, { ...request(s), image_url: "https://example.com/x.jpg" });

async function upload(file) {
  const type = file.endsWith(".png") ? "image/png" : "image/jpeg";
  const u = await call(`${API}/files/generate-upload-url`, { content_type: type });
  // Presigned storage URL: send its own headers, never our credentials.
  const r = await fetch(u.upload_url, { method: "PUT", headers: u.upload_headers, body: fs.readFileSync(file) });
  if (!r.ok) throw new Error(`upload ${r.status}: ${await r.text()}`);
  return u.public_url;
}

function outPath(s) {
  fs.mkdirSync(OUT, { recursive: true });
  let n = 1;
  while (fs.existsSync(path.join(OUT, `${s.id}-${n}.mp4`))) n++;
  return path.join(OUT, `${s.id}-${n}.mp4`);
}

async function generate(s) {
  const body = { ...request(s), image_url: await upload(imagePath(s)) };
  let job = await call(`${API}/${model(s)}`, body);
  console.log(`${s.id}: submitted ${job.request_id}`);
  for (let wait = 5000; !["completed", "failed", "nsfw", "canceled"].includes(job.status); wait = Math.min(wait * 1.5, 30000)) {
    await new Promise((r) => setTimeout(r, wait));
    job = await call(job.status_url);
    process.stdout.write(`${job.status} `);
  }
  console.log();
  if (job.status !== "completed") throw new Error(`${s.id}: ${job.status} ${job.error ?? ""}`);
  // Output is kept only 7 days on their side: download now.
  const out = outPath(s);
  fs.writeFileSync(out, Buffer.from(await (await fetch(job.video.url)).arrayBuffer()));
  console.log(`${s.id}: saved ${path.relative(REPO, out)}`);
}

const [cmd, ...rest] = process.argv.slice(2);

if (cmd === "list" || !cmd) {
  if (!shots.length) console.log("no shots yet: add them to scripts/social/higgsfield-shots.json");
  let total = 0;
  for (const s of shots) {
    if (!fs.existsSync(imagePath(s))) { console.log(`${s.id}  MISSING IMAGE ${s.image}`); continue; }
    const e = await estimate(s);
    total += Number(e.usd);
    const st = isApproved(s) ? `approved by ${s.approved.by} ${s.approved.date}`
      : s.approved ? "CHANGED SINCE APPROVAL" : "not approved";
    console.log(`${s.id}  ${e.usd} USD  ${st}\n  ${s.image}\n  "${s.prompt}"\n`);
  }
  if (shots.length) console.log(`all shots: ${total.toFixed(3)} USD`);
} else if (cmd === "approve") {
  const by = rest[rest.indexOf("--by") + 1];
  const id = rest.find((a, i) => a !== "--by" && rest[i - 1] !== "--by");
  if (!id || !rest.includes("--by") || !by) fail("usage: approve <id> --by <name>");
  const s = find(id);
  s.approved = { by, date: new Date().toISOString().slice(0, 10), fingerprint: fingerprint(s) };
  save();
  console.log(`${id} approved by ${by}`);
} else if (cmd === "run") {
  const go = rest.includes("--go");
  const picked = rest.filter((a) => a !== "--go").map(find);
  if (!picked.length) fail("usage: run <id>... [--go]");
  const blocked = picked.filter((s) => !isApproved(s));
  if (blocked.length) fail(`not approved as written: ${blocked.map((s) => s.id).join(", ")}. Nothing generated.`);
  let total = 0;
  for (const s of picked) total += Number((await estimate(s)).usd);
  console.log(`${picked.length} clip(s), ${total.toFixed(3)} USD`);
  if (!go) process.exit(0);
  for (const s of picked) await generate(s);
} else {
  fail("commands: list | approve <id> --by <name> | run <id>... [--go]");
}

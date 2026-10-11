// Runs every fresh colourway cell, 4 at a time, one retry on a novelty failure.
import { spawn } from "node:child_process";
import fs from "node:fs";
const W = "/Users/nadatlohi/dev/Shaklek/website", CW = `${W}/scripts/catalog/colourways`, P = `${W}/public/catalog`;
const OUT = process.env.HOME + "/Shaklek-colourways/gen-2026-10-11/fresh";
const FR = [
  "walking slowly across the frame mid-step, body turned a little, one hand lightly at her side",
  "standing with her weight on one leg and the other knee softly bent, one hand resting lightly at her collarbone",
  "a quarter turn to her left, looking back toward the camera, arms relaxed",
  "standing easily, one hand tucking her hair behind her ear, the other arm loose",
  "walking toward the camera mid-stride, arms swinging naturally at her sides",
  "weight shifted onto her back foot, the front foot pointed toward the camera, hands loosely together low in front of her thighs",
  "a three-quarter turn to her right, chin slightly lifted, one hand resting on her upper arm",
  "standing relaxed with her shoulders turned slightly, one hand lightly brushing the fabric at her thigh, glancing just past the camera",
];
const FR_POCKET = [
  "turned slightly to her right, one hand in a side pocket, the other arm relaxed",
  "walking toward the camera mid-stride, both hands in the side pockets",
  "weight on one leg, one hand in a pocket, the other tucking her hair behind her ear",
  "standing easily facing the camera, one hand resting at her collarbone, the other in a pocket",
  "a quarter turn to her left, face to the camera, both hands in the pockets",
  "mid-step across the frame, one hand in a pocket, the other swinging lightly",
  "standing tall, both hands in the pockets, head tilted slightly",
  "weight on her back foot, one hand in a pocket, the other relaxed at her side, glancing past the camera",
];
const BK = [
  "she faces away, her weight on one leg, head turned slightly so only the edge of her cheek shows",
  "she faces away, mid-step walking away from the camera, one heel lifted",
  "she faces away, one hand lifting her hair off her neck",
  "she faces away, both arms relaxed, standing tall, head tilted slightly down",
];
const SC = [
  "Her hair is swept over her left shoulder; she stands slightly right of centre in the frame.",
  "Her hair falls loose down her back; she stands slightly left of centre in the frame.",
  "Her hair is tucked behind one ear; she is centred and the camera is a little further away.",
  "Her hair falls over her right shoulder; the camera is a little lower and she stands left of centre.",
];
const SC_BUN = [
  "Her hair is pulled back neatly as in IMAGE 3; she stands slightly right of centre in the frame.",
  "Her hair is pulled back neatly as in IMAGE 3; she stands slightly left of centre and the camera is a little further away.",
  "Her hair is pulled back neatly as in IMAGE 3; the camera is a little lower and she is centred.",
  "Her hair is pulled back neatly as in IMAGE 3; she stands left of centre, the camera slightly to her right.",
];
const MAXI = "LENGTH: maxi, the hem reaching her ankles / the top of her shoes exactly as in IMAGE 1.";
const MIDI = "LENGTH: MIDI, the hem at MID-CALF exactly as in IMAGE 1, clearly above the ankle, her lower legs and shoes visible.";
const jobs = [];
let k = 0;
const add = (o) => jobs.push({ ...o, i: k++ });

// ---- Buttoned Abaya (jacket): ivory cells are the shape
const J = `${P}/abaya-jacket/abaya-jacket-ivory`;
const JG = "a long linen abaya-coat with dark frog closures down the chest, open below the last closure, long sleeves to the wrist, worn over IVORY wide-leg linen trousers which stay ivory";
const JC = (n) => `It has EXACTLY ${n} frog closures, ALL ${n} clearly visible with nothing in front of them (no hand, no hair, no arm).`;
for (const [ci, c] of ["Navy", "Burgundy"].entries()) {
  const cells = [["front-v1-wb", "front", JC(4) + " " + MAXI], ["combo-maxi-5-front-v1-wb", "combo-maxi-5-front", JC(5) + " " + MAXI], ["combo-midi-4-front-v1-wb", "combo-midi-4-front", JC(4) + " " + MIDI], ["combo-midi-5-front-v1-wb", "combo-midi-5-front", JC(5) + " " + MIDI], ["back-v1-wb", "back", "The back is one unbroken panel with no opening and no closures. " + MAXI], ["combo-midi-4-back-v1-wb", "midi-back", "The back is one unbroken panel with no opening and no closures. " + MIDI]];
  cells.forEach(([src, name, keep], j) => add({ shape: `${J}-${src}.jpg`, face: `${J}-front-v1-wb.jpg`, colour: c, view: name.includes("back") ? "back" : "front", garment: JG, keep, pose: name.includes("back") ? BK[(j + ci) % 4] : FR[(j * 2 + ci * 3) % 8].replace(/hands loosely together low in front of her thighs/, "hands loosely together low by her thighs, well below the closures").replace(/one hand resting lightly at her collarbone/, "one hand resting lightly on her hip").replace(/one hand resting on her upper arm/, "both arms relaxed"), scene: SC[(j + ci) % 4], out: `${OUT}/${c.toLowerCase()}/abaya-jacket-${c.toLowerCase()}-${name}.jpg` }));
}
// ---- Slip Dress
const S = `${P}/slip-dress/slip-dress-ivory`;
const SG = "a sleeveless linen slip dress with a vertical centre seam, no pockets, no buttons, no belt";
for (const [ci, c] of ["Navy", "Burgundy"].entries()) {
  const cells = [["front-v1", "front", "HIGH ROUND neckline. " + MAXI], ["combo-v-maxi-front-v1", "combo-v-maxi-front", "V-NECKLINE exactly as IMAGE 1. " + MAXI], ["combo-round-midi-front-v1", "combo-round-midi-front", "HIGH ROUND neckline. " + MIDI], ["combo-v-midi-front-v1", "combo-v-midi-front", "V-NECKLINE exactly as IMAGE 1. " + MIDI], ["back-v1", "back", "The back exactly as IMAGE 1. " + MAXI], ["combo-round-midi-back-v1", "midi-back", "The back exactly as IMAGE 1. " + MIDI]];
  cells.forEach(([src, name, keep], j) => add({ shape: `${S}-${src}.jpg`, face: `${S}-front-v1.jpg`, colour: c, view: name.includes("back") ? "back" : "front", garment: SG, keep: keep + " Her legs are NOT crossed and she leans on nothing.", pose: name.includes("back") ? BK[(j + ci + 1) % 4] : FR[(j * 3 + ci * 5 + 1) % 8], scene: SC[(j + ci + 1) % 4], out: `${OUT}/${c.toLowerCase()}/slip-dress-${c.toLowerCase()}-${name}.jpg` }));
}
// ---- Buttoned Dress
const B = `${P}/buttoned-dress/buttoned-dress-ivory`;
const BG = "a sleeveless linen dress with self-fabric buttons down the whole front and two side pockets";
for (const [ci, c] of ["Navy", "Burgundy"].entries()) {
  const cells = [["front-v1", "front", "ROUND neckline, buttons running up to it. " + MAXI], ["combo-v-maxi-front-v1", "combo-v-maxi-front", "V-NECK with a small pointed collar exactly as IMAGE 1, buttons starting below the V. " + MAXI], ["combo-round-midi-front-v1", "combo-round-midi-front", "ROUND neckline, buttons running up to it. " + MIDI], ["combo-v-midi-front-v1", "combo-v-midi-front", "V-NECK with a small pointed collar exactly as IMAGE 1, buttons starting below the V. " + MIDI], ["back-v1", "back", "The back exactly as IMAGE 1. " + MAXI], ["combo-round-midi-back-v1", "midi-back", "The back exactly as IMAGE 1. " + MIDI]];
  cells.forEach(([src, name, keep], j) => add({ shape: `${B}-${src}.jpg`, face: `${B}-front-v1.jpg`, colour: c, view: name.includes("back") ? "back" : "front", garment: BG, keep: keep + " Every button and the neckline clearly visible from the front.", pose: name.includes("back") ? BK[(j + ci + 2) % 4] : FR_POCKET[(j * 2 + ci * 3) % 8], scene: SC[(j + ci + 2) % 4], out: `${OUT}/${c.toLowerCase()}/buttoned-dress-${c.toLowerCase()}-${name}.jpg` }));
}
// ---- Open Abaya: its current colour cells are the shape (they carry the fold, sleeve widths, lengths)
const OG = "an OPEN, unfastened linen abaya: the front edges FOLDED BACK on themselves to the outside, deep and obvious at the neck and symmetrical, relaxing as they fall and lying open by the hem; long sleeves to the wrist with a deep turned-back cuff; no collar, no lapel, no buttons, no belt; worn over a plain IVORY slip dress which stays ivory";
const OA = { Navy: { suf: "", face: `${P}/abaya/abaya-navy-front.jpg` }, Burgundy: { suf: "-wb", face: `${P}/abaya/abaya-burgundy-front-wb.jpg` } };
for (const [ci, c] of ["Navy", "Burgundy"].entries()) {
  const lc = c.toLowerCase(), s = OA[c].suf;
  const W_ = { narrow: "SLEEVES: moderate width, as in IMAGE 1.", wide: "SLEEVES: WIDE and full, as in IMAGE 1; the body stays close and straight." };
  const cells = [[`front${s}`, "front", W_.narrow + " " + MAXI], [`combo-maxi-wide-front${s}`, "combo-maxi-wide-front", W_.wide + " " + MAXI], [`combo-midi-narrow-front${s}`, "combo-midi-narrow-front", W_.narrow + " " + MIDI], [`combo-midi-wide-front${s}`, "combo-midi-wide-front", W_.wide + " " + MIDI], [`back${s}`, "back", W_.narrow + " " + MAXI], [`combo-maxi-wide-back${s}`, "combo-maxi-wide-back", W_.wide + " " + MAXI], [`combo-midi-narrow-back${s}`, "combo-midi-narrow-back", W_.narrow + " " + MIDI], [`combo-midi-wide-back${s}`, "combo-midi-wide-back", W_.wide + " " + MIDI]];
  cells.forEach(([src, name, keep], j) => add({ shape: `${P}/abaya/abaya-${lc}-${src}.jpg`, face: OA[c].face, colour: c, view: name.includes("back") ? "back" : "front", garment: OG, keep: keep + " Her hands never hold or close the abaya; it hangs open.", pose: name.includes("back") ? BK[(j + ci) % 4] : FR[(j * 3 + ci * 2 + 2) % 8].replace(/hands loosely together low in front of her thighs/, "arms relaxed at her sides"), scene: SC_BUN[(j + ci) % 4], out: `${OUT}/${lc}/abaya-${lc}-${name}.jpg` }));
}
// RERUN: only the named outputs, with overrides, the old file moved to rejected/.
const RR = process.env.RERUN ? JSON.parse(fs.readFileSync(process.env.RERUN, "utf8")) : null;
if (RR) {
  for (let x = jobs.length - 1; x >= 0; x--) {
    const base = jobs[x].out.split("/").pop(), o = RR[base];
    if (!o) { jobs.splice(x, 1); continue; }
    Object.assign(jobs[x], { pose: o.pose ?? jobs[x].pose, scene: o.scene ?? jobs[x].scene, keep: (o.keep ?? "") + " " + jobs[x].keep });
    if (fs.existsSync(jobs[x].out)) fs.renameSync(jobs[x].out, `${OUT}/rejected/${base}`);
  }
}
for (const j of jobs) if (!fs.existsSync(j.shape) || !fs.existsSync(j.face)) throw new Error("missing " + j.shape + " or " + j.face);
console.log(jobs.length, "jobs");
const run = (j, attempt) => new Promise((res) => {
  const a = ["fresh-gen.mjs", "--shape", j.shape, "--face", j.face, "--colour", j.colour, "--view", j.view, "--garment", j.garment, "--keep", j.keep, "--pose", j.pose, "--scene", j.scene, "--out", j.out];
  const p = spawn("node", a, { cwd: CW });
  let o = ""; p.stdout.on("data", (d) => (o += d)); p.stderr.on("data", (d) => (o += d));
  p.on("close", (code) => { console.log(`[${attempt}] ${o.trim().split("\n").pop()}`); res(code); });
});
let next = 0;
const worker = async () => { while (next < jobs.length) { const j = jobs[next++]; const c = await run(j, 1); if (c === 3) { fs.renameSync(j.out, j.out.replace(/\.jpg$/, ".rejected-copy.jpg")); await run(j, 2); } } };
await Promise.all([worker(), worker(), worker(), worker()]);
console.log("ALL DONE");

/**
 * Assemble the folder that goes to the packaging supplier.
 *
 *   node scripts/brand/build-final-folder.mjs      (run from website/)
 *
 * One PDF per printed face, named for the item number on the order sheet, plus
 * the order sheet itself and a short read-me. Nothing else: a folder with two
 * copies of the same document, or a file nothing on the sheet refers to, is
 * how a supplier ends up quoting the wrong thing.
 *
 * It refuses to write if a file it is about to copy is not a readable PDF, and
 * it reports anything already in the folder that it did not put there rather
 * than deleting it.
 */
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, readdirSync, existsSync, statSync }
  from "node:fs";
import path from "node:path";
import os from "node:os";

import { PT, ARTWORK } from "./generate-quote-sheet.mjs";
import { SPEC, outName } from "./generate-simple-spec.mjs";

const DEST = "/Users/nadatlohi/Desktop/Shaklek/send-to-packagin-supplier-final";
const SUPPLIER_DIR = path.resolve(ARTWORK, "..");
const ORDER_SHEET = path.join(os.homedir(), "Desktop", "Shaklek-order-sheet.pdf");
const SHEET_NAME = "00-ORDER-SHEET-read-this-first.pdf";
const QTY = 100;

function findPdf(stem) {
  for (const dir of [ARTWORK, SUPPLIER_DIR]) {
    const p = path.join(dir, `${stem}.pdf`);
    if (existsSync(p)) return p;
  }
  throw new Error(`cannot find ${stem}.pdf`);
}

/** A file that is not a readable PDF must never reach a supplier's folder. */
function checkPdf(p) {
  const raw = readFileSync(p, "latin1");
  if (!raw.startsWith("%PDF-")) throw new Error(`${p} is not a PDF`);
  const m = raw.match(/\/MediaBox\s*\[\s*0\s+0\s+([\d.]+)\s+([\d.]+)\s*\]/);
  if (!m) throw new Error(`${p} has no readable MediaBox`);
  return [+m[1] / PT, +m[2] / PT];
}

mkdirSync(DEST, { recursive: true });

const written = new Set();
const rows = [];

for (const r of SPEC) {
  const files = r.files || [r.file];
  files.forEach((stem, i) => {
    const src = findPdf(stem);
    const [w, h] = checkPdf(src);
    const name = outName(r, i);
    copyFileSync(src, path.join(DEST, name));
    written.add(name);
    rows.push({ n: r.n, item: r.item, name,
      size: r.size,                                   // the ITEM's size, not the file's
      note: r.fileNote || "file is at the finished size",
      face: files.length > 1 ? (i === 0 ? "front" : "back") : "" });
  });
}

// the order sheet, under a name that sorts to the top
if (!existsSync(ORDER_SHEET)) {
  console.error(`\nMissing ${ORDER_SHEET}. Run generate-local-spec.mjs first.\n`);
  process.exit(1);
}
checkPdf(ORDER_SHEET);
copyFileSync(ORDER_SHEET, path.join(DEST, SHEET_NAME));
written.add(SHEET_NAME);

// ------------------------------------------------------------------ read me

const pad = (s, n) => String(s).padEnd(n);
const lines = [
  "SHAKLEK - PACKAGING ARTWORK",
  "===========================",
  "",
  "START WITH  " + SHEET_NAME,
  "It has one page per item: the size, the material, the ink colours, how many,",
  "and a picture of exactly what to print. Everything else in this folder is",
  "artwork, named for the item number on that sheet.",
  "",
  "FOUR RULES",
  "",
  "  1. Print the files exactly as they are. Please do not redraw them, retype",
  "     them, or set them again in your own fonts - in any language. If a file",
  "     cannot be printed as it is, tell us and we will send a new one.",
  "",
  "  2. ONE COLOUR, BLACK, applies to items 01 and 02 only - the cotton bag and",
  "     the hand bag. Their file is already one colour, so there is nothing to",
  "     convert. Every other item prints exactly as its file shows.",
  "",
  `  3. ${QTY} pieces of every item. If ${QTY} is below your minimum for anything, tell us`,
  "     your minimum and the price at that quantity - do not leave the item out.",
  "",
  "  4. Send a photo or a sample of each item before the full run.",
  "",
  "THE FILES",
  "",
  "  " + pad("FILE", 34) + pad("ITEM", 24) + pad("FINISHED SIZE", 23) + "NOTE",
  "  " + "-".repeat(100),
];
for (const r of rows) {
  lines.push("  " + pad(r.name, 34) + pad(r.item + (r.face ? `, ${r.face}` : ""), 24)
    + pad(r.size, 23) + r.note);
}
lines.push(
  "",
  "TWO ITEMS CARRY A QR CODE: 06-thank-you-card-BACK and 08-business-card-BACK.",
  "Please print them exactly as supplied. Do not redraw, re-generate, re-colour,",
  "scale one axis, or place anything over them, and do not print them smaller",
  "than the file. The blank margin around each code is part of the code.",
  "",
  "THE BUSINESS CARD IS SUPPLIED WITH BLEED. Both files measure 96 x 56 mm",
  "because 3 mm is included on every edge. Trim to 90 x 50 mm.",
  "",
  "IF ANYTHING IS NOT CLEAR, please ask before printing rather than deciding for",
  "us. Every item here exists as a file already, so if something does not suit",
  "your machines we can change the file - but only if we know.",
  "",
);
writeFileSync(path.join(DEST, "READ-ME-FIRST.txt"), lines.join("\n"), "utf8");
written.add("READ-ME-FIRST.txt");

// ------------------------------------------------------------------- report

const onDisk = readdirSync(DEST).filter((f) => !f.startsWith("."));
const extra = onDisk.filter((f) => !written.has(f));

console.log(`\n${DEST}\n`);
for (const f of onDisk.filter((f) => written.has(f)).sort())
  console.log(`  ${pad(f, 38)}${(statSync(path.join(DEST, f)).size / 1024).toFixed(0)} KB`);
console.log(`\n  ${written.size} files written (${rows.length} artwork + order sheet + read-me)`);
if (extra.length) {
  console.log("\n  NOT PUT THERE BY THIS SCRIPT - review, they are left untouched:");
  for (const f of extra) console.log(`    ${f}`);
}
console.log("");

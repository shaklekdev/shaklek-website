// Every doc.text() in techPack.ts that sets a `width` column must also set its
// own x origin.
//
// pdfkit keeps doc.x wherever the last positioned draw left it. This document
// writes measurement values and size values at left + 118, so a later
// `doc.text(str, { width })` silently starts its column at x=158 on a 595pt
// page and clips ~78pt off the right of every line.
//
// It has now happened three times: the measurement caveat ("Apply the ho" /
// "where they disag"), the customer's own fit note, and the new
// what-usually-goes-wrong caveat ("Adjust from the standard block by"). Every
// time, the text is CORRECT inside the PDF and only its origin is wrong -- so
// no content check, no string search and no byte comparison can see it. Only
// this can, or a human looking at the page.
//
// Safe forms: `.text(str, left, doc.y, { width })`, any `.text(str, x, y, {…})`
// with an explicit origin, or going through para()/row().
import { readFileSync } from "node:fs";

const src = readFileSync(new URL("../src/lib/techPack.ts", import.meta.url), "utf8");
const lines = src.split("\n");

/** Number of top-level arguments before the options object. */
function argsBeforeOptions(call) {
  let depth = 0;
  let args = 1;
  for (let i = 0; i < call.length; i++) {
    const c = call[i];
    if (c === "(" || c === "[") depth++;
    else if (c === ")" || c === "]") {
      if (depth === 0) break;
      depth--;
    } else if (c === "{" && depth === 0) break;
    else if (c === "," && depth === 0) args++;
    else if (c === "`" || c === '"' || c === "'") {
      const quote = c;
      i++;
      while (i < call.length && call[i] !== quote) {
        if (call[i] === "\\") i++;
        i++;
      }
    }
  }
  return args;
}

const offenders = [];
for (let i = 0; i < lines.length; i++) {
  const at = lines[i].indexOf(".text(");
  if (at === -1) continue;
  const call = lines.slice(i, i + 5).join(" ").slice(lines.slice(i, i + 5).join(" ").indexOf(".text(") + 6);
  if (!/\{\s*width/.test(call)) continue; // no column, nothing to clip
  if (/^text, left/.test(call)) continue; // the para() helper itself
  if (argsBeforeOptions(call) >= 3) continue; // has an explicit x, y
  // Belt and braces for calls whose template literals defeat the arg counter
  // (a nested backtick inside ${}): an explicit origin is named right after
  // the string argument.
  if (/,\s*(left|right|x)\s*[+\-,]/.test(call.slice(0, call.indexOf("{ width")))) continue;
  offenders.push(`  techPack.ts:${i + 1}  ${lines[i].trim().slice(0, 88)}`);
}

if (offenders.length) {
  console.error("doc.text() sets a width column but inherits doc.x:\n" + offenders.join("\n"));
  process.exit(1);
}
console.log("ok — every doc.text() with a width column sets its own x origin");

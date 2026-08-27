/**
 * Scans the marketing documents for copy that must never reach a customer.
 *
 *   npx tsx scripts/social/lint-marketing-docs.mjs
 *
 * WHY: on 2026-08-27 an Instagram kit sat ready to post for four days quoting
 * prices that had never shipped and a fabric the brand cannot buy, and its own
 * "claim audit" section listed the false fabric claim as VERIFIED. A stale
 * audit block is worse than none, because it launders the error as checked.
 *
 * The builders lint what they render (copy-rules.mjs). Nothing linted the
 * documents a human copies from by hand, which is where the founder actually
 * posts from. This does.
 *
 * Quoted corrections are allowed: a line that is explaining what was wrong is
 * marked with a warning sign or the words "was wrong", and is skipped.
 */
import fs from "node:fs";
import path from "node:path";
import { BANNED } from "./copy-rules.mjs";

const DIR = path.resolve(process.cwd(), "..", "planning", "marketing");

// Stale-fact checks, on top of the phrasing rules. These are the specific
// numbers that were wrong, so they stay named until the code changes.
const STALE = [
  [/AED 390\b|shirts? AED 390/i, "Shirt was never 390; it is 389 (catalog.ts)"],
  [/AED 420\b/, "Skirt is 419, and skirts are not on sale"],
  [/AED 450\b/, "Pants were never 450; trousers are 429"],
  [/AED 620\b/, "Dress is 619, and dresses are not on sale"],
  [/cotton and linen|cotton & linen/i, "cotton has no supplier and is available:false in fabrics.ts"],
  [/\bWELCOME20\b/, "deactivated 2026-08-26; no active promotion code exists"],
];

const EXEMPT = [
  /⚠️|was wrong|never shipped|do not post|cannot buy|deactivated|corrected|previous version|offending/i,
  // A row of a file-index table describing an asset, e.g. "for overlaying on
  // photography", is not copy anyone posts.
  /^\s*\|\s*`[^`]+`\s*\|/,
  // Lines explaining why something was withdrawn.
  /Why WELCOME20|welcome offer will be|it contradicted/i,
  // A line that STATES a rule necessarily contains the words the rule forbids.
  /No AI mentions|[Nn]ever (write|say|call|describe|use)|anything implying|must never|forbid/i,
  // Sourcing notes about stock photography are about buying images, not about
  // describing the catalogue.
  /licence-clear|licence clear|stock photo|Pexels|Unsplash|real photography|need photography/i,
];
const exempt = (line) => EXEMPT.some((re) => re.test(line));

let problems = 0, scanned = 0;
for (const file of fs.readdirSync(DIR).filter((f) => f.endsWith(".md"))) {
  const lines = fs.readFileSync(path.join(DIR, file), "utf8").split("\n");
  scanned++;
  lines.forEach((line, i) => {
    if (exempt(line)) return;
    for (const [re, why] of [...BANNED, ...STALE]) {
      if (re.test(line)) {
        console.error(`${file}:${i + 1}  ${why}\n    ${line.trim().slice(0, 110)}`);
        problems++;
        break;
      }
    }
  });
}

console.log(`\n${scanned} marketing documents scanned, ${problems} line(s) to look at`);
if (problems) process.exitCode = 1;

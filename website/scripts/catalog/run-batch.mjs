import { generateVerified } from "./gen-verified.mjs";

// Thin driver so a batch is declared as data and every item goes through the
// same verify-and-retry path, instead of being hand-run one call at a time.
const jobs = JSON.parse(process.argv[2]);

// Flash is ~3.5x cheaper, so try it first and only escalate to Pro when it
// can't deliver (it is frequently 503 under load, and some edits it simply
// refuses to make). Paying Pro prices for every image is wasteful; never
// escalating means the batch stalls on the overloaded tier.
const FALLBACK_MODEL = "gemini-3-pro-image";

let ok = 0, viaFallback = 0, failed = [];
for (const job of jobs) {
  console.log(`\n> ${job.label}`);
  let success = await generateVerified(job);
  if (!success) {
    console.log(`  escalating to ${FALLBACK_MODEL}`);
    success = await generateVerified({ ...job, model: FALLBACK_MODEL, maxAttempts: 2 });
    if (success) viaFallback++;
  }
  if (success) ok++; else failed.push(job.label);
}

console.log(`\n=== ${ok}/${jobs.length} succeeded (${viaFallback} needed Pro) ===`);
if (failed.length) console.log("failed:", failed.join(", "));

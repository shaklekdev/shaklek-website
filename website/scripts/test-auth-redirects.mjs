// Every Clerk modal call must pin its own redirect.
//
// WHY THIS IS A TEST AND NOT A NOTE. Amplify sets
// NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/account. Clerk applies that to
// any openSignUp/openSignIn that does not override it, so the customer is
// navigated off the page mid-design and whatever they had typed dies with the
// navigation. That is bug 2 of planning/security/rca-2026-08-27.md, and the
// environment variable is STILL SET -- so the hazard is live, permanently, for
// any call added later.
//
// The RCA's own conclusion is that written rules decay and executed ones hold.
// This is that rule, executed.
//
//   npx tsx scripts/test-auth-redirects.mjs
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

function walk(dir) {
  return readdirSync(dir).flatMap((e) => {
    const p = join(dir, e);
    return statSync(p).isDirectory() ? walk(p) : p.endsWith(".tsx") || p.endsWith(".ts") ? [p] : [];
  });
}

let fail = 0;
let checked = 0;

for (const file of walk("src")) {
  const src = readFileSync(file, "utf8");
  for (const m of src.matchAll(/\bopenSign(Up|In)\s*\(/g)) {
    checked++;
    // Read the call's argument list, brace-balanced, so a nested object does
    // not end the match early.
    let i = m.index + m[0].length;
    let depth = 1;
    while (i < src.length && depth > 0) {
      if (src[i] === "(") depth++;
      else if (src[i] === ")") depth--;
      i++;
    }
    const args = src.slice(m.index + m[0].length, i - 1);
    if (!/forceRedirectUrl/.test(args)) {
      console.error(
        `MISSING forceRedirectUrl: ${file} -> openSign${m[1]}(...)\n` +
          `  Amplify's NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL will navigate the\n` +
          `  customer to /account and lose whatever they had typed. See\n` +
          `  planning/security/rca-2026-08-27.md, bug 2.`,
      );
      fail++;
    }
  }
}

console.log(
  fail === 0
    ? `ok — ${checked} Clerk modal call(s), all pin their own redirect`
    : `${fail} unpinned Clerk modal call(s)`,
);
process.exit(fail === 0 ? 0 : 1);

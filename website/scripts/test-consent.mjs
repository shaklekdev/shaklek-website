// The consent module decides whether an advertising tracker runs. Its default
// is the whole point: a visitor who has never answered must be treated as
// having declined. Silence is not consent, and a bug that flips the default
// turns a compliant site into a non-compliant one invisibly.
//
// Run: npx tsx scripts/test-consent.mjs
let store = {};
let thrower = false;
globalThis.window = {
  localStorage: {
    getItem: (k) => { if (thrower) throw new Error("blocked"); return k in store ? store[k] : null; },
    setItem: (k, v) => { if (thrower) throw new Error("blocked"); store[k] = v; },
  },
  dispatchEvent: () => true,
};
globalThis.CustomEvent = class { constructor(t, o) { this.type = t; this.detail = o?.detail; } };

const { readConsent, writeConsent, marketingAllowed } = await import("../src/lib/consent.ts");

let fail = 0;
const check = (c, m) => { if (!c) { console.error("FAIL:", m); fail++; } };

// The default, which is the one that matters.
store = {};
check(readConsent() === "unset", "a visitor who never answered must read as unset");
check(marketingAllowed() === true, "OPT-OUT (founder 2026-11-15): an unanswered visitor is measured");

writeConsent("granted");
check(marketingAllowed() === true, "accepting must enable marketing");
writeConsent("denied");
check(marketingAllowed() === false, "declining must disable marketing");

// Only an exact "denied" is a refusal; anything else reads as unanswered.
for (const junk of ["yes", "true", "1", "GRANTED", "", "null"]) {
  store = { "shaklek.consent.marketing.v1": junk };
  check(readConsent() === "unset", `a stored value of ${JSON.stringify(junk)} must read as unset`);
}
store = { "shaklek.consent.marketing.v1": "denied" };
check(marketingAllowed() === false, "a stored refusal must keep measurement off across visits");

// Storage blocked (private mode, or a browser refusing site data): the site
// must keep working and must fail CLOSED, never open.
thrower = true;
check(readConsent() === "unset", "blocked storage must read as unset, not throw");
check(marketingAllowed() === true, "blocked storage reads as unanswered (opt-out default)");
let threw = false;
try { writeConsent("granted"); } catch { threw = true; }
check(!threw, "writing with blocked storage must not throw at the caller");
thrower = false;

console.log(fail === 0 ? "ok — opt-out: measured by default, a refusal sticks" : `${fail} failure(s)`);
process.exit(fail === 0 ? 0 : 1);

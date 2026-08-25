// Cookie consent, kept deliberately small.
//
// One question is asked: may we run advertising measurement. Nothing else on
// this site sets a non-essential cookie, so a multi-category consent panel
// would be theatre. If analytics is ever added, add a category here rather
// than quietly widening what "accepted" means.
//
// THE DEFAULT IS NO. A visitor who has never answered is treated as having
// declined, which is the only safe default: consent has to be an act, and
// silence is not one. That is also why this cannot be inferred from anything
// else the visitor does, such as signing up to a newsletter. Consent bundled
// into an unrelated offer is not freely given, and in practice it would only
// ever cover the small fraction of visitors who take the offer.

const KEY = "shaklek.consent.marketing.v1";

export type ConsentState = "granted" | "denied" | "unset";

/** Reading localStorage throws in some privacy modes, so every access is guarded. */
export function readConsent(): ConsentState {
  if (typeof window === "undefined") return "unset";
  try {
    const v = window.localStorage.getItem(KEY);
    return v === "granted" || v === "denied" ? v : "unset";
  } catch {
    return "unset";
  }
}

export function writeConsent(state: "granted" | "denied"): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, state);
  } catch {
    // A visitor blocking storage still gets a working site. They will be asked
    // again next visit, which is the correct failure direction: it never
    // silently upgrades to "granted".
  }
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: state }));
}

/** Fired on the window when the choice changes, so the pixel can react without a reload. */
export const CONSENT_EVENT = "shaklek:consent";

/** The single question the rest of the app should ask. */
export function marketingAllowed(): boolean {
  return readConsent() === "granted";
}

// Cookie consent, kept deliberately small.
//
// One question is asked: may we run advertising measurement. Nothing else on
// this site sets a non-essential cookie, so a multi-category consent panel
// would be theatre. If analytics is ever added, add a category here rather
// than quietly widening what "accepted" means.
//
// THE DEFAULT IS YES SINCE 2026-11-15 (opt-out, founder decision; see
// marketingAllowed below). Only an explicit "denied" switches measurement off.
// It used to default to no; that history is in git.

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
  // ⚠️ Under opt-out a refusal arrives with fbevents.js ALREADY RUNNING, and
  // unmounting our <Script> does not stop it: Meta's library keeps its own
  // listeners (SPA navigation, button clicks) and would keep sending and
  // re-set _fbp. "revoke" is Meta's own switch that holds every further event;
  // "grant" lifts it if she changes her mind on the same page.
  // (Found by the shaklek-marketing review, 2026-11-15.)
  try {
    const w = window as unknown as { fbq?: (...a: unknown[]) => void };
    w.fbq?.("consent", state === "denied" ? "revoke" : "grant");
  } catch {
    /* never break the page over a tracker */
  }
  if (state === "denied") clearMarketingCookies();
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: state }));
}

/** Fired on the window when the choice changes, so the pixel can react without a reload. */
export const CONSENT_EVENT = "shaklek:consent";

/** Fired to reopen the bar so an existing choice can be changed. */
export const CONSENT_REOPEN = "shaklek:consent:reopen";

/** Footer entry point. Withdrawal has to be as easy as consent was to give. */
export function requestConsentChange(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(CONSENT_REOPEN));
}

// Meta's cookies, dropped by the pixel script once it has run.
const MARKETING_COOKIES = ["_fbp", "_fbc"];

/**
 * Withdrawing has to actually remove something, or "Decline" is a promise the
 * site does not keep. Stopping future events still leaves the identifier that
 * was already written sitting in the browser, so it is deleted here.
 *
 * Deleted on the registrable domain as well as the exact host: the pixel sets
 * `_fbp` on `.shaklek.com`, and a delete that names only `www.shaklek.com`
 * silently does nothing.
 */
function clearMarketingCookies(): void {
  if (typeof document === "undefined") return;
  const host = window.location.hostname;
  const parts = host.split(".");
  const domains = [undefined, host, parts.length > 2 ? `.${parts.slice(-2).join(".")}` : `.${host}`];
  for (const name of MARKETING_COOKIES) {
    for (const d of domains) {
      try {
        document.cookie =
          `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/` +
          (d ? `; domain=${d}` : "");
      } catch {
        /* never break the page over a cookie */
      }
    }
  }
}

/**
 * The single question the rest of the app should ask.
 *
 * ⚠️ OPT-OUT SINCE 2026-11-15 (founder decision). Advertising measurement runs
 * unless the visitor has said NO. Under opt-in, Meta saw ~6 of ~45 real ad
 * visits (Amplify access logs, 13-15 Nov) and optimised blind. Legal position
 * taken knowingly: UAE PDPL is in force but its executive regulations were
 * still unpublished; the founder accepted that risk. A refusal is still a real
 * one-tap button, it is remembered, and it deletes Meta's cookies.
 */
export function marketingAllowed(): boolean {
  return readConsent() !== "denied";
}

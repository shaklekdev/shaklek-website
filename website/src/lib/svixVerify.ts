import { createHmac, timingSafeEqual } from "node:crypto";

// Svix signature verification, done by hand rather than with the `svix`
// package.
//
// WHY NO DEPENDENCY: this is ~40 lines of HMAC and the project already talks
// to Resend and Stripe over plain `fetch`. Adding a package to the production
// dependency tree for one route is a worse trade than owning the code --
// especially here, where a failed `npm ci` is a silent Amplify build failure
// and the site just keeps serving the old version.
//
// WHY IT EXISTS AT ALL: /api/webhooks/clerk is a public, unauthenticated URL.
// Without a signature check, anyone who guesses it can post a fake
// `user.created` and make the founder's inbox say whatever they like. The
// signature IS the authentication for this route -- there is nothing else.
//
// Clerk signs with Svix, whose scheme is:
//   signedContent = `${svix-id}.${svix-timestamp}.${rawBody}`
//   signature     = base64(HMAC_SHA256(secretBytes, signedContent))
// where the secret arrives as `whsec_<base64>` and it is the DECODED bytes
// that key the HMAC -- not the ASCII of the string. Getting that wrong yields
// a verifier that rejects every genuine delivery, which looks exactly like a
// misconfigured endpoint.

/** How far a delivery's timestamp may sit from now. Svix's own default. */
const TOLERANCE_SECONDS = 5 * 60;

export type SvixHeaders = {
  id: string | null;
  timestamp: string | null;
  signature: string | null;
};

export type VerifyResult = { ok: true } | { ok: false; reason: string };

/**
 * Constant-time compare of two base64 signatures.
 *
 * `timingSafeEqual` throws when the buffers differ in length, which for a
 * signature comparison is itself a length oracle if it escapes as a distinct
 * error. Length mismatch is just "not equal".
 */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "base64");
  const bufB = Buffer.from(b, "base64");
  if (bufA.length !== bufB.length || bufA.length === 0) return false;
  return timingSafeEqual(bufA, bufB);
}

/**
 * Verify a Svix-signed webhook.
 *
 * `rawBody` must be the EXACT bytes received. Re-serialising the parsed JSON
 * changes key order and whitespace and breaks the signature -- so the route
 * must call `req.text()` and parse afterwards, never `req.json()` first.
 */
export function verifySvixSignature(
  rawBody: string,
  headers: SvixHeaders,
  secret: string,
  nowSeconds: number = Math.floor(Date.now() / 1000),
): VerifyResult {
  const { id, timestamp, signature } = headers;

  if (!id || !timestamp || !signature) {
    return { ok: false, reason: "missing svix headers" };
  }

  const sentAt = Number(timestamp);
  if (!Number.isFinite(sentAt)) {
    return { ok: false, reason: "malformed timestamp" };
  }

  // Replay window. Without this, a single captured delivery can be replayed
  // forever -- the signature stays valid because the payload never changes.
  const drift = Math.abs(nowSeconds - sentAt);
  if (drift > TOLERANCE_SECONDS) {
    return { ok: false, reason: "timestamp outside tolerance" };
  }

  // `whsec_` is a human-facing prefix, not part of the key.
  const rawSecret = secret.startsWith("whsec_") ? secret.slice(6) : secret;
  let keyBytes: Buffer;
  try {
    keyBytes = Buffer.from(rawSecret, "base64");
  } catch {
    return { ok: false, reason: "secret is not base64" };
  }
  if (keyBytes.length === 0) {
    return { ok: false, reason: "empty secret" };
  }

  const expected = createHmac("sha256", keyBytes)
    .update(`${id}.${timestamp}.${rawBody}`)
    .digest("base64");

  // The header carries a space-separated list so a secret can be rotated with
  // both keys live. Any one match is a pass.
  const presented = signature.split(" ");
  for (const entry of presented) {
    const [version, value] = entry.split(",");
    if (version !== "v1" || !value) continue;
    if (safeEqual(expected, value)) return { ok: true };
  }

  return { ok: false, reason: "no matching signature" };
}

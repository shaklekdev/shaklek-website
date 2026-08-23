import { NextRequest } from "next/server";

// Nothing on this site was rate limited. /api/orders creates a live Stripe
// Checkout Session and, on the fallback path, sends two emails -- both cost
// real money and both were reachable by an unauthenticated loop.
//
// LIMITATION, stated plainly: this counter lives in the Lambda container's
// memory. Amplify runs several containers and recycles them, so a determined
// attacker spreading requests across containers gets a higher effective
// ceiling, and the window resets on a cold start. It stops naive floods and
// accidental double-submits; it is not a substitute for a shared store
// (Upstash/Redis) or WAF rate rules, which is the real fix if abuse appears.

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// Bound the map so the limiter itself cannot become the memory leak.
const MAX_TRACKED = 10_000;

function clientKey(req: NextRequest, scope: string): string {
  // CloudFront sets x-forwarded-for; the left-most entry is the client. It is
  // spoofable in general, but Amplify's distribution appends the real edge
  // client IP, so the *last* entry is the trustworthy one here.
  const forwarded = req.headers.get("x-forwarded-for") ?? "";
  const parts = forwarded.split(",").map((p) => p.trim()).filter(Boolean);
  const ip = parts.length ? parts[parts.length - 1] : "unknown";
  return `${scope}:${ip}`;
}

export function rateLimit(
  req: NextRequest,
  scope: string,
  limit: number,
  windowMs: number,
): { ok: true } | { ok: false; retryAfterSeconds: number } {
  const now = Date.now();
  const key = clientKey(req, scope);

  if (buckets.size > MAX_TRACKED) {
    for (const [k, v] of buckets) if (v.resetAt <= now) buckets.delete(k);
    if (buckets.size > MAX_TRACKED) buckets.clear();
  }

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }

  if (bucket.count >= limit) {
    return { ok: false, retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)) };
  }

  bucket.count += 1;
  return { ok: true };
}

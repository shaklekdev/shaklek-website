import { NextRequest, NextResponse } from "next/server";

// Origins this site may be called from. Used for two different jobs:
//   - admission control on state-changing routes (below)
//   - choosing the Stripe redirect target in /api/orders
export function allowedOrigins(): Set<string> {
  const canonical = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.shaklek.com";
  const allowed = new Set([canonical, "https://www.shaklek.com", "https://shaklek.com"]);
  if (process.env.NODE_ENV !== "production") {
    allowed.add("http://localhost:3000");
    allowed.add("http://127.0.0.1:3000");
  }
  return allowed;
}

export function canonicalOrigin(requested: string | null): string {
  const canonical = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.shaklek.com";
  if (!requested) return canonical;
  return allowedOrigins().has(requested) ? requested : canonical;
}

// Next route handlers have no CSRF protection of their own. The account and
// dashboard POSTs authenticate purely from the Clerk session cookie, which is
// SameSite=Lax today -- so a cross-site POST would not carry it. That is one
// Clerk configuration change away from being exploitable, and it costs
// nothing to not depend on it.
//
// A same-origin fetch() always sends Origin on a POST. A cross-site form post
// sends the attacker's Origin. Some privacy tooling strips it, hence the
// null-Origin allowance -- that case still needs the SameSite cookie to work
// at all, so it is not a hole so much as the status quo.
export function rejectCrossOrigin(req: NextRequest): NextResponse | null {
  const origin = req.headers.get("origin");
  if (!origin) return null;
  if (allowedOrigins().has(origin)) return null;

  console.warn(`[guards] rejected cross-origin ${req.method} from ${origin} to ${req.nextUrl.pathname}`);
  return NextResponse.json({ ok: false, error: "Cross-origin request rejected" }, { status: 403 });
}

// App Router route handlers buffer the whole body with no default limit, so
// req.json() on an unauthenticated endpoint is a free memory-DoS. Checking
// Content-Length rejects the common case before anything is read.
export function rejectOversizedBody(req: NextRequest, maxBytes: number): NextResponse | null {
  const declared = Number(req.headers.get("content-length") ?? 0);
  if (Number.isFinite(declared) && declared > maxBytes) {
    return NextResponse.json({ ok: false, error: "Request body too large" }, { status: 413 });
  }
  return null;
}

// `rejectOversizedBody` above trusts the DECLARED `Content-Length`. A request
// sending `Transfer-Encoding: chunked`, or simply omitting the header, skips it
// entirely -- and `req.text()` then buffers the whole body into memory before
// any signature or auth check has run. On a public, pre-auth endpoint that is a
// free memory-DoS.
//
// This reads the body itself and stops at the cap, so the limit lands on bytes
// actually received rather than on a number the caller supplied. Returns null
// when the cap is exceeded; the caller should answer 413 and read no further.
//
// Flagged by the security review 2026-08-30, which noted CloudFront imposes its
// own ceiling upstream. This closes it at the application, where it does not
// depend on the CDN's configuration staying as it is today.
//
// The decoded string is byte-identical to what `req.text()` returns, which
// matters: a webhook signature is computed over the exact bytes received, so a
// caller can verify against this safely.
export async function readBoundedText(req: NextRequest, maxBytes: number): Promise<string | null> {
  const body = req.body;
  if (!body) return "";

  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;
      total += value.byteLength;
      if (total > maxBytes) {
        // Stop pulling. Without the cancel the sender can keep streaming at us
        // even though the answer is already decided.
        await reader.cancel().catch(() => {});
        return null;
      }
      chunks.push(value);
    }
  } catch {
    // A truncated or aborted upload is not a body we can verify. Refuse it
    // rather than act on a partial payload.
    return null;
  }

  return Buffer.concat(chunks.map((c) => Buffer.from(c))).toString("utf8");
}

// Free-text fields reach the DB, the stylist's email and the PDF spec sheet.
// Cap every one of them at the boundary.
export function boundedText(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, max) : null;
}

// Postgres throws a cast error on a non-uuid value, which surfaces to the
// caller as a 500 and, on a lookup route, doubles as an existence oracle.
// Check the shape before it reaches a query.
export function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

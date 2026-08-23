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

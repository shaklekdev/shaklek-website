import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Stopgap staff gate for /dashboard until real auth (Clerk) is built --
// see payment-auth-todo.md. Fails closed: if DASHBOARD_PASSWORD isn't set,
// the dashboard is unreachable rather than silently public.
export function proxy(request: NextRequest) {
  const password = process.env.DASHBOARD_PASSWORD;

  if (!password) {
    return new NextResponse("Dashboard not configured", { status: 503 });
  }

  const auth = request.headers.get("authorization");
  const expected = "Basic " + Buffer.from(`staff:${password}`).toString("base64");

  if (auth === expected) {
    return NextResponse.next();
  }

  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Shaklek staff"' },
  });
}

export const config = {
  matcher: "/dashboard/:path*",
};

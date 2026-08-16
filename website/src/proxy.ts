import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Replaces the DASHBOARD_PASSWORD Basic Auth stopgap -- see payment-auth-todo.md.
// /dashboard/* requires a signed-in Clerk session; which signed-in emails
// are actually allowed in is checked separately in
// src/app/dashboard/layout.tsx, per Clerk's own guidance to not centralize
// fine-grained checks in proxy (Next.js 16 Server Functions aren't covered
// by proxy matchers, so it can't be the only gate).
//
// /account requires a signed-in session too, but with no email allowlist --
// any customer who signs up gets in, since it's just their own order
// history (matched by email in account/page.tsx).
//
// /api/account/* and /api/dashboard/* are included in the matcher below (so
// clerkMiddleware runs and currentUser() works at all -- without this,
// every call throws "auth() was called but Clerk can't detect usage of
// clerkMiddleware()") but are deliberately NOT in the protected list:
// auth.protect() redirects to the sign-in page, which is wrong for a
// fetch()-called JSON API. Those routes check currentUser() (and, for
// /api/dashboard/*, the STAFF_EMAILS list) themselves and return a 401 JSON
// body instead.
const isDashboardRoute = createRouteMatcher(["/dashboard(.*)"]);
const isAccountRoute = createRouteMatcher(["/account(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isDashboardRoute(req) || isAccountRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/dashboard/:path*", "/account/:path*", "/api/account/:path*", "/api/dashboard/:path*"],
};

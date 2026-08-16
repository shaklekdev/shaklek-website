import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Replaces the DASHBOARD_PASSWORD Basic Auth stopgap -- see payment-auth-todo.md.
// Requires a signed-in Clerk session for every /dashboard/* route. Which
// signed-in emails are actually allowed in is checked separately in
// src/app/dashboard/layout.tsx, per Clerk's own guidance to not centralize
// fine-grained checks in proxy (Next.js 16 Server Functions aren't covered
// by proxy matchers, so it can't be the only gate).
const isDashboardRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isDashboardRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: "/dashboard/:path*",
};

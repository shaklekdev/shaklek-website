import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { isStoreOpen } from "@/lib/storeOpen";

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
// /api/trends/* is in the matcher because those two routes are staff-only
// (they fan out to Google on every call) and check STAFF_EMAILS themselves.
//
// /api/orders/* is in the matcher for the same reason -- /api/orders/:id
// authorizes with currentUser() as one of its two accepted proofs, and
// currentUser() throws outright if clerkMiddleware never ran for the
// request. It is NOT protected: guest checkout must be able to POST an
// order and read back its own confirmation with a signed token.
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

// ---------------------------------------------------------------------------
// THE PRE-LAUNCH GATE. Added 2026-09-12, replacing Amplify branch-level basic
// auth, which returned 401 to everyone including Stripe.
//
// WHY IT MOVED OUT OF AMPLIFY: basic auth there gates EVERY path on the branch
// and cannot exclude one (measured on staging, 2026-08-30). So the Stripe and
// Clerk webhooks 401'd, the daily reconcile job had to be disabled, and Google
// stopped crawling. A gate in code can let exactly the right things through.
//
// ⚠️ THIS IS NOT THE THING STOPPING A CARD BEING CHARGED. It decides what a
// visitor can SEE. `/api/orders` refuses independently on the same switch, and
// that separation is deliberate: a proxy matcher is one regex away from
// exposing checkout, and the failure mode is taking real money for garments we
// cannot cut until the fabric lands. Two locks, either one sufficient.
//
// WHAT STAYS REACHABLE WHILE SHUT, and why each one has to:
//   /coming-soon      the page itself, or the rewrite loops
//   /api/waitlist     the only reason the page exists
//   /api/webhooks/*   Stripe and Clerk. These are the ones Amplify broke.
//   /legal/*          a site collecting email addresses must reach its own
//                     privacy policy. Not optional.
//   /robots.txt, /sitemap.xml, /favicon*, /opengraph*, /_next/*, /catalog/*
//                     crawling and static assets. /catalog/ here is the IMAGE
//                     directory under public/, not the /catalog page.
const OPEN_WHILE_SHUT = [
  "/coming-soon",
  "/api/waitlist",
  "/api/webhooks",
  "/legal",
  "/_next",
  "/catalog/", // public/catalog/*.jpg -- note the trailing slash
  "/fonts",
  "/robots.txt",
  "/sitemap.xml",
  "/favicon.ico",
  "/opengraph-image",
  "/twitter-image",
  "/apple-icon",
  "/icon",
];

function reachableWhileShut(pathname: string): boolean {
  // Exact "/catalog" (the storefront page) must NOT match "/catalog/" (the
  // image folder). startsWith with the trailing slash kept is what separates
  // them, so the entry above is written that way on purpose.
  return OPEN_WHILE_SHUT.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + (prefix.endsWith("/") ? "" : "/")),
  );
}

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  // API ROUTES ARE NEVER REWRITTEN, even while shut. Rewriting a POST to a
  // page returns 405 from the page router, which means /api/orders' own 503
  // never runs and CheckoutForm gets an HTML body where it expects JSON. Every
  // API route in this app already owns its guard -- STORE_OPEN on orders,
  // Clerk on /account and /dashboard, a signed token on reconcile, origin and
  // rate limits on the public writes -- and a route deciding for itself is the
  // pattern the rest of this file already follows.
  const isApi = pathname.startsWith("/api/");

  if (!isStoreOpen() && !isApi && !reachableWhileShut(pathname)) {
    // REWRITE, not redirect. The visitor keeps the URL they typed, so a link
    // shared from a post still reads as shaklek.com rather than announcing
    // /coming-soon, and the page works again the day the store opens with no
    // redirect cached in anyone's browser. A 301 would be remembered.
    const url = req.nextUrl.clone();
    url.pathname = "/coming-soon";
    url.search = "";
    return NextResponse.rewrite(url);
  }

  if (isDashboardRoute(req) || isAccountRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  // ⚠️ WHEN THE GATE IS UP THIS MATCHER IS THE GATE. It was six specific paths
  // when proxy only did auth; if it stays that way, every storefront page is
  // simply not seen by the code above and renders normally to the public.
  //
  // So it now matches everything EXCEPT static assets and the image files,
  // which is the standard Next.js catch-all. The per-path decision is made in
  // reachableWhileShut() rather than here, because a list in one place that is
  // read by one function is auditable and a regex in two places is not.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|catalog/|fonts/).*)"],
};

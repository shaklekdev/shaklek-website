import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

// Every origin below was traced to a specific thing that breaks without it,
// so do not prune this list by eye:
//
//   'unsafe-inline' in script-src  Next emits inline hydration/bootstrap
//                                  scripts. Without it the pages render and
//                                  never hydrate -- the whole site is dead.
//                                  Removing it means nonces via proxy.ts,
//                                  which forces dynamic rendering on the
//                                  catalog. Deliberate trade-off, revisit.
//   clerk.shaklek.com              Clerk on PRODUCTION keys.
//   *.clerk.accounts.dev           Clerk on DEVELOPMENT keys -- which is
//                                  what production is running right now
//                                  (payment-auth-todo.md). Both are listed
//                                  so the production-instance swap cannot
//                                  silently break sign-in.
//   challenges.cloudflare.com      Clerk's Turnstile bot check on sign-up.
//   img.clerk.com                  Signed-in user avatars.
//   clerk-telemetry.com            clerk-js phones home; blocked = console
//                                  noise, but keep it quiet.
//   worker-src blob:               Clerk's session-refresh worker. Blocked =
//                                  users silently logged out mid-session.
//   fonts.googleapis/gstatic       The Reem Kufi logo face, layout.tsx:74.
//   data: / blob: in img-src       Uploaded reference-photo previews, which
//                                  are data URLs held client-side.
//
// Stripe needs NOTHING here: checkout is a full-page redirect to
// checkout.stripe.com, and CSP does not govern top-level navigation. If
// Stripe Elements is ever embedded, js.stripe.com needs script-src and
// frame-src at that point.
// Taken from Clerk's own default directive set
// (node_modules/@clerk/nextjs/dist/esm/server/content-security-policy.js),
// not guessed. Their defaults also allow `https:` and `http:` wholesale in
// script-src -- that is not copied here, since it would defeat the point.
const CLERK_HOSTS = "https://clerk.shaklek.com https://*.clerk.accounts.dev";
const CLERK_PROTECT = "https://*.protect.clerk.com";

// React uses eval() in development to reconstruct callstacks and power other
// debugging features. The CSP applies to `next dev` too, so without this the
// dev server logs "eval() is not supported in this environment" and those
// features silently stop working. Next's own CSP guide calls this out.
//
// Keyed off the config PHASE, not NODE_ENV. NODE_ENV was tried first and
// leaked 'unsafe-eval' into the production header -- it is not reliably
// "production" at the moment this module is evaluated, and a security header
// must not depend on something that loose.
const buildCsp = (isDev: boolean) => [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} ${CLERK_HOSTS} ${CLERK_PROTECT} https://challenges.cloudflare.com`,
  `connect-src 'self' ${CLERK_HOSTS} ${CLERK_PROTECT} https://clerk-telemetry.com https://*.clerk-telemetry.com https://img.clerk.com`,
  "img-src 'self' data: blob: https://img.clerk.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "worker-src 'self' blob:",
  `frame-src 'self' ${CLERK_PROTECT} https://challenges.cloudflare.com`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const buildConfig = (isDev: boolean): NextConfig => ({
  // pdfkit reads its font .afm files relative to its own package dir at
  // runtime -- bundling it silently breaks that lookup (ENOENT on
  // Helvetica.afm). Keeping it external preserves the real node_modules
  // path instead.
  serverExternalPackages: ["pdfkit"],
  images: {
    // 75 is the default and what the catalog photography uses. 55 is for the
    // homepage hero only: it sits under a bg-white/55 wash and is already
    // upscaled (source is 1584px wide, a DPR2 desktop asks for ~2551), so
    // detail there is not recoverable and not worth 20kb. Next 16 rejects any
    // quality not declared here.
    qualities: [55, 75],
  },

  // Framework disclosure. Off by default here rather than left on.
  poweredByHeader: false,

  // The site shipped with none of these. It takes card payments, so HSTS and
  // a Referrer-Policy are not optional -- order ids travel in the query
  // string of /order-confirmed, and the browser default would leak them in
  // the Referer header of any cross-origin request the page makes.
  //
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            // 2 years + preload. Only safe because every shaklek.com host is
            // already HTTPS-only behind CloudFront.
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Content-Security-Policy", value: buildCsp(isDev) },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
        ],
      },
      {
        // Order data, account data and the staff dashboard must never sit in
        // a shared CloudFront cache or a browser back-forward cache.
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate, private" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
      {
        source: "/order-confirmed",
        headers: [
          { key: "Cache-Control", value: "no-store, private" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          // Stronger than the site default: keeps the order id and its access
          // token out of the Referer header entirely.
          { key: "Referrer-Policy", value: "no-referrer" },
        ],
      },
    ];
  },
});

export default (phase: string): NextConfig => buildConfig(phase === PHASE_DEVELOPMENT_SERVER);

"use client";

import { ClerkProvider } from "@clerk/nextjs";
import type { ReactNode } from "react";

/**
 * Clerk, mounted ONLY on the routes that actually need a signed-in session.
 *
 * WHY THIS IS NOT IN THE ROOT LAYOUT ANY MORE. It was, and it cost every
 * visitor 356KB. Measured on production at a 390px viewport with 4x CPU
 * throttling: the home page was 705KB across 43 requests, and the six heaviest
 * files on it were all Clerk. Half the page weight was an auth SDK on a page
 * with no sign-in on it -- the page most ad traffic lands on and judges the
 * brand by.
 *
 * ⚠️ THE OBVIOUS FIX DOES NOT WORK, so do not try it again. Clerk's UI bundle
 * is NOT in our bundle -- `find .next -name "*clerk*ui*"` returns nothing. It
 * is fetched at runtime by Clerk's own clerk.browser.js from
 * clerk.shaklek.com, so code-splitting it behind next/dynamic changes nothing
 * (built it, measured it: 740KB vs 738KB). @clerk/nextjs v7 exposes no
 * `clerkJSVariant` knob either. The ONLY lever is not mounting the provider.
 *
 * WHICH ROUTES GET IT: anywhere a client component calls a Clerk hook or
 * renders a Clerk component -- /account, /checkout, /dashboard,
 * /order-confirmed, /design/[slug] and /size-guide (both carry
 * SaveMeasurements), and the sign-in/sign-up pages. Marketing pages get
 * nothing.
 *
 * Server-side auth is unaffected: `auth()` and `currentUser()` work off
 * clerkMiddleware in src/proxy.ts, which still runs for every matched request
 * regardless of where this React provider is mounted.
 */
export default function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#1a1a1a",
          fontFamily: "-apple-system, 'Segoe UI', Roboto, sans-serif",
        },
        elements: {
          avatarBox: {
            backgroundColor: "#1a1a1a",
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='8' r='3.5'/%3E%3Cpath d='M5 20c0-4.5 3.5-7 7-7s7 2.5 7 7'/%3E%3C/svg%3E\")",
            backgroundSize: "58%",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          },
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
}

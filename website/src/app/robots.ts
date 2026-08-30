import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

// Amplify sets AWS_BRANCH in every build. Production builds `main`; the
// staging branch builds `staging`.
//
// WHY THIS IS READ HERE AND NOT FROM AN ENVIRONMENT VARIABLE WE ADD:
// /robots.txt is statically generated, so this runs at BUILD time, where every
// Amplify variable is present in `env` regardless of the build spec's
// `env | grep` allowlist. A new NEXT_PUBLIC_ variable would have needed adding
// to that allowlist as well as the console -- the exact two-step that cost an
// hour on RECONCILE_TOKEN. This needs neither.
//
// Undefined locally, so `npm run dev` behaves like production.
const isProductionBranch = (process.env.AWS_BRANCH ?? "main") === "main";

export default function robots(): MetadataRoute.Robots {
  // Staging serves the whole storefront on a public URL with test Stripe keys.
  // It must never appear in a search result: a customer who lands there and
  // tries to buy is handed a checkout that cannot take a real card, and it
  // competes with www.shaklek.com for the brand's own name.
  if (!isProductionBranch) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Staff area, customer account area, and the API surface. Each path
        // also blocks everything beneath it.
        disallow: ["/dashboard", "/account", "/api"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}

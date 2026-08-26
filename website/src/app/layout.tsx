import type { Metadata } from "next";
import {
  DEFAULT_OG_IMAGE,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_URL,
} from "@/lib/seo";
import Footer from "@/components/Footer";
import { CartProvider } from "@/lib/CartContext";
import MetaPixel from "@/components/MetaPixel";
import CookieConsent from "@/components/CookieConsent";
import LaunchOffer from "@/components/LaunchOffer";
import "./globals.css";
import { Cormorant_Garamond, Italiana, Reem_Kufi } from "next/font/google";

// SELF-HOSTED, not fetched from Google at runtime.
//
// These were three <link> tags to fonts.googleapis.com. Measured on production
// 2026-08-26, after the Clerk fix, because the founder still reported lag:
// that stylesheet is RENDER-BLOCKING, sits on a third origin needing its own
// DNS and TLS, answered in 357ms, and pulled 15 font files totalling 245KB --
// including a Cormorant italic used NOWHERE in the codebase (grep: 0 hits).
//
// next/font/google downloads these at BUILD time and serves them from our own
// origin, so there is no third-party round trip, no render-blocking external
// stylesheet, and the files are subset automatically. Same typefaces, same
// weights, same look -- only the delivery changes. Session G owns the
// typography choices; this does not touch them.
//
// Weights kept are the ones actually used: 300 and 400 appear in globals.css,
// 500 and 600 come from font-medium (74 uses) and font-semibold (3). Italic is
// dropped because nothing is italic.
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
  variable: "--font-cormorant",
});
const italiana = Italiana({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-italiana",
});
// Arabic subset only. This face sets exactly one thing -- the Arabic wordmark
// in the header (four glyphs, "شكلك") -- so its latin subset was never going
// to render a character. It stays preloaded because the wordmark is above the
// fold on every page and a swap flash on the brand name is not acceptable.
const reemKufi = Reem_Kufi({
  subsets: ["arabic"],
  weight: "400",
  display: "swap",
  variable: "--font-reem",
});


export const metadata: Metadata = {
  // Pins every relative URL below -- and every per-page canonical, OG and
  // sitemap URL -- to the www. host. The apex 404s, so it must never be
  // emitted.
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  // No canonical here on purpose: it would be inherited by every page that
  // doesn't set one -- pointing the noindex pages at the homepage. The home
  // page declares its own via pageMetadata().
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_AE",
    url: "/",
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE.url],
  },
  // Meta requires the advertising domain to be verified before it will let an
  // ad account own conversion events for it, and before Aggregated Event
  // Measurement can be configured. The token comes from Business Manager and
  // is environment-driven, so the tag simply does not render until the founder
  // has one -- nothing to remove or forget later.
  ...(process.env.NEXT_PUBLIC_FB_DOMAIN_VERIFICATION
    ? {
        verification: {
          other: {
            "facebook-domain-verification":
              process.env.NEXT_PUBLIC_FB_DOMAIN_VERIFICATION,
          },
        },
      }
    : {}),
};

// NOTE: no ClerkProvider here, deliberately. It used to wrap this whole tree
// and put 356KB of Clerk on every marketing page. It is now mounted per-route
// by src/components/AuthProvider.tsx -- read that file before moving it back.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`h-full antialiased ${cormorant.variable} ${italiana.variable} ${reemKufi.variable}`}
    >
      <body className="min-h-full flex flex-col bg-bg text-text">
        <CartProvider>
          {children}
          <Footer />
        </CartProvider>
        {/* Renders nothing at all without NEXT_PUBLIC_META_PIXEL_ID, so this
            ships inert and is switched on with an environment variable
            rather than a code change on a live storefront. */}
        <MetaPixel />
        {/* The consent bar must mount wherever the pixel does: without a way
            to answer, the gate would simply mean the pixel never fires.
            LaunchOffer is separate on purpose and grants nothing about
            cookies. Consent bundled into an unrelated offer is not freely
            given, and it would only ever cover the few who take it. */}
        <CookieConsent />
        <LaunchOffer />
      </body>
    </html>
  );
}

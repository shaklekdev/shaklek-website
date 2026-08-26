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
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* One request for all three faces. Italiana is the WORDMARK ONLY --
            it has a single weight and hairline strokes, so it is a signature,
            not a typeface a page can be set in. Cormorant Garamond replaces
            Georgia as the display face everywhere else (founder 2026-08-26:
            she disliked how the hero line was set, and Georgia was why). */}
        <link
          href="https://fonts.googleapis.com/css2?family=Reem+Kufi:wght@400&family=Italiana&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
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

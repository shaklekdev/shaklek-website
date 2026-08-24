import type { Metadata } from "next";
import {
  DEFAULT_OG_IMAGE,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_URL,
} from "@/lib/seo";
import { ClerkProvider } from "@clerk/nextjs";
import Footer from "@/components/Footer";
import { CartProvider } from "@/lib/CartContext";
import MetaPixel from "@/components/MetaPixel";
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

export default function RootLayout({ children }: LayoutProps<"/">) {
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
      <html lang="en" className="h-full antialiased">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin="anonymous"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Reem+Kufi:wght@400&display=swap"
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
        </body>
      </html>
    </ClerkProvider>
  );
}

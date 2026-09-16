import type { Metadata } from "next";

// The canonical host. The apex shaklek.com 404s -- every absolute URL we
// emit (canonicals, OG tags, sitemap, robots) must carry the www. host, so
// this constant is the only place it is written down.
export const SITE_URL = "https://www.shaklek.com";

export const SITE_NAME = "Shaklek";

// ⚠️ THE MASTER LINE, AND THE ONLY ONE. Founder, 2026-09-16, after counting
// EIGHT different slogans across the site, the pre-launch page, the tab title
// and the business card: "it's too much we need to align."
//
// This is the one she cannot edit -- it is printed on the business cards and
// the packaging -- so it is the fixed point everything else aligns to, and it
// is the line her own brand brief describes (personas.md: "our brand is about
// skin breathing, quality materials, tailored fit, and made in the uae").
//
// It replaced "Your look, your way", which was her line too and had been
// restored twice, but /our-story already explains that Shaklek MEANS "your way"
// in Arabic -- so the tab was the third echo of one idea, and the cards were
// saying something else entirely.
//
// ⚠️ IT IS ALSO IN THE FOOTER, on every page, which is where a tagline belongs
// and where a comment in coming-soon/page.tsx already claimed it lived. It did
// not; the footer said "© 2026 Shaklek" and nothing else. Checked, not assumed.
export const SITE_TAGLINE = "Your skin breathing. Your clothes fitting.";

export const SITE_DESCRIPTION =
  "Design your own unique piece with Shaklek, cut by a real tailor in 100% linen.";

/** Absolute URL on the canonical host, for anywhere Next won't resolve a relative one. */
export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}

export type OgImage = {
  url: string;
  width: number;
  height: number;
  alt: string;
};

// Site-wide social card. 1584x672 -- the real dimensions of the file, which
// scrapers use to lay the card out before they have downloaded the image.
export const DEFAULT_OG_IMAGE: OgImage = {
  url: "/marketing/hero-banner.jpg",
  width: 1584,
  height: 672,
  alt: "Shaklek made-to-order clothing, cut by a tailor in 100% linen.",
};

/**
 * Per-page metadata: canonical, Open Graph and Twitter card in one call.
 * Relative URLs resolve against the `metadataBase` set in the root layout,
 * which pins them to SITE_URL.
 */
export function pageMetadata({
  title,
  description,
  path,
  images = [DEFAULT_OG_IMAGE],
  type = "website",
}: {
  title: string;
  description: string;
  path: string;
  images?: OgImage[];
  type?: "website" | "article";
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type,
      siteName: SITE_NAME,
      // Repeated per page on purpose: Next replaces the whole `openGraph`
      // key rather than deep-merging it, so anything set only in the root
      // layout is dropped on pages that define their own.
      locale: "en_AE",
      url: path,
      title,
      description,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: images.map((image) => image.url),
    },
  };
}

/** Metadata for pages that must never reach an index -- private or transactional. */
export const NOINDEX: Metadata = { robots: { index: false } };

import type { Metadata } from "next";
import Header from "@/components/Header";
import Hero from "@/components/home/Hero";
import FunnelSteps from "@/components/home/FunnelSteps";
import ProductRail from "@/components/home/ProductRail";
import {
  pageMetadata,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
} from "@/lib/seo";

export const metadata: Metadata = {
  ...pageMetadata({
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    path: "/",
  }),
  // Absolute so the root layout's "%s — Shaklek" template doesn't append a
  // second "Shaklek" to a title that already carries the brand.
  title: { absolute: `${SITE_NAME} — ${SITE_TAGLINE}` },
};

/**
 * The home page: say what this is, show the three steps, show the clothes.
 *
 * Two things were built here on 2026-08-25 and then removed by the founder,
 * both deliberately, and neither should be reinstated without her:
 *
 * 1. A live customizer (sleeve toggle + colour dots on a real shirt). Her
 *    call: "I don't like the make it yours on the first one, it shows too
 *    messy. Customization on second page." Customizing belongs on /design,
 *    where there is room to do it properly and where the customer has already
 *    chosen a garment to customize.
 *
 * 2. A value band repeating the brand tenets under the catalog. Her call: it
 *    duplicates what the top of the page and /our-story already say. The
 *    components still exist (TryItDemo, ValueBand) but nothing imports them.
 *
 * What is left is the shortest path that still answers the feedback: a visitor
 * learns what Shaklek is, what the three steps are, and sees the clothes.
 */
export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-bg">
      <Header />
      <Hero />
      <FunnelSteps dense />
      <ProductRail />
    </div>
  );
}

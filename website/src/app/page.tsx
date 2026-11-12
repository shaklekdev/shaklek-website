import type { Metadata } from "next";
import Header from "@/components/Header";
import Hero from "@/components/home/Hero";
import Concept from "@/components/home/Concept";
import ProductRail from "@/components/home/ProductRail";
import BackToTop from "@/components/BackToTop";
import Benefits from "@/components/home/Benefits";
import HomeFaq from "@/components/home/HomeFaq";
import {
  pageMetadata,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
} from "@/lib/seo";

export const metadata: Metadata = {
  ...pageMetadata({
    title: `${SITE_NAME} · ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    path: "/",
  }),
  title: { absolute: `${SITE_NAME} · ${SITE_TAGLINE}` },
};

/**
 * The home page, restructured 2026-08-25 to the founder's brief and reordered
 * 2026-11-12 on opening-night feedback.
 *
 * Banner, then the reasons to buy here ("Why choose us"), then four pieces in
 * a swipeable row with a link to the full catalogue, then the concept in two
 * steps beside the tailor's hands, then five questions answered in place.
 *
 * ⚠️ THE ORDER CHANGED ON 2026-11-12. Friends told the founder the page was
 * too long, repeated the whole catalogue, and buried "Why choose us" at the
 * bottom. Benefits used to sit AFTER the rail (its own header comment still
 * records the 2026-08-25 reasoning: Concept + Benefits above the clothes
 * pushed the first garment to y=1864 on a phone). That objection was to TWO
 * explainer blocks ahead of the clothes; now there is one short one, and
 * Concept moved below the rail, so the first garment is nearer the top than
 * it was in either arrangement.
 *
 * The through-line is that a visitor should never have to leave this page to
 * understand the offer or to have a question answered. /how-it-works is gone
 * from the menu because it was a click that led somewhere nobody can order
 * from; the FAQ is inline for the same reason.
 *
 * Delivery time is deliberately absent from everything above the FAQ. Speed is
 * the wrong headline for a made-to-order garment -- it reads as carelessly
 * made -- so it appears once in the FAQ and again at checkout, where it is a
 * fact someone needs before paying rather than a selling point.
 */
export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-bg">
      <Header />
      <Hero />
      {/* Founder + marketing agent, 2026-11-12: a cold visitor from an ad must
          see the clothes first (COS / Arket pattern), then the one unusual
          mechanism (private home fitting), then the reasons. */}
      <ProductRail />
      <Concept />
      <Benefits />
      <HomeFaq />
      <BackToTop />
    </div>
  );
}

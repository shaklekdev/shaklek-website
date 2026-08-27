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
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    path: "/",
  }),
  title: { absolute: `${SITE_NAME} — ${SITE_TAGLINE}` },
};

/**
 * The home page, restructured 2026-08-25 to the founder's brief.
 *
 * Banner, then the concept in three steps beside the tailor's hands, then the
 * three reasons to buy here, then the clothes in a grid, then five questions
 * answered in place.
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
      <Concept />
      <ProductRail />
      <Benefits />
      <HomeFaq />
      <BackToTop />
    </div>
  );
}

import Image from "next/image";
import Header from "@/components/Header";
import CatalogCard from "@/components/CatalogCard";
import { catalog } from "@/data/catalog";
import type { Metadata } from "next";
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

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-bg">
      <Header />

      <section className="relative w-full overflow-hidden">
        <div className="hero-ken-burns absolute inset-0">
          <Image
            src="/marketing/hero-banner.png"
            alt=""
            fill
            priority
            quality={55}
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-white/70" />
        <div className="relative mx-auto w-full max-w-3xl px-6 pt-14 pb-8 text-center">
          <h1 className="text-[28px] leading-tight text-text">
            Your look,
            <br />
            your way.
          </h1>
          {/* Was three clauses at 14px in --text-2 over a photograph behind a
              55% wash -- legible on a laptop, hard work on a phone in daylight.
              One sentence, a step up in size and weight, and the full text
              colour rather than the muted one. */}
          <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed font-medium text-text">
            Timeless essentials in cotton and linen, cut to your shape — and you
            see every change before it&apos;s made.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pt-12 pb-5">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-lg text-text">Start with a piece</h2>
            <p className="mt-1 text-[13px] text-text-3">
              Make it yours in the next step.
            </p>
          </div>
          <p className="hidden text-[13px] text-text-3 sm:block">
            From AED 389 · one price per piece · made in 10 days
          </p>
        </div>
      </section>

      {/* Carousel — edge fade hints there's more to scroll */}
      <section className="relative w-full pb-20">
        <div className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-3 sm:px-[max(1.5rem,calc((100vw-72rem)/2))]">
          {catalog.map((item, i) => (
            <div key={item.slug} className="w-[220px] shrink-0 snap-start sm:w-[248px]">
              {/* The first two cards are above the fold at every width, so
                  they shouldn't wait for the lazy-load intersection check.
                  `eager`, not `priority` -- priority would inject a preload
                  that competes with the hero, which is the LCP element. */}
              <CatalogCard item={item} eager={i < 2} />
            </div>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-bg to-transparent sm:hidden" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-bg to-transparent sm:hidden" />
      </section>
    </div>
  );
}

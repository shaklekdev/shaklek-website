import { notFound } from "next/navigation";
import Header from "@/components/Header";
import DesignCustomizer from "@/components/DesignCustomizer";
import { catalog, completeTheLook } from "@/data/catalog";
import CatalogCard from "@/components/CatalogCard";
import type { Metadata } from "next";
import { DEFAULT_OG_IMAGE, NOINDEX, pageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return catalog.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = catalog.find((i) => i.slug === slug);

  // Unknown slug renders notFound() below -- give the 404 nothing to index.
  if (!item) return NOINDEX;

  // The item's own catalog photo as the social card. Catalog photography is
  // 848x1264; declaring the real size lets scrapers lay the card out before
  // they have fetched the file.
  const image = item.image
    ? {
        url: item.image,
        width: 848,
        height: 1264,
        alt: `${item.name}. ${item.descriptor}, made to order by Shaklek.`,
      }
    : DEFAULT_OG_IMAGE;

  return pageMetadata({
    title: item.name,
    description: `${item.name}. ${item.descriptor}. Made to order in your measurements, from AED ${item.price}. Choose the colour, cut and length, and our team makes it for you.`,
    path: `/design/${item.slug}`,
    images: [image],
  });
}

export default async function DesignPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = catalog.find((i) => i.slug === slug);

  if (!item) notFound();
  const looks = completeTheLook(item.slug);

  return (
    <div className="flex flex-1 flex-col bg-bg">
      <Header />
      {/* max-w-xl kept the whole customizer in a 576px column on a 1440px
          screen, leaving ~60% of the viewport empty. Widened from lg up so the
          two-column customizer has room; the narrower cap still applies on
          phones and tablets. */}
      {/* No "back to catalog" link. Founder's brief: this is the page where
          someone is about to buy, and offering them the way back to browsing
          at that moment is an invitation to leave. The header still carries
          Catalog for anyone who genuinely wants it. */}
      <DesignCustomizer item={item} />
      {/* ⚠️ THE ONE PLACE THIS WAS MISSING. The visit and the delivery are both
          Dubai-only and both say so on /catalog, /size-guide, /shipping, the
          FAQ and the checkout summary -- everywhere EXCEPT the page where
          someone picks a fabric and adds to cart. So a customer in Sharjah
          designed a garment and first met "Dubai" at checkout, after the work
          of choosing was already done. Nothing blocks that order and the
          founder does not want it blocked; she wants to be asked first, so she
          can quote the travel or decline it.

          ⚠️ MOST OF HER WORDING IS DELIBERATELY NOT HERE. SizePicker already
          renders "We come to you and measure you. Free on your first order, in
          Dubai. Order first and we get in touch to arrange it, before anything
          is cut." higher up this same page, so repeating it a few hundred
          pixels below read as a stutter. The first draft did exactly that and
          it was caught by COUNTING THE PHRASE IN THE RENDERED HTML (2x), not by
          reading the diff -- the duplicate lived in a different component and
          no diff would have shown it.

          What is left here is only what that sentence does not say: DELIVERY,
          and the outside-Dubai route. If SizePicker's copy ever moves off this
          page, the visit sentence has to come back here.

          Wording is the founder's own, 2026-09-16. Two things it is careful
          about: "order first and we get in touch" (the visit is arranged after
          the order, not booked on this page), and "before anything is cut"
          (made-to-order, so there is a real window in which to fix a
          measurement). WhatsApp, never a form -- founder, 2026-09-14: "I'm NOT
          MAKING A CUSTOMER FILL A FORM".

          It sits BELOW the customizer on purpose. Above it, it competes with
          the fabric and the sliders; below, it is the last thing read before
          the Pay bar.

          ⚠️ 2026-11-05: THE VISIT SENTENCE AND "OUTSIDE DUBAI" ARE GONE. Founder
          pulled the free at-home visit from the whole site until she defines
          appointment slots (OPEN.md measuring-slots), so there is no
          Dubai/elsewhere split left to explain: SizePicker now says we take
          the measurements after the order, on WhatsApp, for everyone.

          What this paragraph carries instead is the ONE fit reassurance the
          product page is allowed. Founder, 2026-11-05, full site pass: "if
          something isn't bringing conversion, mention it ONLY WHERE IT HAS TO
          BE". The dated 10-day version lives in legal/terms and one /faq
          answer only; here it is one line, no date, because a window is a
          condition and a condition at the moment of choosing reads as a
          caveat. The legally required returns row in ProductDisclosure above
          is the other mention on this page and it is the law's, not ours.

          ⚠️ NO WHATSAPP LINK HERE, 2026-11-05. The page said WhatsApp three
          times -- header, SizePicker, this paragraph. Founder kept two: the
          header "Need help" link, which is on every page, and the SizePicker
          line, which is the one that helps the Tailored decision. */}
      <div className="mx-auto w-full max-w-xl px-4 pb-10 sm:px-6 lg:max-w-5xl">
        <p className="border-t border-border pt-6 text-sm leading-relaxed text-text-2">
          Every piece is cut from your measurements and your choices, with
          special care. If it still needs a touch, one alteration is included.
          Delivery is included everywhere in the UAE.
        </p>
      </div>
      {/* COMPLETE YOUR LOOK, curated per piece in catalog.ts (COMPLETE_THE_LOOK).
          ⚠️ BELOW EVERYTHING, never beside the buy block: the customizer is one
          decision and a row of other garments next to Add to cart competes with
          it (OPEN.md complete-your-look). Founder, 2026-10-11: on every page. */}
      {looks.length ? (
        <section className="mx-auto w-full max-w-xl px-4 pb-16 sm:px-6 lg:max-w-5xl">
          <h2 className="border-t border-border pt-8 text-lg text-text">Complete your look</h2>
          <div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-8 sm:gap-x-6 lg:grid-cols-3">
            {looks.map((l) => (
              <CatalogCard key={l.slug} item={l} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

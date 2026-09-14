import Header from "@/components/Header";
import Link from "next/link";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "How it works",
  // ⚠️ THE OLD DESCRIPTION PROMISED "made in about 10 days across the UAE".
  // The founder cut lead times from advertising AND from the terms of sale on
  // 2026-09-12, because ten working days and two weeks are the same duration
  // and nobody has measured real throughput. It survived here for two days
  // because copy-rules.mjs matched the WORD "ten" and this page wrote "10".
  // The rule now matches the digits too.
  description:
    "You choose the cut, the length and the colour, and one tailor makes that piece to your measurements. In Dubai we come to you and take them ourselves, free, on your first order.",
  path: "/how-it-works",
});

// Kept strictly to what actually ships. An earlier version advertised
// customising pockets and closure -- both real sliders, but both locked
// behind Shaklek+, so the page promised things a customer could not do.
const steps = [
  {
    n: "01",
    title: "Pick a piece",
    body: "Timeless essentials in 100% linen. Shirts and trousers, cut to last past a season.",
  },
  {
    n: "02",
    title: "Change it, and watch it change",
    // This once said "a real photograph, front and back. Not a swatch, not an
    // illustration: the actual piece you will receive" and shipped in that
    // state. The catalogue images are generated, not photographed, so it was a
    // false claim about the product, and "the actual piece you will receive" is
    // the version a customer would reasonably rely on when deciding to buy.
    // Removed 2026-08-25 on the founder's instruction. The honest version makes
    // the same point: every combination has its own image, so the choice is
    // visible rather than imagined. What is NOT claimed is how it was made.
    body: "Sleeve or leg, short or long, cropped or full, in ivory, white, navy or burgundy. Every combination has its own image, front and back, so you can see what you are choosing instead of imagining it.",
  },
  {
    n: "03",
    title: "Add a detail",
    // "Ask for anything else" invited requests a solo tailor cannot take, and
    // every one of those costs a stylist round-trip to decline. Framed as a
    // detail to focus on, the answer is usually yes.
    body: "Anything you would like us to focus on while your piece is made: a wider collar, a shorter sleeve. Tell us in your own words and a stylist confirms what is possible before anything is cut.",
  },
  {
    n: "04",
    title: "Your size, or your measurements",
    body: "Pick XS to XXL, or give us your own numbers and it is cut to those. Same price either way, because nothing here is made before you order it.",
  },
  {
    n: "05",
    title: "A tailor makes it",
    // ⚠️ NO LEAD TIME. This said "About 10 days from order to your door".
    body: "One person, one piece, yours. We tell you when it is cut and when it is on its way.",
  },
];

const promises = [
  { k: "One price per piece", v: "Fabric and every option included. Choosing your own measurements costs nothing extra." },
  { k: "Nothing on a shelf", v: "Your piece does not exist until you ask for it. No overproduction, no markdowns." },
  { k: "Natural fibre only", v: "100% linen against your skin, cut and sewn in the UAE." },
];

export default function HowItWorksPage() {
  return (
    <div className="flex flex-1 flex-col bg-bg">
      <Header />
      <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-14">
        <h1 className="text-[26px] text-text">How Shaklek works</h1>
        <p className="subtitle max-w-md">
          You change it, you see it, then one tailor makes that exact piece for
          your body.
        </p>

        <div className="mt-10 space-y-8">
          {steps.map((s) => (
            <div key={s.n} className="flex gap-5">
              <span className="font-display text-lg text-gold">{s.n}</span>
              <div>
                <h2 className="text-[15px] font-medium text-text">{s.title}</h2>
                <p className="mt-1 text-sm text-text-2">{s.body}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ⚠️ THE MEASURING VISIT IS THE WHOLE REASON TO BUY FROM A BRAND WITH
            NO NAME, so it is a block of its own rather than a line inside step
            04. Founder, 2026-09-14: "showing the option for the free measuring
            that needs to be highlighted."

            FOUR THINGS HERE ARE LOAD-BEARING AND NONE OF THEM ARE DECORATION:

            1. DUBAI ONLY, said out loud. Somebody in Sharjah reading a promise
               that names no city has been mis-sold.
            2. FIRST ORDER, and free for everyone. The 550 order-value threshold
               was removed on 2026-09-12: it is free for anyone, once.
            3. SHE ORDERS FIRST, THEN WE REACH OUT. There is no booking system
               and nothing here may imply one, so never "book a fitting".
            4. THE REASON, which is what makes it worth highlighting rather than
               mentioning: the tailor cuts to seventeen measurements and the
               form asks for four. Shoulder and crotch cannot be self-measured
               reliably, and shoulder is the one that cannot be altered after
               the cloth is cut. Sources: planning/frontend-todo.md and the
               comment at SizePicker.tsx:163.

            ⚠️ AND IT MUST READ THE SAME HERE, IN THE CATALOGUE, ON THE PRODUCT
            PAGES AND IN THE SIZE PICKER. Three surfaces describing one offer in
            three voices is how a customer decides they are not sure what is
            being offered. */}
        <section className="mt-12 border border-gold/60 bg-gold/[0.04] p-7">
          <p className="font-display text-[12px] uppercase tracking-[0.14em] text-gold">
            Free, in Dubai
          </p>
          <h2 className="mt-3 font-display text-[23px] leading-snug text-text">
            We come to you and take your measurements ourselves
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-text-2">
            On your first order, anywhere in Dubai, at a place and a time that
            suit you. There is nothing to arrange now and nothing to pay: order
            the piece you want, and we get in touch to find a moment that works
            for you.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-text-2">
            A tailor cuts to seventeen measurements. A form can sensibly ask for
            four. The rest are the ones that are awkward to take on yourself,
            and your shoulder is both the hardest to reach and the one that
            decides how everything hangs. Twenty minutes with a tape in person
            is the difference between a piece that fits and a piece that nearly
            does.
          </p>
        </section>

        <div className="mt-12 border-t border-border pt-10">
          <dl className="space-y-5">
            {promises.map((p) => (
              <div key={p.k}>
                <dt className="text-[15px] font-medium text-text">{p.k}</dt>
                <dd className="mt-1 text-sm text-text-2">{p.v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <Link
          href="/catalog"
          className="mt-10 inline-block rounded-full bg-accent px-6 py-3 text-sm text-white"
        >
          Start with a piece
        </Link>
      </div>
    </div>
  );
}

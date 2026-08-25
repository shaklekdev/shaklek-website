import Image from "next/image";
import { HERO } from "@/data/homeContent";

/**
 * Hero. The headline and subtitle are the founder's own words and have been
 * restored twice now after rewrites; treat them as fixed copy.
 *
 * A strip of facts (fabric / sizing / lead time / price) sat under the
 * subtitle for part of 2026-08-25 and the founder removed it on sight. The
 * concrete detail it carried lives in the funnel steps and on the product
 * cards, which is enough; the hero stays a hero. Do not reintroduce it.
 *
 * THE BAND HAS ITS OWN HEIGHT, and that is the point of the min-h below.
 * The photograph is `fill` inside `absolute inset-0`, so it has no intrinsic
 * height -- the band used to be exactly as tall as the words in it, 229px on
 * a phone, which under a 70% wash barely reads as a photograph at all.
 * Removing the facts strip took 55px out of it and the founder immediately
 * asked where the hero image had gone. (Production measured 229px too, so
 * this was never a regression; it was always this short and the strip had
 * briefly hidden it.)
 *
 * Tying a photograph's height to how many sentences happen to sit on top of
 * it is the actual bug. The height is set here instead, and editing the copy
 * cannot shrink the image again.
 *
 * PHONES GET PIXELS, NOT vh. A first pass used 44vh and the founder said the
 * hero was taking ~70% of her screen. Measured, it was 56-59% -- because vh
 * resolves against the LARGE viewport and ignores Safari's URL bar, so the
 * share of what she could actually see was higher than the number implied.
 * A px floor on phones is predictable across browser chrome; vh only takes
 * over from `sm` up, where the URL bar is a rounding error.
 */
export default function Hero({ compact = false }: { compact?: boolean }) {
  return (
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
      {/* 70%, not 55%. The wash is what makes the type legible on a phone in
          daylight; that was a contrast problem, not a wording problem. */}
      <div className="absolute inset-0 bg-white/70" />
      <div
        className={`relative mx-auto flex w-full max-w-3xl flex-col justify-center px-6 text-center ${
          compact
            ? "min-h-[200px] py-7 sm:min-h-[34vh] sm:py-8"
            : "min-h-[240px] py-8 sm:min-h-[40vh] sm:py-10"
        }`}
      >
        {/* One line. The founder replaced "Your look, your way." plus a
            four-clause subtitle here on 2026-08-25: too many words separated
            by commas to read on a phone. Do not restore the old pair without
            her -- removing it was a decision, not a regression. */}
        <h1 className="font-display mx-auto max-w-xl text-[22px] leading-snug text-text sm:text-[26px]">
          {HERO.line}
        </h1>
      </div>
    </section>
  );
}

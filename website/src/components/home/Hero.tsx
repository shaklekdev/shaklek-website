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
 * it is the actual bug. It is now a deliberate fraction of the viewport, and
 * editing the copy cannot shrink the image again.
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
          compact ? "min-h-[38vh] py-8" : "min-h-[44vh] py-10 sm:min-h-[48vh]"
        }`}
      >
        <h1 className="text-[28px] leading-tight text-text">
          {HERO.headline[0]}
          <br />
          {HERO.headline[1]}
        </h1>
        <p className="font-display mx-auto mt-3 max-w-md text-[16px] leading-relaxed font-normal text-text-2">
          {HERO.subtitle}
        </p>

      </div>
    </section>
  );
}

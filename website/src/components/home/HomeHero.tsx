import Image from "next/image";
import Link from "next/link";
import { HERO } from "@/data/homeContent";

/**
 * Full-bleed photographic hero, founder 2026-11-21: "when you arrive you see a
 * centrepiece", modelled on shop-zavi.com's STRUCTURE (one big photo, a line,
 * two buttons). Their words and images are not ours to use; only the layout.
 *
 * Replaces the 150px washed banner (components/home/Hero.tsx, kept for its
 * history notes): a cold visitor from an ad landed on a strip of text over a
 * pale wash and then straight onto product cards, which read as "dropped into
 * the catalogue".
 *
 * PHOTO: the founder's own shoot (Instagram post "Are you still driving to
 * your tailor?", 2026-11-19, original IMG_2394 in
 * catalog-archive/2026-11-19-carrousel-essayage), chosen by her. Background
 * softly blurred for a shoot look (founder ask): macOS Vision person mask +
 * sharp blur 2.5 (6 was "trop flou"), normalised so the hair does not bleed into the blur. Free, no
 * generation. Metadata stripped on export (the originals carry GPS). A changed photo needs
 * a NEW filename (CloudFront caches by URL for 31 days).
 *
 * HEIGHT: svh, not vh, so Safari's URL bar is excluded and the buttons are
 * never under it. The founder once found a hero too tall (2026-08-25), but
 * that was a text banner; this one is meant to fill the first screen.
 *
 * The headline and sub line are HER words (homeContent.ts HERO), fixed copy.
 */
export default function HomeHero() {
  return (
    <section className="relative flex h-[calc(100svh-var(--header-h,96px))] min-h-[460px] w-full overflow-hidden md:h-[80vh] md:max-h-[820px]">
      <div className="relative h-full w-full md:w-1/2">
        <Image
          src="/marketing/home-hero-oldtown-door-soft2.jpg"
          alt="A woman in a white linen dress in front of a carved wooden door"
          fill
          priority
          quality={75}
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover object-[50%_35%] md:object-[50%_8%]"
        />
        {/* Phones only: dark at the bottom so white type reads in daylight. */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent md:hidden" />
      </div>
      {/* Text block. Phones: over the photo, at the bottom, white. md and up:
          its own cream half beside the photo, dark type (founder 2026-11-21:
          two photos side by side on a laptop looked odd). */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center px-6 pb-[72px] text-center md:static md:w-1/2 md:justify-center md:bg-[#F6F1E9] md:px-12 md:pb-0">
        <p className="text-[10px] tracking-[0.22em] text-white/90 uppercase md:text-xs md:text-text-2">{HERO.sub}</p>
        <h1 className="font-display mt-3 max-w-xl text-[26px] leading-tight text-white md:mt-4 md:max-w-md md:text-[40px] md:text-text">
          {HERO.line}
        </h1>
        <div className="mt-6 flex w-full max-w-sm gap-3 md:mt-9">
          <Link
            href="/catalog"
            className="flex-1 bg-white py-3.5 text-[12px] tracking-[0.16em] text-text uppercase transition-opacity hover:opacity-90 md:bg-text md:text-white"
          >
            Shop now
          </Link>
          <a
            href="#how-it-works"
            className="flex-1 border border-white py-3.5 text-[12px] tracking-[0.16em] text-white uppercase transition-colors hover:bg-white/10 md:border-text md:text-text md:hover:bg-black/5"
          >
            How it works
          </a>
        </div>
      </div>
    </section>
  );
}

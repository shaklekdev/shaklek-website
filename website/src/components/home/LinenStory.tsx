import Image from "next/image";

/**
 * Nature and fabric, founder 2026-11-21 ("les photos de la nature, comme
 * Zavi"): one tall photo then two side by side, a caption laid on each in
 * italic + small tracked caps. Zavi's strip is three fabrics; we sell ONE,
 * linen, so the three tiles follow it from the plant to the hand instead.
 *
 * ⚠️ EVERY CAPTION MUST STAY TRUE OF THE PRODUCT AS IT SHIPS. Linen is the
 * only sellable fabric (src/data/fabrics.ts); "made by hand in the UAE" is the
 * hero's own "Handmade" claim. No water, sustainability or health claims:
 * the journal review of 2026-09-13 removed exactly those.
 *
 * ⚠️ flax-field / flax-stalks are 509 and 637 px wide: soft on a big screen.
 * Swap in sharper files (NEW filenames) when they exist.
 */
const TILES = [
  {
    src: "/marketing/pre-launch/flax-field.jpg",
    alt: "A field of flowering flax",
    title: "Flax",
    line: "The plant linen is spun from",
  },
  {
    src: "/marketing/pre-launch/flax-stalks.jpg",
    alt: "A bundle of dried flax stalks",
    title: "Linen",
    line: "100% linen, our only fabric",
  },
  {
    src: "/marketing/story-tailor-hands-golden.jpg",
    alt: "A tailor's hands working on linen",
    title: "By hand",
    line: "Cut and sewn for you in the UAE",
  },
];

function Tile({ t, className, sizes }: { t: (typeof TILES)[number]; className: string; sizes: string }) {
  return (
    <figure className={`relative overflow-hidden ${className}`}>
      <Image src={t.src} alt={t.alt} fill sizes={sizes} className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
      <figcaption className="absolute bottom-0 left-0 p-4 sm:p-6">
        <p className="font-display text-[20px] text-white italic sm:text-[24px]">{t.title}</p>
        <p className="mt-1 text-[10px] tracking-[0.16em] text-white/90 uppercase sm:text-[11px]">{t.line}</p>
      </figcaption>
    </figure>
  );
}

export default function LinenStory() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 pt-12 sm:pt-16">
      <h2 className="font-display text-center text-[26px] leading-tight text-text sm:text-[34px]">
        From the field to <span className="italic">your</span> piece
      </h2>
      <div className="mt-6 grid gap-2 sm:mt-8 sm:grid-cols-3 sm:gap-3">
        <Tile t={TILES[0]} className="aspect-[4/5] sm:aspect-[3/4]" sizes="(min-width: 640px) 33vw, 100vw" />
        <div className="grid grid-cols-2 gap-2 sm:col-span-2 sm:gap-3">
          <Tile t={TILES[1]} className="aspect-[3/4]" sizes="(min-width: 640px) 33vw, 50vw" />
          <Tile t={TILES[2]} className="aspect-[3/4]" sizes="(min-width: 640px) 33vw, 50vw" />
        </div>
      </div>
    </section>
  );
}

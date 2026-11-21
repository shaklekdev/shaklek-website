import Image from "next/image";
import Link from "next/link";

/**
 * Four-tile collage, founder 2026-11-21 ("leur collection noire, un collage
 * avec 4 images"): shop-zavi.com's black-collection band, layout only. One
 * colour story per collage: burgundy here.
 *
 *   [ abaya at the door ] [ cherries on linen ]
 *   [ burgundy linen    ] [ abaya at the wall ]
 *
 * 2x2 on phones, 4 in a row from lg.
 *
 * The first version (two photos side by side) was rejected: she was small
 * and low in the frame. Her two photos are HER PICKS (2026-11-21) from
 * ~/Downloads/Nada yansoon2 - ORANGE (20261112_131524, 20261112_132708),
 * cropped tight, background lightly blurred (Vision mask), and graded to
 * Crops are HER OWN (she re-cropped the originals in Preview, 2026-11-21),
 * exported whole (the tile trims via objectPosition; walk keeps her feet).
 * v8 (CURRENT) = HER OWN EDITS, used as delivered, resized only, metadata
 * stripped (~/Downloads/IMG_3363.JPG door, ~/Downloads/photo.jpeg walk).
 * Do not re-grade them. Before that, v7 = the hero's recipe (blur 2.5, warm tone) with brightness evened to the
 * hero (door lum 103, walk 94: shadows lifted, never highlights pushed).
 * Earlier: MATCH EACH OTHER (v5): same curve, brightness and saturation measured
 * equal-ish (lum 112/108, sat 0.36/0.30). v3 was rejected: one flat and
 * washed (a "soft" curve), one vivid. Never grade the two separately.
 * Cherries + linen: Gemini 3 Pro 2K, 2026-11-21, burgundy matched to a crop of
 * the real abaya, originals in catalog-archive/2026-11-21-homepage/.
 * "Made to your measurements." is her line (2026-11-14 carousel caption).
 */
const TILES: { src: string; alt: string; pos?: string }[] = [
  { src: "/marketing/home-collage-abaya-door-v8.jpg", alt: "The burgundy linen Open Abaya, worn over white", pos: "50% 50%" },
  { src: "/marketing/home-collage-cherries.jpg", alt: "Dark cherries resting on ivory linen" },
  { src: "/marketing/home-collage-linen-burgundy.jpg", alt: "Burgundy linen in soft folds" },
  { src: "/marketing/home-collage-abaya-walk-v8.jpg", alt: "The burgundy Open Abaya, walking in the old town", pos: "50% 100%" },
];

export default function EditorialBanner() {
  return (
    <section className="pt-12 sm:pt-16">
      <div className="relative mx-auto grid max-w-6xl grid-cols-2 gap-1 sm:gap-2 sm:px-6 lg:grid-cols-4">
        {TILES.map((t) => (
          <div key={t.src} className="relative aspect-[4/5]">
            <Image src={t.src} alt={t.alt} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" style={{ objectPosition: t.pos }} />
          </div>
        ))}
        {/* THE LINE ON THE PHOTOS, Zavi's way (founder 2026-11-21, after a white
            box was "pas raffiné" and the line moved off the photos was not
            what she wanted either): thin white tracked caps straight on the
            images, no box, sitting on the seam. A soft radial shade sits
            behind it only, so it reads without looking like a panel.
            TILE ORDER IS HERS: door, cherries / linen, walk -- do not reorder
            for legibility (she flagged it). The line sits on the LINEN TILE ALONE
            at every width (bottom left on phones, third on desktop), so it
            never crosses her face or the ivory cherries. */}
        <div className="pointer-events-none absolute top-3/4 left-0 flex w-1/2 -translate-y-1/2 justify-center lg:top-1/2 lg:left-[calc(50%+4px)] lg:w-[calc(25%-16px)]">
          <h2 className="bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.30),transparent_70%)] px-2 py-6 text-center">
            {/* Type on the SPAN, not the h2: the global h2 rule in globals.css is
                unlayered, so it beats any utility class on the h2 itself. */}
            <span className="font-body block text-[13px] leading-[1.7] font-light tracking-[0.3em] text-white uppercase [text-shadow:0_1px_14px_rgba(0,0,0,0.35)] sm:text-[18px] lg:text-[16px] lg:tracking-[0.28em]">
              Made to your
              <br /> measurements
            </span>
          </h2>
        </div>
      </div>
      <div className="mt-6 flex justify-center gap-8 text-[11px] tracking-[0.2em] text-text uppercase sm:mt-8 sm:text-[12px]">
        <Link href="/design/open-abaya" className="border-b border-text pb-1 hover:opacity-60">
          The abaya
        </Link>
        <Link href="/catalog" className="border-b border-text pb-1 hover:opacity-60">
          Shop all
        </Link>
      </div>
    </section>
  );
}

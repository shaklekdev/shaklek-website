import Image from "next/image";
import { BENEFITS } from "@/data/homeContent";

/**
 * "Why choose us" in photos, HOME PAGE ONLY (founder 2026-11-21). It replaced
 * two blocks that said the same things twice: "From the field to your piece"
 * (three photo tiles) and the icon grid of BENEFITS. Each argument now sits on
 * its own photo, Zavi-style, title + one line laid on the image.
 *
 * The words come from BENEFITS (homeContent.ts), so they stay identical to the
 * icon version still used on /catalog and /our-story (components/home/Benefits).
 * We are not a known brand: the four arguments stay (founder: "il faut laisser
 * les arguments").
 *
 * id="why-choose-us" is linked from /catalog and the side menu. Keep it.
 * The price tile shows our four linens folded in a stack (Gemini 3 Pro 2K,
 * 2026-11-21, 0.13 USD, archived catalog-archive/2026-11-21-homepage): the
 * argument is "every customisation included", so it shows choice. The flat
 * 2x2 swatch tile was tried first and looked off beside three photos.
 * ⚠️ flax-field (509 px) is soft on big screens;
 * swap in sharper files under NEW filenames when they exist.
 */
const PHOTOS: Record<string, { src: string; alt: string; pos?: string }> = {
  "100% custom-made": { src: "/marketing/story-tailor-hands-golden.jpg", alt: "A tailor's hands working on linen", pos: "50% 45%" },
  "100% natural linen": { src: "/marketing/pre-launch/flax-field.jpg", alt: "A field of flowering flax", pos: "50% 70%" },
  "Fixed price": { src: "/marketing/why-folded-linens.jpg", alt: "Folded linen in our four colours: burgundy, navy, white and ivory", pos: "50% 55%" },
  "Made in the UAE": { src: "/marketing/pre-launch/uae-desert.jpg", alt: "The UAE flag over desert dunes and palms", pos: "50% 45%" },
};

export default function WhyChooseUsPhotos() {
  return (
    <section id="why-choose-us" className="mx-auto w-full max-w-6xl scroll-mt-24 px-6 pt-12 sm:pt-16">
      <h2 className="text-center">Why choose us</h2>
      {/* FOUR WIDE STRIPS, one under the other (founder 2026-11-21): the
          width lets title and line sit on one or two lines each, so nothing
          stacks into a column of words, and it changes the rhythm from the
          square collage above. */}
      {/* LONG / TWO SQUARES / LONG (founder 2026-11-21: "pour pas que ça
          fasse juste quatre lignes"). Left-aligned text on a left shade. */}
      <ul className="mt-6 grid grid-cols-2 gap-2 sm:mt-8 sm:gap-3">
        {BENEFITS.map((b, i) => {
          const ph = PHOTOS[b.k];
          const wide = i === 0 || i === BENEFITS.length - 1;
          return (
            <li
              key={b.k}
              className={`relative overflow-hidden ${wide ? "col-span-2 h-[150px] sm:h-[200px]" : "aspect-square sm:aspect-[4/3]"}`}
            >
              {ph ? (
                <Image
                  src={ph.src}
                  alt={ph.alt}
                  fill
                  sizes={wide ? "(min-width: 1152px) 1104px, 100vw" : "(min-width: 1152px) 552px, 50vw"}
                  className="object-cover"
                  style={{ objectPosition: ph.pos }}
                />
              ) : null}
              <div className="absolute inset-0 bg-black/15" />
              <div
                className={`absolute inset-0 flex flex-col items-start text-left ${wide ? "justify-center px-6 sm:px-12" : "justify-end p-4 sm:p-8"}`}
                style={{
                  background: wide
                    ? "linear-gradient(90deg, rgba(0,0,0,0.32) 0%, rgba(0,0,0,0) 70%)"
                    : "linear-gradient(0deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 65%)",
                  textShadow: "0 1px 10px rgba(0,0,0,0.45)",
                }}
              >
                <p className={`font-display leading-tight text-white ${wide ? "text-[22px] sm:text-[30px]" : "text-[18px] sm:text-[26px]"}`}>
                  {b.k.replace("-", "\u2011")}
                </p>
                <p className={`mt-1.5 text-white ${wide ? "text-[12px] tracking-[0.08em] sm:text-[14px]" : "text-[11px] leading-snug sm:text-[13px]"}`}>{b.v}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

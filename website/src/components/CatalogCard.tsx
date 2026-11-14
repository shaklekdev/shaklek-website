import { includedWith } from "@/data/catalog";
import Link from "next/link";
import type { CatalogItem } from "@/data/catalog";
import { colors } from "@/data/colors";
import CatalogCardPhoto, { type CardPhoto } from "./CatalogCardPhoto";

export default function CatalogCard({
  item,
  eager = false,
  fromMouth = false,
  cta = true,
}: {
  item: CatalogItem;
  fromMouth?: boolean;
  // false on the product page's "Complete your look" cards (founder,
  // 2026-11-14): three CTAs beside Add to cart was too many. Name and price
  // stay clickable.
  cta?: boolean;
  // Set on the cards that are above the fold. Deliberately `loading="eager"`
  // and not next/image's `priority`: priority also injects a <link rel=
  // "preload">, which would make these photos compete with the homepage hero
  // for bandwidth -- and the hero is the LCP element. Eager just removes the
  // lazy-load delay without reordering anything ahead of the hero.
  eager?: boolean;
}) {
  // Built from colorImages so a card can never advertise a colour we have no
  // photograph for. Order follows colors.ts, not the catalog entry, so every
  // card's dots read in the same sequence.
  const photos: CardPhoto[] = colors.flatMap((c) => {
    const src = item.colorImages?.[c.name]?.front;
    return src ? [{ name: c.name, hex: c.hex, src }] : [];
  });

  // item.image is one of the colourways (Ivory, in every current entry). Match
  // on the file rather than assuming, so the dot that starts selected is
  // genuinely the photo on screen -- if a base photo is ever swapped to another
  // colour, this follows it instead of lying about which colour is showing.
  const initial =
    photos.find((p) => p.src === item.image)?.name ?? photos[0]?.name ?? "";

  const href = `/design/${item.slug}`;

  return (
    <div className="group block">
      {photos.length > 0 && initial ? (
        <CatalogCardPhoto
          href={href}
          name={item.name}
          photos={photos}
          initial={initial}
          badge={item.badge}
          elaborate={item.dressTier === "elaborate"}
          eager={eager}
          fromMouth={fromMouth}
        />
      ) : (
        // No photography yet -- the gradient placeholder, with nothing to
        // switch between.
        <Link
          href={href}
          className="relative block aspect-[3/4] w-full overflow-hidden bg-card"
          style={{
            background: `linear-gradient(135deg, ${item.gradient[0]}, ${item.gradient[1]})`,
          }}
        >
          {item.badge && (
            <span className="absolute top-3 right-3 rounded-full bg-accent px-2.5 py-1 text-[9px] font-medium tracking-wide text-white">
              {item.badge}
            </span>
          )}
        </Link>
      )}

      <Link href={href} tabIndex={-1} className="mt-4 block text-center">
        {/* Founder, 2026-11-11: the abaya price reads as too expensive unless the
            shayla is in the NAME on the card, not only on the product page. */}
        <p className="font-display text-[15px] text-text">
          {item.name}
          {includedWith(item.category).map((p) => ` + ${p.name}`).join("")}
        </p>
        {/* ⚠️ NO DESCRIPTOR LINE ON THE CARD. Founder, 2026-09-20: "let's drop
            the description we put on every piece." The field still EXISTS in
            catalog.ts and is still used in three places a visitor never sees --
            the product page's meta description, the image alt text, and the
            Meta product feed -- so do not delete it from the type. It is only
            the visible line under the name that is gone. */}
        <p className="mt-1.5 text-xs text-text-2">AED {item.price}</p>
      </Link>

      {/* Says the piece is not fixed.
          A photograph of a garment with a price under it reads as "this exact
          item, take it or leave it" -- which is what a normal shop sells, and
          the founder's point is that visitors assume the same here. The whole
          proposition is that the piece changes, and nothing on the card said
          so. It goes to the same place tapping the photo does; it exists to
          make the offer legible, not to add a route.

          IT HAS TO CONTAIN THE WORD "CUSTOMISE". This read "Make it yours",
          which is the better line but does not say what the button does --
          the founder's report was that visitors still assumed we sell the one
          garment in the photograph. The plain verb is worth more here than the
          nicer phrase, because the whole problem is comprehension. */}
      {cta ? (
        <Link
          href={href}
          /* ::before extends the hit area 6px above and below (32 -> 44px); the
             visible box is unchanged -- founder review 2026-11-11. */
          className="relative mt-3 block border border-border-strong px-3 py-2 text-center text-[12px] text-text transition-colors before:absolute before:inset-x-0 before:-inset-y-1.5 before:content-[''] hover:border-text hover:bg-text hover:text-white"
        >
          Customise this piece
        </Link>
      ) : null}
    </div>
  );
}

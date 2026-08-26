import Link from "next/link";
import type { CatalogItem } from "@/data/catalog";
import { colors } from "@/data/colors";
import CatalogCardPhoto, { type CardPhoto } from "./CatalogCardPhoto";

export default function CatalogCard({
  item,
  eager = false,
}: {
  item: CatalogItem;
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
        <p className="font-display text-[15px] text-text">{item.name}</p>
        <p className="mt-1 text-[11px] tracking-wide text-text-3 uppercase">
          {item.descriptor}
        </p>
        <p className="mt-1.5 text-xs text-text-2">AED {item.price}</p>
      </Link>

      {/* Says the piece is not fixed.
          A photograph of a garment with a price under it reads as "this exact
          item, take it or leave it" -- which is what a normal shop sells, and
          the founder's point is that visitors assume the same here. The whole
          proposition is that the piece changes, and nothing on the card said
          so. It goes to the same place tapping the photo does; it exists to
          make the offer legible, not to add a route. */}
      <Link
        href={href}
        className="mt-3 block border border-border-strong px-3 py-2 text-center text-[12px] text-text transition-colors hover:border-text hover:bg-text hover:text-white"
      >
        Make it yours
      </Link>
    </div>
  );
}

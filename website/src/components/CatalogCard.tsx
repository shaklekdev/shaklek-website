import Link from "next/link";
import Image from "next/image";
import type { CatalogItem } from "@/data/catalog";
import { colors } from "@/data/colors";

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
  // The grid is deliberately all-Ivory for a consistent look, so without
  // these the other colourways are invisible until the design page. Built
  // from colorImages so a card can never advertise a colour we can't show,
  // and each one deep-links straight into that colour on the design page.
  const swatches = colors.filter((c) => item.colorImages?.[c.name]);
  const href = `/design/${item.slug}`;

  return (
    <div className="group block">
      <div className="relative">
        {/* The swatches below must not be nested inside this link -- an <a>
            inside an <a> is invalid HTML and browsers silently unnest it,
            which breaks the swatch click. They're a sibling instead. */}
        <Link
          href={href}
          className="relative block aspect-[3/4] w-full overflow-hidden rounded-shaklek-sm bg-card"
          style={
            item.image
              ? undefined
              : {
                  background: `linear-gradient(135deg, ${item.gradient[0]}, ${item.gradient[1]})`,
                }
          }
        >
          {item.image && (
            <Image
              src={item.image}
              alt={item.name}
              fill
              sizes="(min-width: 640px) 248px, 220px"
              loading={eager ? "eager" : "lazy"}
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          )}
          {item.badge && (
            <span className="absolute top-3 right-3 rounded-full bg-accent px-2.5 py-1 text-[9px] font-medium tracking-wide text-white">
              {item.badge}
            </span>
          )}
          {item.dressTier === "elaborate" && (
            <span className="absolute top-3 left-3 rounded-full bg-gold px-2.5 py-1 text-[9px] font-medium tracking-wide text-white">
              ELABORATE
            </span>
          )}
        </Link>

        {swatches.length > 1 && (
          // Vertical, anchored bottom-right and growing upward: the
          // TRENDING/NEW badge already sits at top-right. No container --
          // each dot carries its own white ring and soft shadow so it lifts
          // off the photograph on its own.
          <div className="absolute right-2 bottom-2 flex flex-col items-center gap-1">
            {swatches.map((c) => (
              <Link
                key={c.name}
                href={`${href}?color=${encodeURIComponent(c.name)}`}
                aria-label={`${item.name} in ${c.name}`}
                title={c.name}
                // 24x24 is the WCAG 2.5.8 AA minimum, with a 4px gap so
                // adjacent colours are 28px apart centre to centre -- these
                // are four links that each go somewhere different, so a
                // mis-tap is not a no-op, it is the wrong colourway. The
                // visible dot stays 10px; only the target grew.
                className="group/swatch grid h-6 w-6 place-items-center"
              >
                <span
                  className="h-2.5 w-2.5 rounded-full border border-black/10 shadow-[0_1px_3px_rgba(0,0,0,0.18)] ring-2 ring-white/90 transition-transform duration-200 group-hover/swatch:scale-110"
                  style={{ backgroundColor: c.hex }}
                />
              </Link>
            ))}
          </div>
        )}
      </div>

      <Link href={href} tabIndex={-1} className="mt-4 block text-center">
        <p className="font-display text-[15px] text-text">{item.name}</p>
        <p className="mt-1 text-[11px] tracking-wide text-text-3 uppercase">
          {item.descriptor}
        </p>
        <p className="mt-1.5 text-xs text-text-2">AED {item.price}</p>
      </Link>
    </div>
  );
}

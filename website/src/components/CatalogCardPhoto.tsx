"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export type CardPhoto = { name: string; hex: string; src: string };

/**
 * The photo half of a catalog card, with the colour dots that drive it.
 *
 * Reviewer feedback, 2026-08-25: "quand je suis dans la main page j'aimerais
 * cliquer en haut dans l'image pour voir d'autre couleur -- je suis obligé
 * d'entrer dans la page spécifique pour changer de couleur." He was right, and
 * it was worse than it looked: every dot was a <Link> to /design/<slug>?color=,
 * so tapping navy did not show navy, it left the home page. Four colours were
 * on screen and none of them could be seen without committing to a product
 * page first. Now the dot swaps the photo in place and the picture links
 * through carrying whatever colour is showing.
 *
 * Deliberately a client component on its own, rather than making the whole
 * card one: CatalogCard receives the full CatalogItem, and a client boundary
 * there would serialise every comboImages path (24+ per item, 8 items) into
 * the payload of the page most of this brand's traffic loads on a phone.
 * Only these three small fields per colour cross the boundary.
 */
export default function CatalogCardPhoto({
  href,
  name,
  photos,
  initial,
  badge,
  elaborate,
  eager,
}: {
  href: string;
  name: string;
  photos: CardPhoto[];
  initial: string;
  badge?: string;
  elaborate?: boolean;
  eager?: boolean;
}) {
  const [color, setColor] = useState(initial);
  // Only the colours actually looked at. Each stays mounted once shown, so
  // coming back to one is instant instead of blanking the card a second time,
  // and a colour nobody taps is never downloaded -- eight cards preloading
  // four colourways each is not something to do to a phone on 5G.
  const [seen, setSeen] = useState<string[]>([initial]);

  function preload(next: string) {
    setSeen((s) => (s.includes(next) ? s : [...s, next]));
  }

  function show(next: string) {
    preload(next);
    setColor(next);
  }

  // The default colourway keeps the clean /design/<slug> URL; anything else
  // carries the choice through, so the design page opens on the colour that
  // was on screen when it was tapped.
  const linkHref =
    color === initial ? href : `${href}?color=${encodeURIComponent(color)}`;

  return (
    <div className="relative">
      {/* The dots are a sibling of the link, not a child. Nesting an
          interactive control inside an <a> means the anchor swallows the tap
          -- previously that mattered because they were anchors themselves
          (invalid HTML, silently unnested by browsers); it still matters now
          they are buttons, because the navigation would fire instead of the
          colour change. */}
      <Link
        href={linkHref}
        className="relative block aspect-[3/4] w-full overflow-hidden bg-card"
      >
        {seen.map((c) => {
          const src = photos.find((p) => p.name === c)?.src;
          if (!src) return null;
          return (
            <Image
              key={c}
              src={src}
              alt={`${name} in ${c}`}
              fill
              sizes="(min-width: 640px) 248px, 220px"
              loading={eager && c === initial ? "eager" : "lazy"}
              className={`object-cover transition-[opacity,transform] duration-300 group-hover:scale-[1.03] ${
                c === color ? "opacity-100" : "opacity-0"
              }`}
            />
          );
        })}
        {badge && (
          <span className="absolute top-3 right-3 rounded-full bg-accent px-2.5 py-1 text-[9px] font-medium tracking-wide text-white">
            {badge}
          </span>
        )}
        {elaborate && (
          <span className="absolute top-3 left-3 rounded-full bg-gold px-2.5 py-1 text-[9px] font-medium tracking-wide text-white">
            ELABORATE
          </span>
        )}
      </Link>

      {photos.length > 1 && (
        // Vertical, anchored bottom-right and growing upward: the TRENDING/NEW
        // badge already sits at top-right. No container -- each dot carries its
        // own white ring and soft shadow so it lifts off the photograph.
        <div className="absolute right-2 bottom-2 flex flex-col items-center gap-1">
          {photos.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => show(p.name)}
              // Hover only mounts the image (hidden, so it downloads); it must
              // NOT select, or dragging the pointer across the dots would
              // change the garment under the cursor. Selecting is the click.
              onMouseEnter={() => preload(p.name)}
              aria-label={`Show ${name} in ${p.name}`}
              aria-pressed={p.name === color}
              title={p.name}
              // 24x24 is the WCAG 2.5.8 AA minimum, with a 4px gap so adjacent
              // colours are 28px apart centre to centre. The visible dot stays
              // 10px; only the target is larger.
              className="group/swatch grid h-6 w-6 cursor-pointer place-items-center"
            >
              <span
                className={`h-2.5 w-2.5 rounded-full border border-black/10 shadow-[0_1px_3px_rgba(0,0,0,0.18)] transition-transform duration-200 group-hover/swatch:scale-110 ${
                  p.name === color
                    ? "scale-125 ring-2 ring-white"
                    : "ring-2 ring-white/90"
                }`}
                style={{ backgroundColor: p.hex }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

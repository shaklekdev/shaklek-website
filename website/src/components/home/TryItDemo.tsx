"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export type DemoPhoto = {
  color: string;
  hex: string;
  sleeve: "short" | "long";
  src: string;
};

/**
 * The concept, demonstrated instead of described.
 *
 * CLAUDE.md: "the customizer IS the product. Made-to-order only sells if
 * choosing an option visibly changes the garment." That argument applies with
 * more force to the home page than anywhere else, because the home page is
 * where the visitor decides whether any of this is worth a click. Three
 * numbered steps saying "change it and watch it change" ask them to take that
 * on trust. Letting them do it takes two seconds and proves it.
 *
 * It also removes a step rather than adding one, which is the other half of
 * the feedback ("plus tu rajoutes des cliques, plus tu décourages le client"):
 * whatever they pick here travels into the design page, so the first thing
 * they chose is still chosen when they arrive.
 *
 * Do NOT reintroduce any claim that these images are photographs. They are
 * generated, and saying otherwise is a false statement about the product.
 */
export default function TryItDemo({
  slug,
  name,
  photos,
  initialColor,
  initialSleeve = "long",
  heading = "Change it, and watch it change",
  caption = "Change an option and the piece changes with it, so you can see it before it is made.",
}: {
  slug: string;
  name: string;
  photos: DemoPhoto[];
  initialColor: string;
  initialSleeve?: "short" | "long";
  heading?: string;
  caption?: string;
}) {
  const [color, setColor] = useState(initialColor);
  const [sleeve, setSleeve] = useState<"short" | "long">(initialSleeve);

  // Mount every combination once the browser is idle, hidden. They are lazy,
  // so nothing downloads until the demo is actually scrolled into view, and by
  // the time a visitor taps anything it is already cached. A demo of "watch it
  // change" that stalls for a second on the first tap argues the opposite of
  // what it is there to argue.
  const [mountAll, setMountAll] = useState(false);
  useEffect(() => {
    const w = window as typeof window & {
      requestIdleCallback?: (cb: () => void) => number;
    };
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(() => setMountAll(true));
      return () => (w as unknown as { cancelIdleCallback?: (n: number) => void })
        .cancelIdleCallback?.(id);
    }
    const t = setTimeout(() => setMountAll(true), 1500);
    return () => clearTimeout(t);
  }, []);

  const swatches = photos
    .filter((p) => p.sleeve === initialSleeve)
    .map((p) => ({ name: p.color, hex: p.hex }));

  const shown = photos.filter(
    (p) => mountAll || (p.color === color && p.sleeve === sleeve),
  );

  // Handed to the design page, which resolves both against the real option
  // lists and falls back to the defaults for anything it does not recognise.
  const href = `/design/${slug}?color=${encodeURIComponent(color)}&sleeve_length=${sleeve}`;

  return (
    <section className="mx-auto w-full max-w-6xl px-6 pt-12">
      <div className="grid items-center gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-12">
        <div className="relative mx-auto aspect-[3/4] w-full max-w-[16rem] overflow-hidden bg-card lg:max-w-none">
          {shown.map((p) => (
            <Image
              key={p.color + p.sleeve}
              src={p.src}
              alt={`${name}, ${p.sleeve} sleeves, in ${p.color}`}
              fill
              sizes="(min-width: 1024px) 352px, 256px"
              loading="lazy"
              className={`object-cover transition-opacity duration-300 ${
                p.color === color && p.sleeve === sleeve
                  ? "opacity-100"
                  : "opacity-0"
              }`}
            />
          ))}
        </div>

        <div>
          <h2 className="text-lg text-text">{heading}</h2>
          <p className="mt-2 max-w-md text-[13px] leading-relaxed text-text-2">
            {caption}
          </p>

          <div className="mt-6">
            <p className="text-[11px] tracking-wide text-text-3 uppercase">
              Sleeves
            </p>
            <div className="mt-2 inline-flex border border-border">
              {(["short", "long"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSleeve(s)}
                  aria-pressed={s === sleeve}
                  className={`min-w-[84px] px-4 py-2 text-[13px] capitalize transition-colors ${
                    s === sleeve
                      ? "bg-accent text-white"
                      : "cursor-pointer bg-white text-text-2 hover:text-text"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <p className="text-[11px] tracking-wide text-text-3 uppercase">
              Colour
            </p>
            <div className="mt-2 flex items-center gap-2">
              {swatches.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setColor(c.name)}
                  aria-label={`Show ${name} in ${c.name}`}
                  aria-pressed={c.name === color}
                  title={c.name}
                  // 32px target: comfortably past the 24px WCAG 2.5.8 AA
                  // minimum, since these sit close together.
                  className="group/s grid h-8 w-8 cursor-pointer place-items-center"
                >
                  <span
                    className={`h-4 w-4 rounded-full border border-black/10 transition-transform duration-200 group-hover/s:scale-110 ${
                      c.name === color
                        ? "scale-110 ring-2 ring-text ring-offset-2"
                        : "ring-1 ring-black/10"
                    }`}
                    style={{ backgroundColor: c.hex }}
                  />
                </button>
              ))}
            </div>
          </div>

          <Link
            href={href}
            className="mt-7 inline-block bg-accent px-6 py-3 text-sm text-white transition-opacity hover:opacity-90"
          >
            Make this one yours
          </Link>
          <p className="mt-2 text-[12px] text-text-3">
            You keep this {color.toLowerCase()}, {sleeve}-sleeve choice on the
            next page.
          </p>
        </div>
      </div>
    </section>
  );
}

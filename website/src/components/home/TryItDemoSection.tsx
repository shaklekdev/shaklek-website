import { catalog } from "@/data/catalog";
import { colors } from "@/data/colors";
import TryItDemo, { type DemoPhoto } from "./TryItDemo";

// The shirt is the right garment for this: sleeve length is the most visible
// change in the catalog, and short/long reads instantly at thumbnail size in a
// way that cropped/full trousers does not.
const DEMO_SLUG = "oversized-shirt";

/**
 * ⚠️ NOT RENDERED BY ANY PAGE, AND THAT IS A DECISION, NOT AN OVERSIGHT.
 *
 * It was put on the home page under the two steps on 2026-09-16 and the
 * founder removed it the same day, on sight: "no no remove it" -- then, asked
 * nothing further, "for now". So this is PARKED, not rejected: the idea is
 * alive, the placement was wrong or the moment was. Do not wire it back in
 * without asking her -- it has been switched on and off once already, and the
 * next session to find working code rendered by nothing will be tempted to do
 * exactly what this one did.
 *
 * The code stays because it works: real catalogue images, colour and sleeve,
 * and the choice travels into /design via the query string. It is shirt-only.
 *
 * Server half of the home-page demo: resolves the real photographs so the
 * client island receives eight small records instead of the whole CatalogItem
 * (which carries every comboImages path for every colourway).
 *
 * Renders nothing at all if the photography is not complete for the item --
 * a demo of "watch it change" with a missing combination would be worse than
 * no demo.
 */
export default function TryItDemoSection(props: {
  heading?: string;
  caption?: string;
}) {
  const item = catalog.find((i) => i.slug === DEMO_SLUG);
  if (!item) return null;

  const photos: DemoPhoto[] = [];
  for (const c of colors) {
    // "long" is the category default for a shirt, so it has no combo photo of
    // its own and falls back to the colourway's base photo -- the same
    // fallback the design page itself uses.
    const long = item.colorImages?.[c.name]?.front;
    const short = item.comboImages?.[c.name]?.["short:normal"]?.front;
    if (!long || !short) return null;
    photos.push({ color: c.name, hex: c.hex, sleeve: "long", src: long });
    photos.push({ color: c.name, hex: c.hex, sleeve: "short", src: short });
  }

  const initialColor =
    colors.find((c) => item.colorImages?.[c.name]?.front === item.image)?.name ??
    colors[0].name;

  return (
    <TryItDemo
      slug={item.slug}
      name={item.name}
      photos={photos}
      initialColor={initialColor}
      initialSleeve="long"
      {...props}
    />
  );
}

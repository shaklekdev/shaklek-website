import { catalog } from "@/data/catalog";
import { comboKeyFromLabels } from "@/data/parameterSliders";
import type { CartItem } from "@/lib/CartContext";

const bySlug = new Map(catalog.map((item) => [item.slug, item]));

// The cart line already carries everything needed to name the exact photo the
// customer was looking at when they added it: the slug, the colour, and the
// change labels. comboKeyFromLabels turns those labels back into the combo
// key, the same lookup the tailor's spec sheet uses -- so the cart shows the
// ordered silhouette rather than a blank square or a generic hero shot.
//
// Falls back the same way the design page does: the combo photo for that
// colour, then that colour's base photo, then the item's default image.
export function cartThumbnail(item: Pick<CartItem, "slug" | "color" | "changes" | "previewImage">):
  | string
  | undefined {
  // An uploaded reference photo is the customer's own garment -- it wins over
  // anything in the catalog, and uploads have no slug to look up anyway.
  if (item.previewImage) return item.previewImage;

  const catalogItem = bySlug.get(item.slug);
  if (!catalogItem) return undefined;

  const comboKey = comboKeyFromLabels(catalogItem.category, item.changes);
  const combo = comboKey ? catalogItem.comboImages?.[item.color]?.[comboKey] : undefined;
  return combo?.front ?? catalogItem.colorImages?.[item.color]?.front ?? catalogItem.image;
}

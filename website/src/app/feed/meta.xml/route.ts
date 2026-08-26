import { catalog } from "@/data/catalog";
import { colors } from "@/data/colors";
import { SITE_URL } from "@/lib/seo";

/**
 * Product feed for Meta catalog / Advantage+ dynamic ads.
 *
 * One entry per (item, colourway) rather than per item, keyed together by
 * `item_group_id`. Meta shows the variant a viewer engaged with, and colour is
 * the one choice visible in a thumbnail, so a navy browser should see navy in
 * the retargeting ad rather than the ivory hero shot. 8 items x 4 colours = 32
 * entries.
 *
 * Every field is derived from catalog.ts. Nothing here is typed by hand, so a
 * price change or a new colourway reaches the feed without anyone remembering
 * to update it -- the same reasoning as the missing-image build check.
 *
 * DELIBERATELY NOT CLAIMED: nothing in this feed describes the imagery as
 * photography. The images are generated, and Meta ad copy is a place a false
 * claim about the product would travel furthest.
 */

export const dynamic = "force-static";
export const revalidate = 3600;

function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function GET() {
  const entries: string[] = [];

  for (const item of catalog) {
    for (const c of colors) {
      const photo = item.colorImages?.[c.name]?.front;
      if (!photo) continue;

      // Deep-links straight into that colourway. The design page reads
      // ?color= and opens on it, so the ad and the landing page agree.
      const link = `${SITE_URL}/design/${item.slug}?color=${encodeURIComponent(c.name)}`;
      const image = `${SITE_URL}${photo}`;
      const back = item.colorImages?.[c.name]?.back;

      const description =
        `${item.descriptor}. Made to order in 100% linen, cut to your ` +
        `measurements or a standard size for the same price. Choose the cut, the ` +
        `length and the colour, and a tailor makes it for you in about 10 days. ` +
        `Delivered across the UAE.`;

      entries.push(
        [
          "    <item>",
          `      <g:id>${esc(`${item.slug}-${c.name.toLowerCase()}`)}</g:id>`,
          `      <g:item_group_id>${esc(item.slug)}</g:item_group_id>`,
          `      <g:title>${esc(`${item.name} in ${c.name}`)}</g:title>`,
          `      <g:description>${esc(description)}</g:description>`,
          `      <g:link>${esc(link)}</g:link>`,
          `      <g:image_link>${esc(image)}</g:image_link>`,
          back ? `      <g:additional_image_link>${esc(SITE_URL + back)}</g:additional_image_link>` : "",
          `      <g:brand>Shaklek</g:brand>`,
          `      <g:condition>new</g:condition>`,
          // Made to order: nothing is stocked, but every piece can be bought
          // today. "in stock" is the correct value for made-to-order goods --
          // "preorder" would imply a future release date, which is not the case.
          `      <g:availability>in stock</g:availability>`,
          `      <g:price>${item.price}.00 AED</g:price>`,
          `      <g:color>${esc(c.name)}</g:color>`,
          `      <g:material>100% linen</g:material>`,
          `      <g:product_type>${esc(`Womenswear &gt; ${item.category}`)}</g:product_type>`,
          `      <g:google_product_category>Apparel &amp; Accessories &gt; Clothing</g:google_product_category>`,
          "    </item>",
        ]
          .filter(Boolean)
          .join("\n"),
      );
    }
  }

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">\n` +
    `  <channel>\n` +
    `    <title>Shaklek</title>\n` +
    `    <link>${SITE_URL}</link>\n` +
    `    <description>Timeless essentials, made to order in the UAE.</description>\n` +
    entries.join("\n") +
    `\n  </channel>\n</rss>\n`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

import { notFound } from "next/navigation";
import Header from "@/components/Header";
import DesignCustomizer from "@/components/DesignCustomizer";
import { catalog } from "@/data/catalog";
import type { Metadata } from "next";
import { DEFAULT_OG_IMAGE, NOINDEX, pageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return catalog.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = catalog.find((i) => i.slug === slug);

  // Unknown slug renders notFound() below -- give the 404 nothing to index.
  if (!item) return NOINDEX;

  // The item's own catalog photo as the social card. Catalog photography is
  // 848x1264; declaring the real size lets scrapers lay the card out before
  // they have fetched the file.
  const image = item.image
    ? {
        url: item.image,
        width: 848,
        height: 1264,
        alt: `${item.name} — ${item.descriptor}, made to order by Shaklek.`,
      }
    : DEFAULT_OG_IMAGE;

  return pageMetadata({
    title: item.name,
    description: `${item.name} — ${item.descriptor}. Made to order in your measurements, from AED ${item.price}. Choose the colour, cut and length, and a tailor makes it for you.`,
    path: `/design/${item.slug}`,
    images: [image],
  });
}

export default async function DesignPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = catalog.find((i) => i.slug === slug);

  if (!item) notFound();

  return (
    <div className="flex flex-1 flex-col bg-bg">
      <Header />
      {/* max-w-xl kept the whole customizer in a 576px column on a 1440px
          screen, leaving ~60% of the viewport empty. Widened from lg up so the
          two-column customizer has room; the narrower cap still applies on
          phones and tablets. */}
      {/* No "back to catalog" link. Founder's brief: this is the page where
          someone is about to buy, and offering them the way back to browsing
          at that moment is an invitation to leave. The header still carries
          Catalog for anyone who genuinely wants it. */}
      <DesignCustomizer item={item} />
    </div>
  );
}

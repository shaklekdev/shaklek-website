import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import DesignCustomizer from "@/components/DesignCustomizer";
import { catalog } from "@/data/catalog";

export function generateStaticParams() {
  return catalog.map((item) => ({ slug: item.slug }));
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
      <div className="mx-auto w-full max-w-xl px-6 pt-4">
        <Link href="/" className="text-xs text-text-3 hover:text-text-2">
          ← Back to catalog
        </Link>
      </div>
      <DesignCustomizer item={item} />
    </div>
  );
}

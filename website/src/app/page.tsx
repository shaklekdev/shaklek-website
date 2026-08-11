import Header from "@/components/Header";
import CatalogCard from "@/components/CatalogCard";
import { catalog } from "@/data/catalog";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-bg">
      <Header />

      <section className="mx-auto w-full max-w-3xl px-6 pt-14 pb-8 text-center">
        <h1 className="text-[28px] leading-tight text-text">
          Your look,
          <br />
          your way.
        </h1>
        <p className="subtitle mx-auto mt-3 max-w-sm">
          Start from a design our tailors have already approved, or bring
          your own. Customize it, or wear it exactly as shown — either way,
          it&apos;s cut for you, in cotton or linen.
        </p>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-4">
        <div className="flex items-center justify-between">
          <p className="text-[13px] text-text-2">
            Updated weekly · trending now
          </p>
          <p className="text-[13px] text-text-3">
            From AED 290 · Fixed prices · 7 days
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl flex-1 px-6 pb-20">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {catalog.map((item) => (
            <CatalogCard key={item.slug} item={item} />
          ))}
        </div>
      </section>
    </div>
  );
}

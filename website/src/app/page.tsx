import Link from "next/link";
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
          Every piece is made to order — no stock, cut for you in cotton or
          linen, at a fixed price.
        </p>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs tracking-wide text-text-3 uppercase">Step 1</p>
            <h2 className="mt-1 text-lg text-text">Start with an idea</h2>
          </div>
          <p className="text-[13px] text-text-3">From AED 290 · Fixed prices · 7 days</p>
        </div>
      </section>

      <section className="w-full pb-20">
        <div className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-2 sm:justify-center">
          {catalog.map((item) => (
            <div key={item.slug} className="w-[160px] shrink-0 snap-start sm:w-[200px]">
              <CatalogCard item={item} />
            </div>
          ))}
          <Link
            href="/upload"
            className="flex w-[160px] shrink-0 snap-start flex-col items-center justify-center gap-2 rounded-shaklek-sm border border-dashed border-border-strong p-4 text-center transition-colors hover:border-accent sm:w-[200px]"
            style={{ aspectRatio: "3 / 4" }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-text-3">
              <path
                d="M12 16V4m0 0L7 9m5-5l5 5M5 20h14"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="text-[13px] font-medium text-text">Upload your own</p>
            <p className="text-xs text-text-3">Bring a photo or sketch</p>
          </Link>
        </div>
      </section>
    </div>
  );
}

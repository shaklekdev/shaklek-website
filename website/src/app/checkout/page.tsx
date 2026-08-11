import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import CheckoutForm from "@/components/CheckoutForm";
import { catalog } from "@/data/catalog";
import { LINEN_UPCHARGE } from "@/data/colors";

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const item = catalog.find((i) => i.slug === params.slug);

  if (!item) notFound();

  const fabric = params.fabric === "linen" ? "linen" : "cotton";
  const size = params.size ?? "M";
  const color = params.color ?? "Ivory";
  const request = params.request ?? "";
  const total = item.price + (fabric === "linen" ? LINEN_UPCHARGE : 0);

  const orderQuery = new URLSearchParams({
    slug: item.slug,
    size,
    fabric,
    color,
    request,
  }).toString();

  return (
    <div className="flex flex-1 flex-col bg-bg">
      <Header />
      <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
        <Link href={`/design/${item.slug}`} className="text-xs text-text-3 hover:text-text-2">
          ← Back to design
        </Link>

        <h1 className="mt-4 text-[26px] text-text">Complete your order</h1>

        <div className="mt-6 rounded-shaklek-sm border border-border bg-surface p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[15px] font-medium text-text">{item.name}</p>
              <p className="mt-1 text-xs text-text-2">
                {fabric === "cotton" ? "Cotton" : "Linen"} · {color} · Size {size}
              </p>
              {request && (
                <p className="mt-1 text-xs text-text-2">
                  Requested: &ldquo;{request}&rdquo;
                </p>
              )}
              <p className="mt-1 text-xs text-text-2">7 days delivery</p>
            </div>
            <p className="font-display text-xl text-text whitespace-nowrap">
              AED {total}
            </p>
          </div>
        </div>

        <CheckoutForm orderQuery={orderQuery} total={total} />
      </div>
    </div>
  );
}

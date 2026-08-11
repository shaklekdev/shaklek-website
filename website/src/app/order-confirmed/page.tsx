import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import NotifyStylist from "@/components/NotifyStylist";
import { catalog } from "@/data/catalog";
import { LINEN_UPCHARGE } from "@/data/colors";

export default async function OrderConfirmedPage({
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
  const method = params.method ?? "card";
  const total = item.price + (fabric === "linen" ? LINEN_UPCHARGE : 0);

  return (
    <div className="flex flex-1 flex-col bg-bg">
      <Header />
      <div className="mx-auto w-full max-w-lg flex-1 px-6 py-16 text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 12.5L9 17.5L20 6.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h1 className="text-[26px] text-text">Order confirmed</h1>
        <p className="subtitle mx-auto max-w-sm">
          Thank you — your {item.name.toLowerCase()} is on its way to being
          made, just for you.
        </p>

        <div className="mt-8 rounded-shaklek-sm border border-border bg-surface p-5 text-left">
          <p className="text-[15px] font-medium text-text">{item.name}</p>
          <p className="mt-1 text-xs text-text-2">
            {fabric === "cotton" ? "Cotton" : "Linen"} · {color} · Size {size}
          </p>
          {request && (
            <p className="mt-1 text-xs text-text-2">
              Requested: &ldquo;{request}&rdquo;
            </p>
          )}
          <p className="mt-3 font-display text-lg text-text">AED {total}</p>
        </div>

        <div className="mt-6">
          <NotifyStylist
            order={{
              slug: item.slug,
              name: item.name,
              size,
              fabric,
              color,
              request,
              total,
              method,
            }}
          />
        </div>

        <div className="mt-8 rounded-shaklek-sm border border-gold/30 bg-gold/10 p-4 text-left text-xs text-text-2">
          <strong className="text-text">What happens next:</strong> a
          Shaklek stylist reviews your order and reaches out — by WhatsApp
          or email — within 24 hours to confirm the details before it goes
          to your tailor. Expect delivery in about 7 days from confirmation.
        </div>

        <Link
          href="/"
          className="mt-8 inline-block text-sm text-text-2 underline"
        >
          Back to catalog
        </Link>
      </div>
    </div>
  );
}

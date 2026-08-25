import LegalPage from "@/components/LegalPage";
import Link from "next/link";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Delivery",
  description:
    "How long a Shaklek piece takes to make, where we deliver, and what delivery costs.",
  path: "/shipping",
});

// Every other clothing shop publishes this before you buy, and ours only
// existed as a line of copy on the homepage. Delivery is genuinely free -- the
// Checkout Session sets no shipping_options and no shipping_cost, so nothing is
// added at the payment step. If that ever changes, this page has to change with
// it.
export default function ShippingPage() {
  return (
    <LegalPage
      title="Delivery"
      intro="Made to order, delivered across the UAE, included in the price."
    >
      <h2 className="pt-2 text-base font-medium text-text">How long it takes</h2>
      <p>
        Approximately <strong>ten working days</strong> from your order.
        Nothing is cut before your piece is confirmed, which is the point of
        made-to-order.
      </p>
      <p>
        Ten days is an estimate, not a guarantee. If anything moves, whether fabric
        supply, a courier delay or an unusually busy week at the bench, we
        contact you directly rather than letting the date slip quietly.
      </p>

      <h2 className="pt-2 text-base font-medium text-text">What it costs</h2>
      <p>
        Nothing. Delivery is included in the price of every piece, and no
        shipping charge is added at checkout. The price you see on the catalogue
        is the price you pay.
      </p>

      <h2 className="pt-2 text-base font-medium text-text">Where we deliver</h2>
      <p>
        Across the <strong>United Arab Emirates</strong>, all seven emirates.
        We do not ship internationally yet.
      </p>

      <h2 className="pt-2 text-base font-medium text-text">Your address</h2>
      <p>
        Your delivery address and phone number are collected on the secure
        payment page, after you press Pay, not before. Please check them
        carefully. If a parcel comes back to us because the address was wrong
        or nobody could receive it, we will arrange redelivery and may ask you
        to cover the extra courier cost.
      </p>

      <h2 className="pt-2 text-base font-medium text-text">When it arrives</h2>
      <p>
        Try it on promptly. If the fit is not right you have{" "}
        <strong>one free alteration or remake within 14 days</strong> of
        delivery. If a piece arrives damaged or is not what you ordered, tell us
        within 14 days and we remake or refund it in full, including delivery.
        That is separate from the fit guarantee and does not use it up. The{" "}
        <Link href="/legal/terms#returns" className="underline">
          full terms
        </Link>{" "}
        set both out.
      </p>

      <p>
        Anything else, write to{" "}
        <a href="mailto:hello@shaklek.com" className="underline">
          hello@shaklek.com
        </a>{" "}
        or message us on{" "}
        <a
          href="https://wa.me/971504766769"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          WhatsApp
        </a>
        .
      </p>
    </LegalPage>
  );
}

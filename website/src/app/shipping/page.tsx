import LegalPage from "@/components/LegalPage";
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
      intro="Made to order, delivered anywhere in the UAE, included in the price."
    >
      <h2 className="pt-2 text-base font-medium text-text">How long it takes</h2>
      <p>
        Ready in <strong>10 working days</strong>.
      </p>
      {/* ⚠️ NEGATIVE-LANGUAGE PASS, founder 2026-11-05. This said "Ten days is
          an estimate, not a guarantee. If anything moves, whether fabric
          supply, a courier delay or an unusually busy week at the bench, we
          contact you directly rather than letting the date slip quietly." The
          "ten days" was also stale against the 3-week line then above it (10
          working days since 2026-11-20, founder). The
          estimate wording that binds lives in legal/terms. */}

      <h2 className="pt-2 text-base font-medium text-text">What it costs</h2>
      <p>
        Nothing. Delivery is included in every price.
      </p>

      {/* "Your address" and "When it arrives" REMOVED, founder 2026-11-23
          (conversion audit): process and pointers to legal text on a page
          meant to reassure. Both rules live in legal/terms. */}

      <p>
        Anything else, write to{" "}
        <a href="mailto:hello@shaklek.com" className="underline">
          hello@shaklek.com
        </a>
        .
      </p>
    </LegalPage>
  );
}

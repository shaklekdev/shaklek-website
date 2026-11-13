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
      intro="Made to order, delivered anywhere in the UAE, included in the price."
    >
      <h2 className="pt-2 text-base font-medium text-text">How long it takes</h2>
      <p>
        Allow <strong>up to 3 weeks</strong> from your order. Each piece is cut
        and sewn for you, with special care.
        Nothing is made before you order it, which is the point of
        made-to-order.
      </p>
      {/* ⚠️ NEGATIVE-LANGUAGE PASS, founder 2026-11-05. This said "Ten days is
          an estimate, not a guarantee. If anything moves, whether fabric
          supply, a courier delay or an unusually busy week at the bench, we
          contact you directly rather than letting the date slip quietly." The
          "ten days" was also stale against the 3-week line above it. The
          estimate wording that binds lives in legal/terms. */}
      <p>
        We confirm your date with you once your details are final, and if
        anything changes along the way we tell you directly.
      </p>

      <h2 className="pt-2 text-base font-medium text-text">What it costs</h2>
      <p>
        Nothing. Delivery is included in the price of every piece, and no
        shipping charge is added at checkout. The price you see on the catalogue
        is the price you pay.
      </p>

      <h2 className="pt-2 text-base font-medium text-text">Where we deliver</h2>
      {/* ⚠️ "THE AT-HOME MEASUREMENT VISIT IS IN DUBAI ONLY" CAME OUT,
          2026-11-05. Founder pulled the visit from the whole site until she
          defines appointment slots (OPEN.md measuring-slots). */}
      <p>
        <strong>Everywhere in the UAE</strong>, included in the price.
      </p>

      <h2 className="pt-2 text-base font-medium text-text">Your address</h2>
      {/* ⚠️ ONE LINE, NOT A POLICY. This paragraph repeated the returned-parcel
          clause from legal/terms almost word for word; founder, 2026-11-05,
          full site pass. The rule lives in the terms so the two copies cannot
          drift apart; this page keeps the instruction and the pointer. */}
      <p>
        Your delivery address is taken on the secure payment page after you
        press Pay. Check it carefully; how redelivery works is set out in the{" "}
        <Link href="/legal/terms" className="underline">
          terms
        </Link>
        .
      </p>

      {/* ⚠️ THE FIT GUARANTEE AND THE FAULTY-ITEM CLAUSE LEFT THIS PAGE,
          2026-11-05. Founder, full site pass: "if something isn't bringing
          conversion, mention it ONLY WHERE IT HAS TO BE" -- she is tired of
          the same information repeated everywhere. The dated versions (10
          days for fit, 14 for faulty or wrong) now live in legal/terms, plus
          one /faq answer for fit. This page keeps the instruction and the
          pointer, not the promise, so the two numbers cannot drift apart
          again across four files. */}
      <h2 className="pt-2 text-base font-medium text-text">When it arrives</h2>
      <p>
        Try it on when it arrives. If the fit needs a touch, or anything else
        needs our attention, message us; the{" "}
        <Link href="/legal/terms#returns" className="underline">
          full terms
        </Link>{" "}
        set out exactly what is covered.
      </p>

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

import LegalPage from "@/components/LegalPage";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Returns, Alterations & Refunds",
  description:
    "How alterations, returns and refunds work on made-to-order Shaklek pieces.",
  path: "/legal/returns",
});

export default function ReturnsPage() {
  return (
    <LegalPage title="Returns, Alterations & Refunds" updated="17 August 2026">
      <p>
        Every Shaklek piece is made to order, for one person. It
        can&apos;t be restocked or resold. Because of that, our policy
        works differently from a standard retail return, and we&apos;d
        rather be upfront about exactly how, before you order.
      </p>

      <h2 className="pt-2 text-base font-medium text-text">
        The fit guarantee
      </h2>
      <p>
        If your piece doesn&apos;t fit right, you get one free alteration or
        remake within 14 days of delivery. If an alteration genuinely
        isn&apos;t feasible, we&apos;ll offer store credit instead. This
        applies whether you used the standard size chart or entered your
        own measurements. The guarantee doesn&apos;t change, only how
        likely you are to need it.
      </p>

      <h2 className="pt-2 text-base font-medium text-text">
        No refunds on completed custom orders
      </h2>
      <p>
        As a rule, we don&apos;t offer cash refunds once production has
        started. There&apos;s no way to resell a piece made for someone
        else. Fit issues and changes of mind are handled through the
        alteration, remake, or store-credit path above, not a refund.
      </p>

      <h2 className="pt-2 text-base font-medium text-text">
        The one exception: if we can&apos;t make it
      </h2>
      <p>
        Occasionally, what you&apos;ve asked for turns out not to be
        feasible for a tailor to build as described. If that happens,
        we&apos;ll come back to you to work out a version that is, at no
        extra charge. If we genuinely can&apos;t land on something that
        works for both you and the tailor, nothing is produced, and you
        get a full refund. That&apos;s the only case where a cash refund
        applies.
      </p>

      <h2 className="pt-2 text-base font-medium text-text">
        Your design is locked once you pay
      </h2>
      <p>
        Customization happens before checkout, not after. Once an order is
        placed, the design is final. The only thing that ever reopens it is
        the feasibility case above, not a request to change your mind.
      </p>
    </LegalPage>
  );
}

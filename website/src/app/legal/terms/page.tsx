import LegalPage from "@/components/LegalPage";

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="17 August 2026">
      <p>
        Shaklek is a made-to-order clothing studio. These terms cover how
        orders and accounts work. Our{" "}
        <a href="/legal/returns" className="underline">
          Returns, Alterations &amp; Refunds
        </a>{" "}
        policy and{" "}
        <a href="/legal/privacy" className="underline">
          Privacy Policy
        </a>{" "}
        are part of these terms.
      </p>

      <p className="rounded-shaklek-xs border border-border-strong bg-surface p-3 text-xs text-text-3">
        Shaklek is operated by [legal entity, to be added once the business
        is formally incorporated]. Until then, this is a working draft of
        our terms, not a final legal document.
      </p>

      <h2 className="pt-2 text-base font-medium text-text">
        Orders and payment
      </h2>
      <p>
        Every piece is made to order once you complete checkout and payment
        is confirmed. Prices are fixed per piece type and shown in AED
        before you pay. Payment is processed securely by Stripe. Shaklek
        never sees or stores your card details.
      </p>

      <h2 className="pt-2 text-base font-medium text-text">
        Customization is locked once you pay
      </h2>
      <p>
        You choose fabric, color, and fit through the options offered on
        each piece before checkout. Once an order is placed, the design is
        final. See our Returns policy for the one exception, if a piece
        turns out not to be feasible to build as ordered.
      </p>

      <h2 className="pt-2 text-base font-medium text-text">Delivery</h2>
      <p>
        Most orders are delivered within about 10 days of your stylist
        confirming the details. This is an estimate, not a guarantee. If
        something changes your timeline, we&apos;ll reach out directly.
      </p>

      <h2 className="pt-2 text-base font-medium text-text">Accounts</h2>
      <p>
        Creating an account is optional. It lets you save measurements and
        see your order history. You&apos;re responsible for keeping your
        account details accurate and your login secure.
      </p>

      <h2 className="pt-2 text-base font-medium text-text">
        Governing law
      </h2>
      <p>
        These terms are governed by the laws of the United Arab Emirates.
      </p>
    </LegalPage>
  );
}

import LegalPage from "@/components/LegalPage";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Terms, Returns & Alterations",
  description:
    "The terms covering Shaklek orders, made-to-order production, delivery, alterations, refunds and customer accounts.",
  path: "/legal/terms",
});

// Returns used to be a separate page. It is folded in here as one document,
// because splitting it meant the same rule -- that the design is fixed once an
// order is placed -- was written three times across two pages, in slightly
// different words each time. It is now stated once.
//
// Tone: these terms exist to protect Shaklek, but a customer reads them before
// deciding to trust a new brand with AED 389. Cold phrasing like "change of
// mind" costs more than it protects.
//
// ⚠️ NOT LEGALLY REVIEWED. This is a careful commercial draft, not advice. A
// UAE-qualified lawyer should review it before it is relied on -- in particular
// the interaction with Federal Law No. 15 of 2020 on Consumer Protection and
// its executive regulations, which govern what a UAE consumer can and cannot
// waive. Several clauses below (limitation of liability, the no-cash-refund
// rule) are exactly the kind that consumer law can override.
export default function TermsPage() {
  return (
    <LegalPage title="Terms, Returns & Alterations" updated="24 August 2026">
      <p>
        Shaklek is a made-to-order clothing studio in the United Arab Emirates.
        These terms cover how orders, production, delivery, alterations and
        accounts work. Our{" "}
        <a href="/legal/privacy" className="underline">
          Privacy Policy
        </a>{" "}
        forms part of them. By placing an order you accept these terms.
      </p>

      <p className="border border-border-strong bg-surface p-3 text-xs text-text-3">
        Shaklek is operated by [legal entity, to be added once incorporation is
        complete]. Until that is filled in, treat this as a working draft rather
        than a final legal document. Questions:{" "}
        <a href="mailto:hello@shaklek.com" className="underline">
          hello@shaklek.com
        </a>
        .
      </p>

      <h2 className="pt-2 text-base font-medium text-text">How an order works</h2>
      <p>
        You choose a piece, its fabric, colour and cut, and either a standard
        size or your own measurements. Nothing is cut until you have paid and a
        stylist has confirmed the details with you. Because each piece is made
        for one person, the specification is fixed at that point — this is the
        one thing worth knowing before you order, and it is why we confirm with
        you first rather than after.
      </p>
      <p>
        We may decline or cancel an order before production begins — for
        example if a piece cannot be produced as specified, if a price was
        listed in error, or if we suspect fraudulent use of a payment method.
        If we do, you are refunded in full.
      </p>

      <h2 className="pt-2 text-base font-medium text-text">Prices and payment</h2>
      <p>
        Prices are fixed per category and shown in AED before you pay. They
        include the fabric and every option offered on the piece. Payment is
        taken by Stripe; Shaklek never sees or stores your card details.
        Delivery address and payment are collected on Stripe&apos;s secure page
        after you press Pay.
      </p>
      <p>
        Prices may change over time, but never after you have paid — the price
        you were shown at checkout is the price of your order. If a price is
        displayed incorrectly through a technical error, we will tell you before
        anything is made and you may cancel for a full refund.
      </p>

      <h2 className="pt-2 text-base font-medium text-text">Delivery</h2>
      <p>
        Most orders arrive about 10 days after your stylist confirms the
        details. That is an estimate rather than a guarantee, and we will
        contact you directly if anything moves. We deliver within the UAE.
      </p>
      <p>
        Please check your delivery address carefully. If a parcel is returned to
        us because the address was wrong or nobody could receive it, we will
        arrange redelivery, and may ask you to cover the additional courier
        cost. Risk in the garment passes to you on delivery.
      </p>

      <h2 id="returns" className="pt-2 text-base font-medium text-text">
        If the fit isn&apos;t right
      </h2>
      <p>
        You get <strong>one free alteration or remake</strong> within 14 days of
        delivery. This applies whether you chose a standard size or sent your own
        measurements. Message us at{" "}
        <a href="mailto:hello@shaklek.com" className="underline">
          hello@shaklek.com
        </a>{" "}
        or on WhatsApp with a photo and what feels wrong, and a stylist will
        arrange it. If an alteration genuinely isn&apos;t possible, we will offer
        store credit instead.
      </p>
      <p>
        Made-to-order pieces cannot be restocked or resold, so we do not offer
        cash refunds once a piece has been made. The alteration, remake and
        store-credit route above is how fit problems are resolved. Nothing here
        affects your statutory rights as a consumer in the UAE.
      </p>

      <h2 className="pt-2 text-base font-medium text-text">
        If something arrives faulty
      </h2>
      <p>
        If a piece arrives damaged, or is not what you ordered, tell us within
        14 days of delivery and we will remake it or refund it in full,
        including delivery. That is separate from the fit guarantee above and
        does not use it up.
      </p>

      <h2 className="pt-2 text-base font-medium text-text">
        Designs you upload
      </h2>
      <p>
        If you upload a reference image or your own design, you confirm that you
        own it or are allowed to use it, and that it does not infringe anyone
        else&apos;s rights. You keep ownership of what you upload, and grant us
        permission to use it only to produce and deliver your order. We may
        decline anything unlawful, offensive, or that appears to copy another
        brand&apos;s protected design.
      </p>
      <p>
        Uploaded designs are the one case where a piece may turn out not to be
        producible as drawn. If that happens we will come back to you and work
        out a version that is, at no extra cost. If we genuinely cannot, nothing
        is made and you are refunded in full. Everything in the catalogue can be
        made as shown, so this does not apply there.
      </p>

      <h2 className="pt-2 text-base font-medium text-text">Care</h2>
      <p>
        Cotton and linen behave like natural fibres: linen creases, and both
        soften with washing. Follow the care label. Damage from washing against
        the label, alteration by another tailor, or ordinary wear is not covered
        by the fit guarantee.
      </p>

      <h2 className="pt-2 text-base font-medium text-text">Accounts</h2>
      <p>
        An account is optional. It saves your measurements and order history.
        Keep your login secure and your details accurate — you are responsible
        for activity under your account. We may suspend an account being used
        unlawfully or to abuse the alteration guarantee.
      </p>

      <h2 className="pt-2 text-base font-medium text-text">Our content</h2>
      <p>
        The Shaklek name, logo, photography, site design and written content
        belong to us and may not be copied or reused commercially without our
        permission.
      </p>

      <h2 className="pt-2 text-base font-medium text-text">
        Liability and things outside our control
      </h2>
      <p>
        We take responsibility for the pieces we make. We are not liable for
        indirect or consequential loss — for example a garment not arriving in
        time for a particular event — and our total liability for any order is
        limited to what you paid for it. Nothing in these terms limits liability
        that cannot lawfully be limited.
      </p>
      <p>
        Delivery estimates assume normal conditions. Events outside our
        reasonable control — courier disruption, fabric supply failure, illness,
        or anything similar — may delay an order. We will always tell you.
      </p>

      <h2 className="pt-2 text-base font-medium text-text">Changes</h2>
      <p>
        We may update these terms. The version that applies to your order is the
        one published when you placed it, and the date at the top shows when
        this version took effect. If part of these terms turns out to be
        unenforceable, the rest continues to apply.
      </p>

      <h2 className="pt-2 text-base font-medium text-text">Governing law</h2>
      <p>
        These terms are governed by the laws of the United Arab Emirates, and
        the courts of Dubai have jurisdiction over any dispute. We would much
        rather sort anything out directly first — write to{" "}
        <a href="mailto:hello@shaklek.com" className="underline">
          hello@shaklek.com
        </a>{" "}
        and a person will read it.
      </p>
    </LegalPage>
  );
}

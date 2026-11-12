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
// Entity filled in 2026-08-24 from the trade licence: Shaklek For Online
// Selling, sole establishment, Dubai, licence 1645657.
//
// ⚠️ NOT LEGALLY REVIEWED. This is a careful commercial draft, not advice. A
// UAE-qualified lawyer should review it before it is relied on -- in particular
// the interaction with Federal Law No. 15 of 2020 on Consumer Protection and
// its executive regulations, which govern what a UAE consumer can and cannot
// waive. Several clauses below (limitation of liability, the no-cash-refund
// rule) are exactly the kind that consumer law can override.
export default function TermsPage() {
  return (
    <LegalPage title="Terms, Returns & Alterations" updated="12 November 2026">
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
        Shaklek is a trading name of{" "}
        <strong className="text-text-2">Shaklek For Online Selling</strong>{" "}
        (شكلك للبيع عبر الإنترنت), a sole establishment licensed in Dubai,
        United Arab Emirates under commercial licence no.{" "}
        <strong className="text-text-2">1645657</strong>. Questions:{" "}
        <a href="mailto:hello@shaklek.com" className="underline">
          hello@shaklek.com
        </a>
        .
      </p>

      <h2 className="pt-2 text-base font-medium text-text">How an order works</h2>
      <p>
        You choose a piece, its fabric, colour and cut, and either a standard
        size or Tailored, where we take your measurements ourselves. Your piece is
        made for you after you order, once a
        stylist has confirmed the details with you. Because each piece is made
        for one person, the specification is fixed at that point, this is the
        one thing worth knowing before you order, and it is why we confirm with
        you first rather than after.
      </p>
      <p>
        We may decline or cancel an order before production begins, for
        example if a piece cannot be produced as specified, if a price was
        listed in error, or if we suspect fraudulent use of a payment method.
        If we do, you are refunded in full.
      </p>
      {/* CUSTOMER CANCELLATION: founder 2026-11-12, deliberately NOT stated.
          Her call: "say nothing, cancellation is not possible". Do not add a
          cancellation window without asking her. */}

      <h2 className="pt-2 text-base font-medium text-text">Prices and payment</h2>
      <p>
        Prices are fixed per category and shown in AED before you pay. They
        include the fabric and every option offered on the piece, and every
        abaya comes with a matching shayla in the same linen and colour. Payment is
        taken by our secure payment provider; Shaklek never sees or stores your
        card details. Delivery address and payment are collected on its secure
        page after you press Pay.
      </p>
      <p>
        Prices may change over time, but never after you have paid, the price
        you were shown at checkout is the price of your order. If a price is
        displayed incorrectly through a technical error, we will tell you before
        anything is made and you may cancel for a full refund.
      </p>

      <h2 className="pt-2 text-base font-medium text-text">Delivery</h2>
      {/*
        ⚠️ NO LEAD TIME IN THE TERMS. This paragraph promised "about 10 days".
        Removed on the founder's instruction 2026-09-12: "remove the legal
        promise, this is made to order, no contractual here." The number
        predates any measurement of real throughput -- the tailor's volume rate
        is not agreed and no garment has been made at volume -- and
        planning/tailor-capacity.md says throughput is the number that breaks
        first. A lead time stated in the TERMS is a term of sale, which is worse
        than one in an advert.

        ⚠️ A RANGE WENT BACK IN, DELIBERATELY, on her follow-up: "we ship our
        customer apprx in 2 weeks, or just make it less vague". She is right that
        "we will tell you a date later" is useless to someone deciding whether to
        buy. But note that TEN WORKING DAYS AND TWO WEEKS ARE THE SAME DURATION,
        so "two weeks" would have been the cut promise reworded. It says two to
        three weeks to buy real headroom over a throughput nobody has measured,
        and it says estimate and not a guarantee in the same sentence. Narrow it
        only once a month of real orders says you can.
      */}
      <p>
        Every piece is made after you order it. We allow up to 3 weeks for
        most orders. That is an estimate rather than a fixed date: we confirm
        your date once your details are final, and we contact you directly if
        anything moves. Delivery is included in the price to any address in the UAE.{" "}
        {/* ⚠️ "THE AT-HOME MEASUREMENT VISIT IS OFFERED WITHIN DUBAI ONLY" CAME
            OUT, 2026-11-05. Founder pulled the visit from the whole site until
            she defines appointment slots (OPEN.md measuring-slots). Terms must
            not describe a service the site no longer offers -- the same reason
            the uploads and measurements-form clauses below were deleted. What
            is true today: Tailored means we contact her after the order and
            take the measurements before the piece is made. */}
        If you choose Tailored, we contact you after your order to take your
        measurements before your piece is made; otherwise you choose a standard
        size from our size guide.
      </p>
      <p>
        Please check your delivery address carefully. If a parcel is returned to
        us because the address was wrong or nobody could receive it, we will
        arrange redelivery, and may ask you to cover the additional courier
        cost. Risk in the garment passes to you on delivery.
      </p>

      <h2 id="returns" className="pt-2 text-base font-medium text-text">
        Fit and alterations
      </h2>
      <p>
        {/* ⚠️ ALTERATION ONLY, founder 2026-11-05: adjustments, never a full
            remake for fit. Remake/refund is for faulty or wrong items below.

            ⚠️ NEGATIVE-LANGUAGE PASS, founder 2026-11-05: "no negative
            language on the website". Heading was "If the fit isn't right";
            "what feels wrong" and "if an alteration genuinely isn't possible"
            reworded. Every term is unchanged: one alteration, 10 days, store
            credit where alteration is not enough. */}
        You get <strong>one free alteration</strong> within 10 days of
        delivery: we adjust the piece you received (taking in, letting out
        where the seam allowance permits, or changing the hem). This applies whether you chose a standard size or sent your own
        measurements. Message us at{" "}
        <a href="mailto:hello@shaklek.com" className="underline">
          hello@shaklek.com
        </a>{" "}
        or on WhatsApp with a photo and what you would like adjusted, and a
        stylist will arrange it. If the piece needs more than an alteration can
        give, we offer store credit instead.
      </p>
      <p>
        {/* ⚠️ THE NO-CHANGE-OF-MIND-REFUND RULE, stated here and in the Art. 40
            disclosure. Was "cannot be restocked or resold, so we do not offer
            cash refunds once a piece has been made." Same rule, same force,
            said as what applies: a made piece is hers, refunds are for faulty
            or wrong items, fit is the alteration. Do not soften further; UAE
            consumer law lets a retailer decline a change-of-mind refund only
            where the policy is displayed. */}
        Each piece is made for one person, so once it has been made it is
        yours: a made-to-order piece is final, and a change of mind after
        production is outside what a refund covers. Refunds are reserved for
        faulty or wrong items (below), and fit is resolved through the
        alteration and store credit above. Nothing here affects your statutory
        rights as a consumer in the UAE.
      </p>

      <h2 className="pt-2 text-base font-medium text-text">
        If something arrives faulty or wrong
      </h2>
      <p>
        If a piece arrives damaged, or is not what you ordered, tell us within
        14 days of delivery and we will remake it or refund it in full,
        including delivery. That is in addition to the alteration above.
      </p>

      {/* ⚠️ "DESIGNS YOU UPLOAD" IS GONE, deleted 2026-09-15. /upload was
          removed on 2026-09-12 along with the whole slugless pricing branch,
          and nothing in the order flow accepts an image any more. Terms of sale
          governing a feature that does not exist are not harmless: they tell a
          customer she can do something, and they made the contract longer for
          no reason. The matching privacy clause went with it. If custom work
          ever returns, it needs a real catalogue entry with a slug, per
          planning/launch-checklist.md, and these clauses come back with it. */}
      <h2 className="pt-2 text-base font-medium text-text">Care</h2>
      <p>
        {/* ⚠️ THIS SAID "Dry clean only, the fabric is not pre-shrunk". Both
            halves were wrong by 2026-09-14: productDisclosure.ts says "Gentle
            machine wash", approved by the founder on 2026-09-10 after the mill
            confirmed W300235 is water-washed and softened with about 1%
            residual shrinkage. The terms of sale, the product page and the
            printed care label were giving three different instructions, and
            the terms were the one a customer could hold us to. */}
        Linen behaves like the natural fibre it is: it creases, and it softens
        with wear. Follow the care label. The alteration above covers the fit
        of the piece as delivered; care that departs from the label, work by
        another tailor, and ordinary wear sit outside it.
      </p>

      <h2 className="pt-2 text-base font-medium text-text">Accounts</h2>
      <p>
        {/* ⚠️ THIS SAID "It saves your measurements and order history". As of
            2026-09-15 an account saves ORDER HISTORY ONLY: the measurements
            form was taken off /account when Tailored became the in-person
            visit, so the terms were promising a feature the site no longer
            has. If it returns for Shaklek+, this sentence returns with it. */}
        An account is optional. It saves your order history. Keep your login
        secure and your details accurate, and you are responsible for activity
        under your account. We may suspend an account being used unlawfully or
        to abuse the alteration guarantee.
      </p>

      <h2 className="pt-2 text-base font-medium text-text">Our content</h2>
      <p>
        The Shaklek name, logo, imagery, site design and written content
        belong to us and may not be copied or reused commercially without our
        permission.
      </p>

      <h2 className="pt-2 text-base font-medium text-text">
        Liability and things outside our control
      </h2>
      <p>
        We take responsibility for the pieces we make. We are not liable for
        indirect or consequential loss, for example a garment not arriving in
        time for a particular event, and our total liability for any order is
        limited to what you paid for it. Nothing in these terms limits liability
        that cannot lawfully be limited.
      </p>
      <p>
        Delivery estimates assume normal conditions. Events outside our
        reasonable control, courier disruption, a delay in fabric supply,
        illness, or anything similar, may move a date. We will always tell you.
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
        rather sort anything out directly first, write to{" "}
        <a href="mailto:hello@shaklek.com" className="underline">
          hello@shaklek.com
        </a>{" "}
        and a person will read it.
      </p>
    </LegalPage>
  );
}

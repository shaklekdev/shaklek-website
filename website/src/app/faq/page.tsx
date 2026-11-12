import LegalPage from "@/components/LegalPage";
import Link from "next/link";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { BASE_PRICE_BY_CATEGORY } from "@/data/catalog";
import { WHATSAPP_URL } from "@/lib/contact";

export const metadata: Metadata = pageMetadata({
  title: "Questions",
  description:
    "How made-to-order works at Shaklek: sizing, delivery times, alterations, fabrics and prices.",
  path: "/faq",
});

// Every answer here is one a stylist would otherwise have to give by hand, one
// customer at a time. Prices are read from catalog.ts rather than typed, so
// this page cannot drift out of date the way the old "AED 390" copy did.
const FAQS: { q: string; a: React.ReactNode }[] = [
  {
    q: "What does made-to-order actually mean?",
    a: (
      <>
        Nothing is made until you order it. There is no warehouse and no stock.
        Your piece is made for you, piece by piece and with special care, which
        is why we allow up to 3 weeks rather than the next morning, and why it can be cut to your
        measurements rather than an average.
      </>
    ),
  },
  {
    q: "How long does it take?",
    a: (
      <>
        {/* ⚠️ CONSERVATIVE ON PURPOSE, founder 2026-11-05: "make it
            conservative and show we put a lot of work, this is not fast
            fashion". Was "approximately 10 working days". */}
        Allow up to 3 weeks from the moment a stylist confirms your details,
        which usually happens within a day of ordering. Each piece is cut and
        sewn for you, one at a time, with special care: this is not fast
        fashion, and we take the time to get it right. We deliver everywhere in
        the UAE, and delivery is included in the price.
      </>
    ),
  },
  {
    // ⚠️ ONE QUESTION, NOT THREE. Founder, 2026-11-05 full site pass: "Do I
    // have to know my measurements?", "Can you take my measurements for me?"
    // and "Can I send you my own measurements instead?" had converged on the
    // same answer (we contact you after the order / WhatsApp / or a standard
    // size) once the at-home visit left the site, so they were merged here.
    // Every true fact survives: standard size XS to XXL at the same price, the
    // size guide link, and the sequence SHE ORDERS, THEN WE CONTACT HER on
    // WhatsApp and take the measurements before anything is cut. No visit, no
    // "free", no city, no booking implied -- the visit comes back only when
    // she defines slots (OPEN.md measuring-slots).
    //
    // ⚠️ WHATSAPP OR THE ORDER NOTES, NEVER A FORM. Founder, 2026-09-14: "I'm
    // NOT MAKING A CUSTOMER PUT 17 MEASUREMENTS THERE." Both mechanics named
    // here are real today: DetailField is the notes box on the design page and
    // a stylist reads every order.
    //
    // ⚠️ THIS ANSWER IS ALSO WHY /size-guide SURVIVES THE NAV. "Size custom"
    // left the header on 2026-09-16; this is the link that takes somebody
    // there for a reason, so if this answer is ever cut, check the page is
    // still reachable before cutting it.
    q: "Do I have to know my measurements?",
    a: (
      <>
        No. Choose Tailored and, after you order, we contact you on{" "}
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          WhatsApp
        </a>{" "}
        and come to you in Dubai to take your measurements, free, before
        your piece is made. Outside Dubai, we guide you to take them yourself. If you already have
        your own, send them the same way or in the notes on your order, and a
        stylist goes through them with you. Or pick a standard size from XS to
        XXL. The price is the same either way. The{" "}
        <Link href="/size-guide" className="underline">
          size guide
        </Link>{" "}
        shows each measurement and how to take it.
      </>
    ),
  },
  {
    q: "What if it doesn't fit?",
    a: (
      <>
        {/* ⚠️ AN ALTERATION, NOT A REMAKE. Founder, 2026-11-05: "we can't open
            everything, so it has to be like touching, not full remake, make it
            clear." Remake/refund survives ONLY for faulty or wrong items. */}
        Every piece is cut from your measurements and the choices you made, and
        we do everything to get the fit right the first time. If it still
        needs a touch, one alteration is included within 10 days of delivery,
        whether you used a standard size or your own measurements. We adjust the piece you
        have: taking it in, letting it out where the seams allow, or changing
        the hem. Message us with a photo
        and we arrange it. If the piece needs more than an alteration can
        give, we offer store credit instead.
      </>
    ),
  },
  {
    q: "Can I return a piece if I change my mind?",
    a: (
      <>
        {/* ⚠️ NEGATIVE-LANGUAGE PASS, founder 2026-11-05: "no negative
            language on the website". Was "cannot be restocked, so we do not
            offer cash refunds once it has been made. If the fit is wrong...".
            Same policy, said as what we do: refunds are for faulty or wrong
            items, fit is the alteration. The binding wording stays in
            legal/terms. */}
        Every piece is made for one person after you order it, so a finished
        piece is yours to keep. Refunds are reserved for pieces that arrive
        faulty or are not what you ordered, which we remake or refund in full
        within 14 days. Fit is covered by the alteration above. See the{" "}
        <Link href="/legal/terms#returns" className="underline">
          full terms
        </Link>
        .
      </>
    ),
  },
  {
    q: "What fabrics do you use?",
    a: (
      <>
        100% natural linen, and nothing else. It is a plant fibre that
        breathes in Gulf heat and softens with every wear, creasing gently the
        way linen does. We wrote about{" "}
        <Link href="/blog/what-to-wear-dubai-summer-fabric" className="underline">
          why natural fabrics suit a body better
        </Link>{" "}
        if you want the longer answer.
      </>
    ),
  },
  {
    q: "How much does it cost?",
    a: (
      <>
        One fixed price per category, whatever your size or measurements: shirts
        AED {BASE_PRICE_BY_CATEGORY.Shirt}, pants AED{" "}
        {BASE_PRICE_BY_CATEGORY.Pants}, dresses AED{" "}
        {BASE_PRICE_BY_CATEGORY.Dress}, and abayas AED{" "}
        {BASE_PRICE_BY_CATEGORY.Abaya}, which includes a matching shayla in the
        same linen. Fabric, every option on the piece and delivery are all
        included. No quotes, and no surprises at checkout.
      </>
    ),
  },
  {
    q: "Can I ask for a change that isn't one of the options?",
    a: (
      <>
        {/* ⚠️ NEGATIVE-LANGUAGE PASS, founder 2026-11-05. Was "...so the
            answer is sometimes no, but you will always be told before you are
            charged for something we cannot make." Payment is taken at checkout
            and the stylist confirms afterwards, so "before you are charged" was
            also untrue. What is true: a stylist goes through the request with
            her before the piece is made; the terms cover a full refund if an order
            is declined before production. */}
        Write it in the note field when you customise: a shorter sleeve, a
        wider collar. We are a small studio with one tailor, and a stylist
        reads every order and goes through your request with you before
        your piece is made, so you know exactly what is being made for you.
      </>
    ),
  },
  {
    q: "Is there a real person behind this?",
    a: (
      <>
        Yes. Every order is read and confirmed by a stylist before it goes to
        the tailor. A person checks what you asked for, and a person makes it.
        You can reach us at{" "}
        <a href="mailto:hello@shaklek.com" className="underline">
          hello@shaklek.com
        </a>{" "}
        or on{" "}
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          WhatsApp
        </a>
        , and a person will answer.
      </>
    ),
  },
  {
    q: "Do you deliver outside Dubai?",
    a: (
      <>
        Yes. We deliver everywhere in the UAE, and delivery is included in
        the price.
      </>
    ),
  },
];

export default function FaqPage() {
  return (
    <LegalPage
      title="Questions"
      intro="For anything else, write to us. A person reads every message."
    >
      {FAQS.map(({ q, a }) => (
        <div key={q}>
          <h2 className="pt-2 text-base font-medium text-text">{q}</h2>
          <p className="mt-2">{a}</p>
        </div>
      ))}
    </LegalPage>
  );
}

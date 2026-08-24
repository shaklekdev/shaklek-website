import LegalPage from "@/components/LegalPage";
import Link from "next/link";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { BASE_PRICE_BY_CATEGORY } from "@/data/catalog";

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
        Nothing is cut until you order it. There is no warehouse and no stock.
        Your piece is made for you, which is why it takes about ten days rather
        than arriving the next morning, and why it can be cut to your
        measurements rather than an average.
      </>
    ),
  },
  {
    q: "How long does it take?",
    a: (
      <>
        About ten days from the moment a stylist confirms your details, which
        usually happens within a day of ordering. We deliver across the UAE and
        delivery is included in the price.
      </>
    ),
  },
  {
    q: "Do I have to send my measurements?",
    a: (
      <>
        No. You can pick a standard size from XS to XXL and we will cut to that.
        Sending your own measurements is the more accurate option and costs the
        same. See the{" "}
        <Link href="/size-guide" className="underline">
          size guide
        </Link>{" "}
        to decide.
      </>
    ),
  },
  {
    q: "What if it doesn't fit?",
    a: (
      <>
        You get one free alteration or remake within 14 days of delivery,
        whichever is needed, whether you used a standard size or your own
        measurements. Message us with a photo and a stylist arranges it. If an
        alteration genuinely is not possible we offer store credit instead.
      </>
    ),
  },
  {
    q: "Can I return a piece if I change my mind?",
    a: (
      <>
        A made-to-order piece is cut for one person and cannot be restocked, so
        we do not offer cash refunds once it has been made. If the fit is wrong
        the alteration or remake above covers it. If a piece arrives faulty or
        is not what you ordered, we remake or refund it in full. See the{" "}
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
        Organic cotton and linen, and nothing else. Both are natural fibres that
        breathe in Gulf heat. Linen creases. That is the fibre behaving
        normally, not a fault. Both soften with washing.
      </>
    ),
  },
  {
    q: "How much does it cost?",
    a: (
      <>
        One fixed price per category, whatever your size or measurements: shirts
        AED {BASE_PRICE_BY_CATEGORY.Shirt}, skirts {BASE_PRICE_BY_CATEGORY.Skirt}
        , trousers {BASE_PRICE_BY_CATEGORY.Pants}, dresses{" "}
        {BASE_PRICE_BY_CATEGORY.Dress}. Fabric, every option on the piece and
        delivery are all included. No quotes, and no surprises at checkout.
      </>
    ),
  },
  {
    q: "Can I ask for a change that isn't one of the options?",
    a: (
      <>
        Write it in the note field when you customise: a shorter sleeve, a
        wider collar. A stylist reads every order and confirms what is possible
        before anything is cut. We are a small studio with one tailor, so the
        answer is sometimes no, but you will always be told before you are
        charged for something we cannot make.
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
          href="https://wa.me/971504766769"
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
    q: "Do you deliver outside the UAE?",
    a: <>Not yet. We deliver within the UAE only.</>,
  },
];

export default function FaqPage() {
  return (
    <LegalPage
      title="Questions"
      intro="If yours isn't here, write to us. A person reads every message."
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

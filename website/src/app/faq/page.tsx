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
        Your piece is made for you, which is why it takes approximately 10 working days rather
        than arriving the next morning, and why it can be cut to your
        measurements rather than an average.
      </>
    ),
  },
  {
    q: "How long does it take?",
    a: (
      <>
        We strive to have it ready in approximately 10 working days from the moment a
        stylist confirms your details, which
        usually happens within a day of ordering. We deliver in Dubai and
        delivery is included in the price. More locations coming soon.
      </>
    ),
  },
  {
    // ⚠️ THE QUESTION CHANGED, not just the answer. "Do I have to SEND my
    // measurements" described a form that no longer exists, and the old answer
    // called sending them "the more accurate option", which is now backwards:
    // a tailor with a tape beats four numbers a customer guessed.
    q: "Do I have to know my measurements?",
    a: (
      <>
        No. Choose Tailored and we come to you and take them, free, in Dubai.
        Or pick a standard size from XS to XXL. The price is the same either
        way. See the{" "}
        <Link href="/size-guide" className="underline">
          size guide
        </Link>{" "}
        to decide.
      </>
    ),
  },
  {
    // Founder, 2026-09-08. Sits directly after the measurements question,
    // because "do I have to send my measurements" and "can you just take them"
    // are the same worry asked twice.
    //
    // ⚠️ WHAT THIS PROMISE IS, EXACTLY: Dubai only, free, and it happens AFTER
    // the order rather than before. There is no booking system and this copy
    // must not imply one. Only paying customers get an appointment, which is
    // what makes it affordable to offer at all.
    q: "Can you take my measurements for me?",
    a: (
      <>
        If you are in Dubai, yes, and it is free. Order with your best estimate
        and we will contact you to arrange an appointment before anything is
        cut. We take the full set our tailor works from, which is more than any
        online form sensibly asks for, and two of them are close to impossible
        to take accurately on yourself.
        <br />
        <br />
        {/* ⚠️ WHATSAPP, NOT A FORM. Founder, 2026-09-14: "she can do by
            whatsapp to send the measurement, because I'm NOT MAKING A CUSTOMER
            PUT 17 measurements there." Both alternatives were worse: a
            seventeen-field form nobody completes, or turning away every
            customer outside Dubai. A person on the other end can also tell her
            HOW to take the awkward ones, which a form cannot. */}
        Outside Dubai we cannot come to you yet, so send us your measurements
        on{" "}
        <a
          href="https://wa.me/971504766769"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          WhatsApp
        </a>{" "}
        and we will take you through them. Or choose a standard size and tell
        us anything we should know in the notes on your order.
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
        100% linen, and nothing else. It is a natural fibre that breathes in
        Gulf heat and softens with wear. Linen creases. That is the fibre
        behaving normally, not a fault. We wrote about{" "}
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
        AED {BASE_PRICE_BY_CATEGORY.Shirt} and pants{" "}
        {BASE_PRICE_BY_CATEGORY.Pants}. Fabric, every option on the piece and
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
    q: "Do you deliver outside Dubai?",
    a: (
      <>
        Not yet. For now we cover Dubai only, for both the measuring
        appointment and delivery, and more locations are coming soon. If you
        are outside Dubai and want a piece, get in touch and we will see what
        we can do.
      </>
    ),
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

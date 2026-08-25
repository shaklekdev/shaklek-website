import Link from "next/link";

/**
 * Five questions, answered on the home page.
 *
 * Founder's reasoning: a customer with a question leaves the product page to
 * find the answer, and a customer who leaves does not always come back. Native
 * <details> so it works with no JavaScript, and so a phone gets real
 * open/close behaviour for free.
 *
 * Five, not the full nine on /faq. These are the ones that block a purchase;
 * the rest are for someone already committed enough to open the page.
 *
 * Delivery time lives HERE and at checkout, and nowhere in the marketing copy
 * above. The founder's adviser was right that speed is the wrong headline for
 * a made-to-order garment -- fast reads as carelessly made -- but a customer
 * still needs the expectation before paying, and hiding it entirely would be
 * its own kind of dishonesty.
 */
const QUESTIONS = [
  {
    q: "What does made-to-order actually mean?",
    a: (
      <>
        Nothing is cut until you order it. There is no warehouse and no stock.
        Your piece is made for you, which is why it can be cut to your
        measurements rather than an average.
      </>
    ),
  },
  {
    q: "Do I have to send my measurements?",
    a: (
      <>
        No. Pick a standard size from XS to XXL and we will cut to that. Sending
        your own measurements is the more accurate option and costs exactly the
        same. See the{" "}
        <Link href="/size-guide" className="underline">
          size guide
        </Link>
        .
      </>
    ),
  },
  {
    q: "How long does it take?",
    a: (
      <>
        About ten working days. Your piece is made after you order, one at a
        time, by one tailor.
      </>
    ),
  },
  {
    q: "What if it doesn't fit?",
    a: (
      <>
        You get one free alteration or remake within 14 days of delivery,
        whether you chose a standard size or sent your own measurements. Message
        us with a photo and a stylist arranges it.
      </>
    ),
  },
  {
    q: "What fabrics do you use?",
    a: (
      <>
        Organic cotton and linen, and nothing else. Both are natural fibres that
        breathe in Gulf heat. Linen creases. That is the fibre behaving
        normally, not a fault, and both soften with washing.
      </>
    ),
  },
];

export default function HomeFaq() {
  return (
    <section className="border-t border-border bg-card/40">
      <div className="mx-auto w-full max-w-3xl px-6 py-14">
        <h2 className="text-lg text-text">FAQ</h2>
        <div className="mt-6 divide-y divide-border border-y border-border">
          {QUESTIONS.map(({ q, a }) => (
            <details key={q} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-[15px] text-text hover:text-text-2">
                <span>{q}</span>
                <span
                  aria-hidden
                  className="shrink-0 text-text-3 transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="pb-5 text-[13px] leading-relaxed text-text-2">{a}</p>
            </details>
          ))}
        </div>
        {/* No "More questions" link. The point of answering here is that the
            customer never leaves -- sending them to /faq and expecting them to
            find their way back to the catalogue is the behaviour this section
            exists to remove. Founder's call. */}
      </div>
    </section>
  );
}

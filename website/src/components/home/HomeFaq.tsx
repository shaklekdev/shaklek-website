import Link from "next/link";

/**
 * Five questions, answered on the home page.
 *
 * Founder's reasoning: a customer with a question leaves the product page to
 * find the answer, and a customer who leaves does not always come back. Native
 * <details> so it works with no JavaScript, and so a phone gets real
 * open/close behaviour for free.
 *
 * Four, not the full list on /faq. These are the ones that block a purchase;
 * the rest are for someone already committed enough to open the page.
 *
 * ⚠️ IT WAS FIVE UNTIL 2026-11-05. "What if it doesn't fit?" came out of this
 * list on the founder's full site pass: "if something isn't bringing
 * conversion, mention it ONLY WHERE IT HAS TO BE". The dated fit guarantee is
 * stated in legal/terms and in ONE /faq answer; the product page and checkout
 * carry a one-line undated reassurance. This is not the same FAQ as /faq (it
 * is its own list), so it does not get the dated answer, and a second
 * undated line on the home page would be a third statement of a policy.
 * Policies are operational, not value; the home page sells.
 *
 * Delivery time lives HERE and at checkout, and nowhere in the marketing copy
 * above. The founder's adviser was right that speed is the wrong headline for
 * a made-to-order garment -- fast reads as carelessly made -- but a customer
 * still needs the expectation before paying, and hiding it entirely would be
 * its own kind of dishonesty.
 */
const QUESTIONS = [
  {
    q: "Do I have to know my measurements?",
    a: (
      <>
        {/* ⚠️ "WE COME TO YOU ... FREE ON YOUR FIRST ORDER, IN DUBAI" CAME OUT,
            2026-11-05. Founder pulled the at-home visit from the whole site
            until she defines appointment slots (OPEN.md measuring-slots).
            Same wording as the matching /faq answer, on purpose. */}
        No. Choose Tailored and we take them after you order. Or pick a
        standard size, XS to XXL. See the{" "}
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
        Up to 3 weeks. Each piece is cut and sewn after you order.
      </>
    ),
  },
  {
    q: "What fabrics do you use?",
    a: (
      <>
        100% natural linen. It breathes in Gulf heat and softens with every
        wear.
      </>
    ),
  },
];

export default function HomeFaq() {
  return (
    <section className="border-t border-border bg-card/40">
      <div className="mx-auto w-full max-w-3xl px-6 py-12 sm:py-16">
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

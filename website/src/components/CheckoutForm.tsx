"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ShaklekPlusSignup, { SHAKLEK_PLUS_ON } from "@/components/ShaklekPlusSignup";
import { previewDiscountAed, previewTotalAed } from "@/lib/promoPreview";
import { useUser } from "@clerk/nextjs";
import { useCart } from "@/lib/CartContext";
import { capiHandoff, money, newEventId, track } from "@/lib/metaPixel";

type PaymentMethod = "apple-pay" | "card";

const methods: { id: PaymentMethod; label: string; sub: string }[] = [
  { id: "apple-pay", label: "Apple Pay", sub: "" },
  { id: "card", label: "Card", sub: "Visa, Mastercard" },
];

import { BAG_INITIALS_KEY } from "@/components/BagOfferBar";

const PROMO_ENABLED = process.env.NEXT_PUBLIC_PROMO_ENABLED === "true";

const LAST_ORDER_KEY = "shaklek-last-order";

export default function CheckoutForm({ total }: { total: number }) {
  const router = useRouter();
  const { items, clear } = useCart();

  // One delivery estimate for the ORDER, not one per garment.
  //
  // "Working days", and no explanation of when the clock starts. The old
  // wording -- "from stylist confirmation rather than from checkout" -- was
  // accurate and read like a get-out: it told the customer our internal
  // process and then used it to qualify the promise. They do not need to know
  // how the studio works, only when the piece arrives. Founder's call, and
  // her adviser's point that a delivery time is not a selling point for a
  // made-to-order garment is why it appears here and in the FAQ and nowhere
  // in the marketing copy.
  //
  // The checkout used to print "10 days delivery" under every line, so a
  // three-piece order showed "10 days" three times and read as a month. That
  // is the opposite of what happens and it is the kind of arithmetic a
  // customer does silently, on the last screen, without asking.
  //
  // Stated once, and it does not pretend a large order is as quick as a
  // single piece -- one tailor makes these by hand. What it promises is a
  // confirmed date before the pieces are made, which is true and is already how
  // the studio works.
  const units = items.reduce((n, i) => n + (i.quantity ?? 1), 0);
  // (Delivery estimate removed 2026-11-14 with the details block: founder
  // wants one line under Pay. Lead time is stated on the product page.)
  const { isSignedIn, user } = useUser();
  // Founder, 2026-11-11: Apple Pay was preselected on every device, Android
  // included. Card is the default; Apple Pay is offered (and preselected) only
  // where the browser says it can actually pay with it.
  const [method, setMethod] = useState<PaymentMethod>("card");
  const [applePay, setApplePay] = useState(false);
  useEffect(() => {
    const aps = (window as unknown as { ApplePaySession?: { canMakePayments?: () => boolean } }).ApplePaySession;
    try {
      if (aps?.canMakePayments?.()) {
        setApplePay(true);
        setMethod("apple-pay");
      }
    } catch {
      /* not available: stay on card */
    }
  }, []);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bagInitials, setBagInitials] = useState("");
  useEffect(() => {
    const saved = localStorage.getItem(BAG_INITIALS_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read once after mount (SSR has no storage)
    if (saved) setBagInitials(saved);
  }, []);
  const [promoInput, setPromoInput] = useState("");
  const [promoChecking, setPromoChecking] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);
  // What Stripe said this code is worth. Display only -- the real discount
  // is applied by Stripe against the code itself, and the amount finally
  // charged is read back off the signed webhook. Nothing here moves money.
  const [promo, setPromo] = useState<{
    code: string;
    percentOff: number | null;
    amountOffAed: number | null;
  } | null>(null);



  const previewDiscount = promo ? previewDiscountAed(total, promo) : 0;
  const previewTotal = promo ? previewTotalAed(total, promo) : total;

  // ⚠️ THE BACK BUTTON FROM STRIPE RESTORES THIS PAGE FROZEN MID-SUBMIT.
  // Safari and Chrome keep the page in the back/forward cache, so a customer
  // who goes to Stripe, changes her mind and comes back found "Processing…"
  // forever and no way to pay. Founder hit it on the 2026-11-02 staging
  // rehearsal. A persisted pageshow means we are that restored copy: unfreeze.
  useEffect(() => {
    const onShow = (e: PageTransitionEvent) => {
      if (e.persisted) setSubmitting(false);
    };
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, []);

  // Signed-in customers checkout under their account email, not whatever
  // they happen to type -- orders are matched to /account by email, so
  // letting it drift would silently strand an order outside their history.
  useEffect(() => {
    if (isSignedIn && user?.primaryEmailAddress?.emailAddress) {
      setEmail(user.primaryEmailAddress.emailAddress);
    }
  }, [isSignedIn, user]);

  async function applyPromo() {
    const code = promoInput.trim();
    if (!code) return;
    setPromoChecking(true);
    setPromoError(null);
    try {
      const res = await fetch("/api/promo/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setPromo(null);
        setPromoError(data.error ?? "That code isn't valid");
        return;
      }
      setPromo({
        code: data.code,
        percentOff: data.percentOff,
        amountOffAed: data.amountOffAed,
      });
      setPromoInput("");
    } catch {
      setPromoError("Could not check that code. Please try again.");
    } finally {
      setPromoChecking(false);
    }
  }

  // Pay enables only on a plausible address: "not-a-real-address" used to
  // enable it, and the server's refusal then landed off screen.
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());

  async function handlePay() {
    setSubmitting(true);
    setError(null);
    // Fired before the network call, so a customer who abandons on Stripe's
    // hosted page is still counted as having started checkout -- that gap is
    // the number worth optimising against. Cannot throw; see lib/metaPixel.
    const icEventId = newEventId("ic");
    track("InitiateCheckout", {
      content_type: "product",
      content_ids: items.map((i) => i.slug),
      contents: items.map((i) => ({ id: i.slug, quantity: i.quantity ?? 1 })),
      num_items: units,
      ...money(promo ? previewTotal : total),
    }, icEventId);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, method, total, email, bagInitials, promotionCode: promo?.code ?? null, capi: capiHandoff(icEventId) }),
      });

      // Every failure path below used to fall through to the success page:
      // there was no res.ok check, so a 400 or 409 cleared the cart and
      // rendered "Order confirmed" for an order that was never created,
      // and an empty-body 500 threw in .json() and showed nothing at all.
      // Nothing is cleared or navigated until the server has actually
      // confirmed the order.
      let data: { ok?: boolean; error?: string; checkoutUrl?: string; emailed?: boolean } = {};
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (!res.ok || data.ok === false) {
        setError(data.error ?? "We couldn't place your order. Please try again.");
        setSubmitting(false);
        return;
      }

      if (data.checkoutUrl) {
        // Full pipeline: hand off to Stripe. Don't clear the cart here --
        // if the customer abandons at Stripe, they should still have it.
        // /order-confirmed clears it once Stripe actually redirects back.
        window.location.href = data.checkoutUrl;
        return;
      }

      // Fallback: Stripe isn't configured yet, same demo flow as before.
      window.localStorage.setItem(
        LAST_ORDER_KEY,
        JSON.stringify({ items, method, total, email, emailed: data.emailed }),
      );
      clear();
      router.push("/order-confirmed");
    } catch {
      // Network failure / offline. The cart is untouched, so retrying works.
      setError("We couldn't reach the payment service. Please check your connection and try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-8">

      {/* Discounts used to be reachable only after the redirect, on Stripe's
          page -- so someone arriving from a campaign with a code in hand saw
          the full price here and had to trust it would be honoured. */}
      {/* HIDDEN UNLESS A CODE EXISTS. Founder + marketing agent, 2026-11-11: an
          empty discount box at the moment of paying tells a full-price buyer a
          cheaper price exists and sends people to search for codes that do not
          exist (none is active in Stripe). To bring it back for an influencer or
          White Friday code: set NEXT_PUBLIC_PROMO_ENABLED=true in Amplify, ADD
          it to the build-spec env allowlist, and redeploy. */}
      {PROMO_ENABLED && (
      <div className="mb-5">
        <label htmlFor="promo-code" className="mb-2 block text-sm text-text">
          Discount code <span className="text-text-3">(optional)</span>
        </label>
        {promo ? (
          <div className="flex items-center justify-between rounded-shaklek-xs border border-accent bg-surface-2 px-3 py-2.5">
            <p className="text-sm text-text">
              <span className="font-medium">{promo.code}</span>{" "}
              <span className="text-text-2">
                {promo.percentOff != null
                  ? `${promo.percentOff}% off`
                  : `AED ${promo.amountOffAed} off`}
              </span>
            </p>
            <button
              onClick={() => {
                setPromo(null);
                setPromoError(null);
              }}
              className="text-xs text-text-3 underline hover:text-text-2"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              id="promo-code"
              value={promoInput}
              onChange={(e) => {
                setPromoInput(e.target.value);
                setPromoError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  applyPromo();
                }
              }}
              placeholder="Enter a code"
              autoComplete="off"
              autoCapitalize="characters"
              className="flex-1 rounded-shaklek-xs border border-border-strong bg-white p-3 text-sm text-text uppercase placeholder:text-text-3 placeholder:normal-case focus:border-accent focus:outline-none"
            />
            <button
              onClick={applyPromo}
              disabled={promoChecking || !promoInput.trim()}
              className="rounded-shaklek-xs border border-border-strong px-5 text-sm text-text transition-colors hover:bg-surface-2 disabled:opacity-40"
            >
              {promoChecking ? "Checking…" : "Apply"}
            </button>
          </div>
        )}
        {promoError && (
          <p role="alert" aria-live="polite" className="mt-1.5 text-xs text-red-700">
            {promoError}
          </p>
        )}
        {promo && (
          <div className="mt-3 border-t border-border pt-3 text-sm">
            <div className="flex justify-between text-text-2">
              <span>Discount</span>
              <span>&minus;AED {previewDiscount.toFixed(2)}</span>
            </div>
            <div className="mt-1 flex justify-between font-medium text-text">
              <span>New total</span>
              <span>AED {previewTotal.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>
      )}


      <label htmlFor="checkout-email" className="mb-2 block text-sm text-text">
        Your email <span className="text-text-3">(required)</span>
      </label>
      <input
        id="checkout-email"
        type="email"
        autoComplete="email"
        required
        readOnly={isSignedIn}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className={`mb-1 w-full rounded-shaklek-xs border border-border-strong p-3 text-base text-text placeholder:text-text-3 focus:border-accent focus:outline-none ${
          isSignedIn ? "bg-surface-2" : "bg-white"
        }`}
      />
      {/* Only when there is a CHOICE (shaklek-ui walk 2026-11-14: a lone
          "Card" radio on Android looked unfinished). With one method the
          state already holds it and Stripe shows its own options next. */}
      {methods.filter((m) => m.id !== "apple-pay" || applePay).length > 1 && (
      <>
      <p className="mb-3 mt-5 text-sm text-text">Payment method</p>
      <div className="space-y-2">
        {methods.filter((m) => m.id !== "apple-pay" || applePay).map((m) => (
          <button
            key={m.id}
            onClick={() => setMethod(m.id)}
            className={`flex w-full items-center justify-between rounded-shaklek-sm border px-4 py-3.5 text-left transition-colors ${
              method === m.id
                ? "border-accent bg-surface-2"
                : "border-border-strong"
            }`}
          >
            <div>
              <p className="text-sm font-medium text-text">{m.label}</p>
              {m.sub ? <p className="text-xs text-text-3">{m.sub}</p> : null}
            </div>
            <span
              className={`h-4 w-4 rounded-full border-2 ${
                method === m.id ? "border-accent bg-accent" : "border-border-strong"
              }`}
            />
          </button>
        ))}
      </div>
      </>
      )}

      {(
        <>
      {/* Founder 2026-11-14: errors sit right above Pay, on screen, not
          under the collapsed details where a refusal looked like nothing. */}
          {error && (
            <p
              role="alert"
              aria-live="assertive"
              className="mt-6 rounded-shaklek-sm border border-red-300 bg-red-50 px-4 py-3 text-center text-sm text-red-800"
            >
              {error}
            </p>
          )}
          {/* Without this the button just sits greyed out and the customer is
              left guessing. ABOVE the button and readable (shaklek-ui walk
              2026-11-14: it was 2.6:1 grey and below the fold). */}
          {!emailOk && (
            <p aria-live="polite" className="mt-6 -mb-3 text-center text-xs text-text-2">
              Enter a valid email above to continue.
            </p>
          )}
          <button
            onClick={handlePay}
            disabled={submitting || !emailOk}
            className="mt-6 flex w-full items-center justify-center rounded-full bg-accent py-4 text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {/* Follows the discount. This read the raw cart total until a
                real 99%-off payment showed the button saying "Pay AED 389"
                directly beneath a summary saying the new total was 3.89 --
                and beside an Apple Pay sheet that correctly said 3.89. The
                most prominent price on the page was the only wrong one.
                Only shows fils when discounted, so an undiscounted checkout
                still reads "Pay AED 389" rather than "389.00". */}
            {/* Follows the discount, so the most prominent price on the page
                is never the wrong one. Only shows fils when discounted, so an
                undiscounted checkout still reads "Pay AED 389". */}
            {submitting
              ? "Processing…"
              : `Pay AED ${promo ? previewTotal.toFixed(2) : total}`}
          </button>
          {/* Reassurance AT the button, founder 2026-11-14 ("il faut rassurer le
              client"): 0 of 2 ad carts reached Pay, and nothing on this screen
              said the payment was secure. */}
          <p className="mt-2 flex items-center justify-center gap-1.5 text-xs text-text-2">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="5" y="11" width="14" height="9" rx="1.5" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
            Secure payment
          </p>
        </>
      )}

      {/* Everything a customer might want to check, out of the way until they
          want it.
          It used to be four paragraphs sitting BETWEEN the email field and the
          Pay button -- a wall of small print pushing the one action on the
          page further down, on the screen where hesitation is most expensive.
          The essential line stays visible; the rest opens on demand, and all
          of it now sits below the button rather than in front of it.
          The change-of-mind rule stays in the open part: UAE consumer law lets
          a retailer decline a change-of-mind refund only where the policy is
          displayed, and something a customer must expand to find is a weak
          version of displayed. */}
      {/* ⚠️ NEGATIVE-LANGUAGE PASS, founder 2026-11-05. Was "No change-of-mind
          refunds on made-to-order pieces." The rule is still displayed here in
          the open, as the comment above requires; it now says what applies
          (final once made, one alteration for fit, faulty or wrong items
          remade or refunded) instead of what is withheld. */}
      {/* ONE line, founder 2026-11-14 ("why all that text after the payment").
          The change-of-mind rule must stay displayed (see above); faulty or
          wrong items are covered in the details below and in the terms. */}
      {/* LINK ONLY, founder 2026-11-14: no change-of-mind sentence at the
          moment of paying. The rule stays displayed BEFORE purchase on the
          product page (Product information > Returns, productDisclosure.ts)
          and behind this link -- keep both, that is what covers the UAE
          display requirement now. */}
      <p className="mt-4 text-center text-xs text-text-3">
        <a href="/legal/terms#returns" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center underline hover:text-text-2">
          Terms of purchase
        </a>
      </p>

      {/* BELOW Pay since 2026-11-14 (shaklek-ui, founder ok): these pushed
          the email and the Pay button ~300px under the fold on a phone. */}
      {/* Launch offer: the first 50 orders come in a Shaklek bag embroidered
          with the customer's initials. Prefilled from the bag preview in the top
          bar; sent with the order and saved in its notes (api/orders). */}
      <label htmlFor="bag-initials" className="mb-2 mt-6 block text-sm text-text">
        Initials for your bag <span className="text-text-3">(optional)</span>
      </label>
      <input
        id="bag-initials"
        value={bagInitials}
        onChange={(e) => {
          const v = e.target.value.replace(/[^a-z]/gi, "").toUpperCase().slice(0, 3);
          setBagInitials(v);
          if (v) localStorage.setItem(BAG_INITIALS_KEY, v);
        }}
        maxLength={3}
        autoCapitalize="characters"
        placeholder="e.g. NT"
        className="mb-5 w-full rounded-shaklek-sm border border-border-strong bg-surface px-4 py-3 text-base text-text placeholder:text-text-3 focus:border-accent focus:outline-none"
      />

      {/* Shaklek+ sits after the decision, not before it -- it must never
          compete with the Pay button. */}
      {SHAKLEK_PLUS_ON ? (
        <div className="mt-6">
          <ShaklekPlusSignup source="checkout" compact />
        </div>
      ) : null}
    </div>
  );
}

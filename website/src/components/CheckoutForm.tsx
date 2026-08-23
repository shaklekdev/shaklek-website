"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ShaklekPlusSignup from "@/components/ShaklekPlusSignup";
import { previewDiscountAed, previewTotalAed } from "@/lib/promoPreview";
import { useUser } from "@clerk/nextjs";
import { useCart } from "@/lib/CartContext";

type PaymentMethod = "apple-pay" | "card";

const methods: { id: PaymentMethod; label: string; sub: string }[] = [
  { id: "apple-pay", label: "Apple Pay", sub: "Fastest checkout" },
  { id: "card", label: "Card", sub: "Visa, Mastercard" },
];

const LAST_ORDER_KEY = "shaklek-last-order";

export default function CheckoutForm({ total }: { total: number }) {
  const router = useRouter();
  const { items, clear } = useCart();
  const { isSignedIn, user } = useUser();
  const [method, setMethod] = useState<PaymentMethod>("apple-pay");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  async function handlePay() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, method, total, email, promotionCode: promo?.code ?? null }),
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
      {!isSignedIn && (
        <div className="mb-6 rounded-shaklek-sm border border-gold/30 bg-gold/10 p-4 text-sm text-text-2">
          <Link href="/sign-in?redirect_url=/checkout" className="font-medium text-text underline">
            Sign in
          </Link>{" "}
          to save your measurements and track this order — or continue as a guest below.
        </div>
      )}

      {/* Discounts used to be reachable only after the redirect, on Stripe's
          page -- so someone arriving from a campaign with a code in hand saw
          the full price here and had to trust it would be honoured. */}
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
                  ? `— ${promo.percentOff}% off`
                  : `— AED ${promo.amountOffAed} off`}
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

      <label htmlFor="checkout-email" className="mb-2 block text-sm text-text">
        Your email <span className="text-text-3">(required)</span>
      </label>
      <input
        id="checkout-email"
        type="email"
        required
        readOnly={isSignedIn}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className={`mb-1 w-full rounded-shaklek-xs border border-border-strong p-3 text-sm text-text placeholder:text-text-3 focus:border-accent focus:outline-none ${
          isSignedIn ? "bg-surface-2" : "bg-white"
        }`}
      />
      <p className="mb-5 text-xs text-text-3">
        {isSignedIn
          ? "Using your account email so this order shows up in your history."
          : "We'll send your order confirmation here."}
      </p>
      <p className="mb-3 text-sm text-text">{isSignedIn ? "Payment method" : "Pay as guest"}</p>
      <div className="space-y-2">
        {methods.map((m) => (
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
              <p className="text-xs text-text-3">{m.sub}</p>
            </div>
            <span
              className={`h-4 w-4 rounded-full border-2 ${
                method === m.id ? "border-accent bg-accent" : "border-border-strong"
              }`}
            />
          </button>
        ))}
      </div>

      {/* These three answer the questions a customer has BEFORE pressing Pay --
          where does it ship, when does it arrive, what if it does not fit.
          Underneath the button they were reassurance nobody read until after
          they had already decided. */}
      <div className="mt-5 space-y-1 text-center text-xs text-text-3">
        <p>Delivery address and card details are taken on the next screen, secured by Stripe.</p>
        <p>Made to order · about 10 days from stylist confirmation · delivery included</p>
        <p>One free alteration or remake within 14 days</p>
      </div>

      {(
        <>
          <button
            onClick={handlePay}
            disabled={submitting || !email}
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
          {/* Without this the button just sits greyed out and the customer is
              left guessing -- the commonest reason checkout stalls here. */}
          {!email && (
            <p aria-live="polite" className="mt-2 text-center text-xs text-text-3">
              Enter your email above to continue.
            </p>
          )}
        </>
      )}
      {error && (
        <p
          role="alert"
          aria-live="assertive"
          className="mt-4 rounded-shaklek-sm border border-red-300 bg-red-50 px-4 py-3 text-center text-sm text-red-800"
        >
          {error}
        </p>
      )}
      {/* Shaklek+ sits after the decision, not before it -- it must never
          compete with the Pay button. */}
      <div className="mt-6">
        <ShaklekPlusSignup source="checkout" compact />
      </div>
    </div>
  );
}

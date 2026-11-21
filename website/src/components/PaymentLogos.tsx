// Card marks under the Pay button (founder 2026-11-21: "voir ces logos-là, ça
// rassure les gens"). Only brands Stripe actually takes on this UAE account:
// Visa and Mastercard (Stripe UAE support page, read 2026-11-21: Visa,
// Mastercard, Apple Pay, Google Pay, Link -- NO Amex). Add Amex only once the
// Dashboard shows it enabled. Do NOT add a brand here (PayPal, Tamara,
// a "certified" badge) until it is really accepted -- a logo is a promise.
// Inline SVG: no extra request, nothing to load on the slowest screen we have.

const card = "h-6 w-[38px] shrink-0 rounded-[3px] border border-[#E3DED4] bg-white";

/** Visa + Mastercard marks alone (footer, checkout). */
export function CardMarks({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-2 ${className}`} aria-label="We accept Visa and Mastercard">
      <svg viewBox="0 0 38 24" className={card} role="img" aria-label="Visa">
        <text x="19" y="16" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontSize="10.5" fontWeight="900" fontStyle="italic" fill="#1A1F71" letterSpacing="0.3">VISA</text>
      </svg>
      <svg viewBox="0 0 38 24" className={card} role="img" aria-label="Mastercard">
        <circle cx="15.5" cy="12" r="6.5" fill="#EB001B" />
        <circle cx="22.5" cy="12" r="6.5" fill="#F79E1B" />
        <path d="M19 6.52a6.5 6.5 0 0 1 0 10.96a6.5 6.5 0 0 1 0-10.96z" fill="#FF5F00" />
      </svg>
    </div>
  );
}

export default function PaymentLogos() {
  return (
    <>
      <CardMarks className="mt-3" />
      {/* Founder 2026-11-21: trust BADGES, like other shops -- not a sentence.
          Paying through Stripe Checkout/Elements keeps card data off our
          servers, which is what lets a Stripe merchant show "PCI DSS
          compliant". "Powered by Stripe" is Stripe's own badge wording. */}
      <div className="mt-2.5 flex items-center justify-center gap-2">
        <svg viewBox="0 0 92 26" className="h-[26px] w-[92px]" role="img" aria-label="PCI DSS compliant">
          <rect x="0.5" y="0.5" width="91" height="25" rx="4" fill="#fff" stroke="#1E7B3C" />
          <path d="M13 5l6 2.2v5.3c0 3.8-2.6 6.6-6 7.9c-3.4-1.3-6-4.1-6-7.9V7.2z" fill="#1E7B3C" />
          <path d="M10.2 12.6l2 2l3.6-3.8" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <text x="25" y="11.5" fontFamily="Arial, Helvetica, sans-serif" fontSize="8.6" fontWeight="900" fill="#1E7B3C" letterSpacing="0.4">PCI DSS</text>
          <text x="25" y="20.5" fontFamily="Arial, Helvetica, sans-serif" fontSize="6.8" fontWeight="700" fill="#1E7B3C" letterSpacing="0.6">COMPLIANT</text>
        </svg>
        <svg viewBox="0 0 92 26" className="h-[26px] w-[92px]" role="img" aria-label="Powered by Stripe">
          <rect x="0" y="0" width="92" height="26" rx="4" fill="#635BFF" />
          <text x="8" y="16.5" fontFamily="Arial, Helvetica, sans-serif" fontSize="7" fontWeight="600" fill="#fff">Powered by</text>
          <text x="52" y="17.5" fontFamily="Arial, Helvetica, sans-serif" fontSize="12" fontWeight="800" fill="#fff" letterSpacing="-0.4">stripe</text>
        </svg>
      </div>
    </>
  );
}

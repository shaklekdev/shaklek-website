// Card marks under the Pay button (founder 2026-11-21: "voir ces logos-là, ça
// rassure les gens"). Only brands Stripe actually takes on this UAE account:
// Visa, Mastercard, American Express. Do NOT add a brand here (PayPal, Tamara,
// a "certified" badge) until it is really accepted -- a logo is a promise.
// Inline SVG: no extra request, nothing to load on the slowest screen we have.

const card = "h-6 w-[38px] shrink-0 rounded-[3px] border border-[#E3DED4] bg-white";

export default function PaymentLogos() {
  return (
    <div className="mt-3 flex items-center justify-center gap-2" aria-label="We accept Visa, Mastercard and American Express">
      <svg viewBox="0 0 38 24" className={card} role="img" aria-label="Visa">
        <text x="19" y="16" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontSize="10.5" fontWeight="900" fontStyle="italic" fill="#1A1F71" letterSpacing="0.3">VISA</text>
      </svg>
      <svg viewBox="0 0 38 24" className={card} role="img" aria-label="Mastercard">
        <circle cx="15.5" cy="12" r="6.5" fill="#EB001B" />
        <circle cx="22.5" cy="12" r="6.5" fill="#F79E1B" />
        <path d="M19 6.52a6.5 6.5 0 0 1 0 10.96a6.5 6.5 0 0 1 0-10.96z" fill="#FF5F00" />
      </svg>
      <svg viewBox="0 0 38 24" className={card} role="img" aria-label="American Express">
        <rect x="1" y="1" width="36" height="22" rx="2" fill="#1F72CD" />
        <text x="19" y="15.5" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontSize="8.5" fontWeight="900" fill="#fff" letterSpacing="0.4">AMEX</text>
      </svg>
    </div>
  );
}

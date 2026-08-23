// What the checkout page shows once a code is applied, before the redirect.
//
// Advisory only. Stripe recomputes the real figure against the coupon, and
// the amount actually collected is read back off the signed webhook -- if
// this and Stripe ever disagree, Stripe wins and the order records Stripe's
// number. It still has to be right: a preview that overstates the discount
// is a promise the checkout page cannot keep.
export type PromoPreview = { percentOff: number | null; amountOffAed: number | null };

export function previewDiscountAed(total: number, promo: PromoPreview): number {
  if (!Number.isFinite(total) || total <= 0) return 0;

  if (promo.percentOff != null) {
    // Round to fils the way the eventual charge is, rather than letting a
    // float tail render as "AED 386.09999999999997".
    return Math.round(total * promo.percentOff) / 100;
  }

  // A fixed-amount coupon larger than the basket discounts the basket, not
  // more -- Stripe floors the charge at zero and so must the preview.
  if (promo.amountOffAed != null) {
    return Math.min(Math.max(0, promo.amountOffAed), total);
  }

  return 0;
}

export function previewTotalAed(total: number, promo: PromoPreview): number {
  // Rounded to fils rather than left as a raw subtraction: 390 - 386.10 lands
  // on 3.8999999999999773 in binary floating point. It happens to render as
  // "3.90" through toFixed today, but a value that is only correct because of
  // how it is currently displayed is a trap for the next caller.
  return Math.max(0, Math.round((total - previewDiscountAed(total, promo)) * 100) / 100);
}

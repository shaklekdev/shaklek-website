/**
 * The one order reference, derived one way, for everybody.
 *
 * ⚠️ FOUR PLACES USED TO DERIVE THIS SEPARATELY AND THE CUSTOMER SAW NONE OF
 * THEM. The founder's assumption, 2026-08-28: "me, the tailor and the customer
 * all have the same ORDER ID". The first two did. The third did not have one at
 * all -- not in her confirmation email, not on /order-confirmed, not in
 * /account, which listed her orders by date, status and total. So a customer
 * asked to quote her order number had nothing to quote, and every conversation
 * about a specific piece started by describing it.
 *
 * The dashboard also printed "SHK-A7F3C210" while the tailor's document printed
 * "A7F3C210", which is the same reference in two costumes.
 *
 * So: one function, one format, and every surface calls it. If this ever needs
 * to change, it changes here and the four surfaces cannot disagree.
 *
 * ⚠️ NO "SHK-" PREFIX, AND THAT IS NOT A STYLE CHOICE. The tech pack carries no
 * brand name anywhere by design -- techPack.ts pins even the PDF metadata blank
 * -- and its own test suite fails the build on a leak. The first version of
 * this returned "SHK-A7F3C210" and tripped exactly that: "brand name leaked
 * into the tech pack". Since the tailor's copy cannot carry the prefix, nobody
 * carries it, and all four surfaces quote a string that is character for
 * character the same. Each surface labels it in its own words instead.
 *
 * WHY THE FIRST EIGHT CHARACTERS of a uuid: short enough to read down a phone,
 * say out loud and write on a parcel, and 32 bits is far beyond guessing at
 * this volume. It is NOT a secret -- it identifies an order, it does not
 * authorize anything. /api/orders/:id checks ownership separately, and it must
 * keep doing so.
 */
export function orderRef(id: string): string {
  return id.slice(0, 8).toUpperCase();
}

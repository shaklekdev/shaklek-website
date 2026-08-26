/**
 * Which fabrics Shaklek can actually make a garment from today.
 *
 * WHY THIS EXISTS AS DATA AND NOT AS TWO BUTTONS IN A COMPONENT: the site
 * offered "Linen" and "Organic cotton" as an even choice while there was no
 * organic cotton supplier at all -- it is an online-only order with a two-week
 * ETA (founder, 2026-08-26). Every customer who picked it would have been sold
 * a fabric that could not be cut, and the fabric reaches the tailor's tech
 * pack, so the order would have gone out wrong rather than merely looking
 * wrong.
 *
 * LINEN IS THE MVP FABRIC, and the reason is not preference: all catalog
 * photography was generated in linen. Selling cotton against a linen
 * photograph is the same defect in the other direction.
 *
 * ON HOLD UNTIL FRIDAY 2026-08-28 (founder, 2026-08-26). She has the real
 * in-store fabric quotes and the per-design metre counts coming that day.
 * Until then **nothing here changes and no price moves**: the second fabric
 * stays switched off rather than deleted, so restoring it is one flag, and
 * `surchargeAed` stays 0 everywhere.
 *
 * Her stated plan for Friday, recorded so it is not re-derived from memory:
 * if she finds both fabrics she can actually buy, **cotton keeps today's
 * displayed prices and linen goes to +49 AED per piece**.
 *
 * ⚠️ THAT IS A PRICE RISE, NOT A SURCHARGE, AND THE DIFFERENCE MATTERS.
 * Linen is the only sellable fabric today, so every price in catalog.ts is
 * already a linen price. "+49 for linen" with one fabric on sale means moving
 * the base prices in `catalog.ts` -- 389 -> 438 and so on -- with
 * `surchargeAed` left at 0. Building surcharge machinery for a
 * single-fabric catalogue adds a money path that nothing needs yet, and money
 * paths are where this project has been bitten before. See
 * planning/pricing-todo.md, rebuilt 2026-08-26 on the real quotes.
 *
 * `surchargeAed` earns its keep only once a SECOND fabric is sellable. Note
 * that at the quoted 20 AED/m organic cotton lands *cheaper* per metre than
 * in-store linen, so it would sit BELOW linen as an entry option, not above it
 * as a supplement.
 *
 * TO BRING A FABRIC BACK (Friday, or later): flip `available` to true. If it
 * carries a different price, the price must be computed server-side in
 * `src/lib/pricing.ts` from the resolved fabric -- never read from the request
 * body, the same rule that already governs `price` and `quantity`. The
 * customizer's toggle re-appears on its own: FabricColorPicker renders the
 * two-button control whenever more than one fabric is available.
 */
// The fabric vocabulary itself lives here rather than in designSpec.ts, so
// that this module can be imported by designSpec without a cycle.
export type Fabric = "cotton" | "linen";

export type FabricOption = {
  id: Fabric;
  label: string;
  available: boolean;
  surchargeAed: number;
  note?: string;
};

export const FABRIC_OPTIONS: FabricOption[] = [
  {
    id: "linen",
    label: "100% linen",
    available: true,
    // Stays 0. Today's catalog prices ARE the linen prices. Friday's "+49"
    // is a change to catalog.ts, not a number that belongs here -- see the
    // price-rise-not-surcharge note above.
    surchargeAed: 0,
  },
  {
    // KEPT ON PURPOSE, SWITCHED OFF. The founder asked for the cotton option
    // to be held rather than deleted while the supplier and the real prices
    // are settled (2026-08-26, revisit Friday 2026-08-28). Deleting it would
    // mean rebuilding the entry, the picker branch and the server guard from
    // scratch; `available: false` is the whole hold, and flipping it is the
    // whole restore.
    id: "cotton",
    label: "Organic cotton",
    available: false,
    surchargeAed: 0,
    note: "coming soon",
  },
];

export const DEFAULT_FABRIC: Fabric = "linen";

export const SELLABLE_FABRICS: FabricOption[] = FABRIC_OPTIONS.filter(
  (f) => f.available,
);

export function isSellableFabric(value: unknown): value is Fabric {
  return SELLABLE_FABRICS.some((f) => f.id === value);
}

// Server-side resolution, same rule as src/lib/pricing.ts: what the request
// body says a garment is made of is a suggestion, not a fact. An order that
// named a fabric we cannot buy would reach the tailor's tech pack and be cut
// -- or not cut -- against it. Anything unsellable collapses to the default
// rather than being rejected, because the customer never had a way to choose
// it in the UI and refusing their order over it helps nobody.
export function resolveFabric(value: unknown): Fabric {
  return isSellableFabric(value) ? value : DEFAULT_FABRIC;
}

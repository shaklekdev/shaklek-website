import { disclosuresFor } from "@/data/productDisclosure";

/**
 * The legally required consumer information, on the product page.
 *
 * Collapsed, like the size chart and Make it your way, because it is
 * information a customer needs available rather than information they need
 * pushed at them. The law requires it to be provided, not to be unavoidable.
 *
 * Arabic is rendered alongside English, not instead of it: Federal Law 15/2020
 * requires the Arabic and permits other languages beside it. `dir="rtl"` and
 * `lang="ar"` are on the Arabic side so a screen reader announces it in the
 * right language and the browser lays it out correctly -- without those it is
 * Arabic characters in a left-to-right box, which is worse than nothing on a
 * line that exists to be legally sufficient.
 *
 * Every row has a value; see data/productDisclosure.ts for which
 * Arabic strings the founder has verified and which are still drafts.
 */
export default function ProductDisclosure({
  garmentName,
}: {
  garmentName: string;
}) {
  const rows = disclosuresFor(garmentName);

  return (
    /* BELOW lg THIS IS THE SECOND ROW OF ONE ACCORDION with "All included in
       the price" above it (founder 2026-11-20, on her phone: the two boxes
       and the Arabic "sits misaligned under the English"). So there:
       - -mt-px: the two hairlines overlap into one shared rule;
       - the row is the same 44px, 13px, px-4 as the one above;
       - the Arabic is on the SAME line, against the right edge before the +,
         exactly where every row inside this panel already puts its Arabic
         label. It was a second line under the English, and dir="rtl" on a
         shrink-wrapped block right-aligned it to the English word's width,
         which is the "misaligned" she saw.
       From lg nothing changed: stacked, mt-3. */
    <details className="group -mt-px border border-border-strong lg:mt-3">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 marker:hidden [&::-webkit-details-marker]:hidden">
        <span className="max-lg:flex max-lg:min-w-0 max-lg:flex-1 max-lg:items-baseline max-lg:justify-between max-lg:gap-3">
          <span className="block text-[13px] text-text">
            Product information
          </span>
          <span
            dir="rtl"
            lang="ar"
            className="font-arabic mt-0.5 block text-[12px] text-text-3 max-lg:mt-0 max-lg:shrink-0"
          >
            معلومات المنتج
          </span>
        </span>
        <span
          aria-hidden="true"
          className="shrink-0 text-lg leading-none text-text-3 group-open:hidden"
        >
          +
        </span>
        <span
          aria-hidden="true"
          className="hidden shrink-0 text-lg leading-none text-text-3 group-open:block"
        >
          &minus;
        </span>
      </summary>

      <dl className="divide-y divide-border border-t border-border">
        {rows.map((r) => (
          <div key={r.label} className="px-4 py-3">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <dt className="text-[11px] tracking-wide text-text-3 uppercase">
                {r.label}
              </dt>
              <dt
                dir="rtl"
                lang="ar"
                className="font-arabic text-[12px] text-text-3"
              >
                {r.labelAr}
              </dt>
            </div>
            <dd className="mt-1 text-[13px] leading-relaxed text-text-2">
              {r.value}
            </dd>
            <dd
              dir="rtl"
              lang="ar"
              className="font-arabic mt-1 text-[13px] leading-relaxed text-text-2"
            >
              {r.valueAr}
            </dd>
          </div>
        ))}
      </dl>
    </details>
  );
}

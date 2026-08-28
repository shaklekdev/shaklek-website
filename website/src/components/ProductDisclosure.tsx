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
    <details className="group mt-3 border border-border-strong">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 marker:hidden">
        <span>
          <span className="block text-[13px] text-text">
            Product information
          </span>
          <span
            dir="rtl"
            lang="ar"
            className="font-arabic mt-0.5 block text-[12px] text-text-3"
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

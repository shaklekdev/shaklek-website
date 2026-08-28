/**
 * The consumer information UAE law requires to be shown with a product online.
 *
 * ⚠️ THIS IS A LEGAL LINE, NOT COPY.
 *
 * Federal Law 15/2020 Art. 26 requires consumer information to be given in
 * Arabic; other languages may sit alongside it, not replace it. Art. 30 puts
 * the penalty at AED 3,000-200,000. Cabinet Resolution 66/2023 Art. 40 lists
 * what an e-commerce page must actually carry, and this file exists to cover
 * that list rather than a guess at it:
 *
 *   - producer/importer name, address and trademark
 *   - name, type, nature, components and amount of the goods
 *   - components and standards in the ORIGINAL LANGUAGE IN ADDITION TO Arabic
 *   - country of origin, in the form "Made in ..."
 *   - warnings
 *   - terms and conditions of return or exchange
 *
 * ⚠️ THE ARABIC HERE IS FOUNDER-VERIFIED. She read the fibre, care and origin
 * strings on the care-label proof on 2026-08-28 and approved them. Do not
 * "improve" them, and do not invent new Arabic without her reading it: nobody
 * on this side can check Arabic typesetting the way a measurement is checked.
 *
 * ⚠️ MIXED ARABIC AND DIGITS NEEDS dir="rtl" ON THE ELEMENT. On the PDF label
 * "كتان 100%" printed as "%001" with the digits reversed, because that shaper
 * does not apply the bidirectional algorithm. Browsers do -- but only inside an
 * element carrying dir and lang. Without them a mixed string in an LTR box
 * reorders into a plausible-looking WRONG NUMBER. ProductDisclosure sets both.
 * Verify by reading the rendered page, never the source.
 *
 * NOT DONE, DELIBERATELY: the Art. 40 conformity badge. The founder's position,
 * 2026-08-28, is that Cabinet Resolution 54/2019 Art. 2(2)(b) exempts her,
 * since she sends orders to a tailor who is not her employee. Recorded with its
 * consequences in branding/packaging.md. That is a lawyer's call, not this
 * file's.
 *
 * CARE IS DRY CLEAN ONLY: founder's decision, taken twice and held. The
 * residual risk is accepted, not solved -- unwashed linen shrinks 4-10%, and we
 * promise a free remake if the fit is wrong. Recorded, closed, do not reopen.
 *
 * ⚠️ NO PRE-SHRINK WARNING ON THIS PAGE, AND DO NOT ADD ONE BACK. A row saying
 * "the linen is not pre-shrunk, washing will change the fit" shipped briefly
 * and the founder cut it: nobody outside the trade knows what pre-shrinking is,
 * dry-clean is unremarkable on linen and a dozen other fabrics, and explaining
 * a risk nobody was worried about reads as a defect disclosure at the moment
 * someone is deciding to trust you. She is right, and the cost of the sentence
 * is measured in lost orders, not in law -- Art. 40 asks for warnings where
 * there are warnings to give, and "dry clean only" is the instruction.
 *
 * The consequence is still WRITTEN DOWN, in src/app/legal/terms/page.tsx,
 * which is where the returns position belongs and where it protects us if
 * someone washes a garment and asks for a remake.
 */
export type Disclosure = {
  label: string;
  labelAr: string;
  value: string;
  valueAr: string;
};

// From the trade licence, via src/app/legal/terms/page.tsx.
const ENTITY = "Shaklek For Online Selling";
const ENTITY_AR = "شكلك للبيع عبر الإنترنت";
const LICENCE = "1645657";

export function disclosuresFor(garmentName: string): Disclosure[] {
  return [
    {
      // ⚠️ ARABIC NOT YET READ BY THE FOUNDER. Her approval covers the
      // composition, care and origin strings only. Do not treat this as
      // verified until she has read it.
      label: "Product",
      labelAr: "المنتج",
      value: `${garmentName} — made-to-order garment`,
      valueAr: `${garmentName} — ملابس تُصنع حسب الطلب`,
    },
    {
      // Art. 40 wants components in the original language IN ADDITION to
      // Arabic, which is why the English is not a courtesy here.
      // ✅ FOUNDER-VERIFIED on the printed proof, 2026-08-28.
      label: "Composition",
      labelAr: "المكونات",
      value: "100% linen",
      valueAr: "كتان 100%",
    },
    {
      // Art. 40 asks for the words "Made in".
      // ✅ FOUNDER-VERIFIED on the printed proof, 2026-08-28.
      label: "Country of origin",
      labelAr: "بلد المنشأ",
      value: "Made in the United Arab Emirates",
      valueAr: "صنع في الإمارات",
    },
    {
      label: "Care",
      labelAr: "العناية",
      // ✅ FOUNDER-VERIFIED on the printed proof, 2026-08-28. Exactly this
      // string, unextended -- adding a second sentence would put unapproved
      // Arabic inside an approved row.
      value: "Dry clean only",
      valueAr: "تنظيف جاف فقط",
    },
    {
      // ⚠️ ARABIC NOT YET READ BY THE FOUNDER. Her approval covers the
      // composition, care and origin strings only. Do not treat this as
      // verified until she has read it.
      label: "Returns and exchange",
      labelAr: "الإرجاع والاستبدال",
      value:
        "One free alteration or remake within 14 days of delivery if the fit is not right.",
      valueAr:
        "تعديل واحد مجاني أو إعادة تصنيع خلال 14 يوماً من التسليم إذا لم يكن المقاس مناسباً.",
    },
    {
      // ⚠️ ARABIC NOT YET READ BY THE FOUNDER. Her approval covers the
      // composition, care and origin strings only. Do not treat this as
      // verified until she has read it.
      label: "Sold by",
      labelAr: "البائع",
      value: `${ENTITY}, sole establishment, Dubai, United Arab Emirates. Commercial licence ${LICENCE}. hello@shaklek.com`,
      valueAr: `${ENTITY_AR}، مؤسسة فردية، دبي، الإمارات العربية المتحدة. رخصة تجارية ${LICENCE}. hello@shaklek.com`,
    },
  ];
}

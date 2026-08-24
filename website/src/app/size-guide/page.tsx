import LegalPage from "@/components/LegalPage";
import Link from "next/link";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { SIZE_CHART } from "@/data/sizeChart";

export const metadata: Metadata = pageMetadata({
  title: "Size Guide",
  description:
    "Body measurements in centimetres for Shaklek sizes XS to XXL, with UK and EU equivalents, and how to measure yourself.",
  path: "/size-guide",
});

// The chart already lives inside the Step 3 selector, which is the right place
// to decide. This page exists because a size guide is also something people
// look for from a footer, a search engine, or a link sent to a friend --
// exactly the way every other clothing shop publishes one. Same SIZE_CHART
// data, so the two can never disagree.
export default function SizeGuidePage() {
  return (
    <LegalPage
      title="Size Guide"
      intro="Body measurements, in centimetres, not the finished garment."
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[460px] text-left text-sm">
          <caption className="sr-only">
            Body measurements in centimetres for each Shaklek size
          </caption>
          <thead>
            <tr className="text-xs tracking-wide text-text-3 uppercase">
              <th scope="col" className="py-2 pr-4 font-normal">Size</th>
              <th scope="col" className="py-2 pr-4 font-normal">UK</th>
              <th scope="col" className="py-2 pr-4 font-normal">EU</th>
              <th scope="col" className="py-2 pr-4 font-normal">Bust</th>
              <th scope="col" className="py-2 pr-4 font-normal">Waist</th>
              <th scope="col" className="py-2 font-normal">Hip</th>
            </tr>
          </thead>
          <tbody>
            {SIZE_CHART.map((row) => (
              <tr key={row.size} className="border-t border-border">
                <th scope="row" className="py-2.5 pr-4 font-medium text-text">
                  {row.size}
                </th>
                <td className="py-2.5 pr-4">{row.uk}</td>
                <td className="py-2.5 pr-4">{row.eu}</td>
                <td className="py-2.5 pr-4">{row.bust}</td>
                <td className="py-2.5 pr-4">{row.waist}</td>
                <td className="py-2.5">{row.hip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="pt-2 text-base font-medium text-text">How to measure</h2>
      <p>
        Measure your body, not a garment you already own, and keep the tape
        level and snug without pulling it tight. It is easier over light
        clothing than over none.
      </p>
      <p>
        <strong>Bust</strong>: around the fullest part, tape level under the
        arms. <strong>Waist</strong>: the narrowest part of your torso, usually
        just above the navel. <strong>Hip</strong>: around the fullest part,
        roughly 20cm below the waist.
      </p>

      <h2 className="pt-2 text-base font-medium text-text">
        Between two sizes?
      </h2>
      <p>
        Then a standard size is the wrong tool. Choose <strong>Tailored</strong>{" "}
        when you order and send your own numbers instead. It costs exactly the
        same, and it is the reason made-to-order exists. Most people are between
        sizes somewhere; a size chart is an average of thousands of bodies and
        exact for almost none of them.
      </p>
      <p>
        Either way you get one free alteration or remake within 14 days of
        delivery if the fit is not right. Start with a piece from the{" "}
        <Link href="/" className="underline">
          catalogue
        </Link>
        .
      </p>

      <p className="border border-border-strong bg-surface p-3 text-xs text-text-3">
        These are consolidated from published UAE-market body-measurement charts
        and are a guide, not a promise about a specific garment. If you want
        certainty, send your measurements.
      </p>
    </LegalPage>
  );
}

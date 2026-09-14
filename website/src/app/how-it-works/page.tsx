import Header from "@/components/Header";
import Link from "next/link";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { STEPS, STEPS_NOTE_FULL, OUTCOME } from "@/data/homeContent";

export const metadata: Metadata = pageMetadata({
  title: "How it works",
  description:
    // ⚠️ "10 WORKING DAYS", NEVER "10 DAYS". Every page said the latter, which
    // is a week and a half; she said WORKING, which is two calendar weeks. And
    // it is hedged on purpose: "strive to" and "approximately" is an aspiration,
    // matching what the terms page already says, "an estimate and not a
    // guarantee". A flat promise is what copy-rules.mjs still blocks.
    "Pick a piece, change the cut and colour and watch the photo change, then a tailor makes that exact piece to your size. We strive to have it ready in approximately 10 working days.",
  path: "/how-it-works",
});

// ⚠️ THE STEPS ARE NOT DEFINED HERE, AND MUST NOT BE. They are the homepage's,
// in src/data/homeContent.ts, rendered in both places.
//
// This page kept its own copy and the two drifted: three steps on the homepage,
// five here, saying different things, and the five contradicted the measuring
// visit by asking the customer for a size in step 04. Founder, 2026-09-14: "it
// needs to stay consistent with the home page", and on the five-step version,
// "this doesn't make sense anymore".
//
// Edit homeContent.ts and both pages move together.

const promises = [
  { k: "From AED 449", v: "One price per piece type. Fabric and every option included." },
  { k: "Nothing on a shelf", v: "Your piece does not exist until you ask for it. No overproduction, no waste." },
  { k: "Natural fibre only", v: "100% linen against your skin. Breathable, never synthetic." },
];

export default function HowItWorksPage() {
  return (
    <div className="flex flex-1 flex-col bg-bg">
      <Header />
      <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-14">
        <h1 className="text-[26px] text-text">How Shaklek works</h1>
        <p className="subtitle max-w-md">
          You change it, you see it, then one tailor makes that exact piece for
          your body.
        </p>

        <div className="mt-10 space-y-8">
          {STEPS.map((s) => (
            <div key={s.n} className="flex gap-5">
              <span className="font-display text-lg text-gold">{s.n}</span>
              <div>
                <h2 className="text-[15px] font-medium text-text">{s.title}</h2>
                <p className="mt-1 text-sm text-text-2">{s.body}</p>
                {/* The longer page earns its existence by saying more than the
                    homepage does, not by repeating it. */}
                {"more" in s && s.more ? (
                  <p className="mt-2 text-sm leading-relaxed text-text-3">{s.more}</p>
                ) : null}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-6 text-[12px] leading-relaxed text-text-3">{STEPS_NOTE_FULL}</p>

        {/* Where she stops and we start, worded exactly as the homepage words
            it. The steps above are things she does; this is everything else. */}
        <div className="mt-10 border-t border-border pt-8">
          <h2 className="font-display text-[18px] leading-snug text-text">{OUTCOME.title}</h2>
          <p className="mt-2 text-sm text-text-2">{OUTCOME.body}</p>
        </div>

        <div className="mt-12 border-t border-border pt-10">
          <dl className="space-y-5">
            {promises.map((p) => (
              <div key={p.k}>
                <dt className="text-[15px] font-medium text-text">{p.k}</dt>
                <dd className="mt-1 text-sm text-text-2">{p.v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <Link
          href="/catalog"
          className="mt-10 inline-block rounded-full bg-accent px-6 py-3 text-sm text-white"
        >
          Start with a piece
        </Link>
      </div>
    </div>
  );
}

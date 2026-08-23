import Header from "@/components/Header";
import Link from "next/link";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "How it works",
  description:
    "Pick a piece, change the cut and colour and watch the photo change, then a tailor makes that exact piece to your size. From AED 389, made in about 10 days across the UAE.",
  path: "/how-it-works",
});

// Kept strictly to what actually ships. The previous version advertised
// customising pockets and closure -- both real sliders, but both locked
// behind Shaklek+, so the page was promising things a customer could not do.
const steps = [
  {
    n: "01",
    title: "Pick a piece",
    body: "Eight essentials in linen or organic cotton. Shirts and trousers, cut to last past a season.",
  },
  {
    n: "02",
    title: "Change it, and watch it change",
    body: "Sleeve or leg, short or long, cropped or full — in ivory, white, navy or burgundy. Every combination is a real photograph, front and back. Not a swatch, not an illustration: the actual piece you will receive.",
  },
  {
    n: "03",
    title: "Add a detail",
    // "Ask for anything else" invited requests a solo tailor cannot take, and
    // every one of those costs a stylist round-trip to decline. Framed as a
    // detail to focus on, the answer is usually yes.
    body: "Anything you would like us to focus on while your piece is made — a wider collar, a shorter sleeve. Tell us in your own words and a stylist confirms what is possible before anything is cut.",
  },
  {
    n: "04",
    title: "Your size, or your measurements",
    body: "Pick XS–XXL, or give us your own numbers and it is cut to those. Same price either way — tailoring is never an upgrade here.",
  },
  {
    n: "05",
    title: "A tailor makes it",
    body: "One person, one piece, nothing made before you order it. About 10 days from order to your door.",
  },
];

const promises = [
  { k: "From AED 389", v: "One price per piece type. Fabric and every option included." },
  { k: "Nothing on a shelf", v: "Your piece does not exist until you ask for it. No overproduction, no waste." },
  { k: "Cotton and linen only", v: "Breathable natural fabric against your skin. Never synthetic." },
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
          {steps.map((s) => (
            <div key={s.n} className="flex gap-5">
              <span className="font-display text-lg text-gold">{s.n}</span>
              <div>
                <h2 className="text-[15px] font-medium text-text">{s.title}</h2>
                <p className="mt-1 text-sm text-text-2">{s.body}</p>
              </div>
            </div>
          ))}
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
          href="/"
          className="mt-10 inline-block rounded-full bg-accent px-6 py-3 text-sm text-white"
        >
          Start with a piece
        </Link>
      </div>
    </div>
  );
}

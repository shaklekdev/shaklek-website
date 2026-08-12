import Header from "@/components/Header";
import Link from "next/link";

const materials = [
  {
    name: "Cotton",
    body: "Gentle on skin, breathable, and durable enough to hold its shape wash after wash. It's the fabric most people already reach for without thinking — we just make sure it's cut for you specifically, not a size chart.",
  },
  {
    name: "Linen",
    body: "Made from the flax plant, naturally cooling and moisture-wicking — built for exactly the kind of heat the UAE actually has. It softens the more you wear it, so it looks better a year in than it did on day one.",
  },
];

export default function OurStoryPage() {
  return (
    <div className="flex flex-1 flex-col bg-bg">
      <Header />
      <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-14">
        <h1 className="text-[26px] text-text">Our story</h1>
        <p className="subtitle max-w-md">
          We started with a simple frustration: the shirt that looks perfect
          online never quite works on your body. The color that&apos;s
          &ldquo;universally flattering&rdquo; washes you out. The size chart
          that lies.
        </p>
        <p className="subtitle mt-4 max-w-md">
          Shaklek is fashion that sees you — your shape, your tones, your
          taste. Every piece is designed around who you are, then crafted by
          a real artisan here in the UAE. Not a factory line, not a
          size-medium guess.
        </p>

        <h2 className="mt-12 text-[19px] text-text">Why these materials</h2>
        <p className="subtitle max-w-md">
          We keep the fabric choice deliberately narrow — cotton or linen,
          nothing else — because a single, honest material is what lets one
          tailor actually make your piece well, instead of juggling linings
          and blends a small workshop can&apos;t consistently get right.
        </p>

        <div className="mt-8 space-y-8">
          {materials.map((m) => (
            <div key={m.name} className="border-t border-border pt-6">
              <h3 className="font-display text-lg text-gold">Why {m.name}?</h3>
              <p className="mt-2 text-sm text-text-2">{m.body}</p>
            </div>
          ))}
        </div>

        <Link
          href="/"
          className="mt-12 inline-block rounded-full bg-accent px-6 py-3 text-sm text-white"
        >
          Start designing
        </Link>
      </div>
    </div>
  );
}

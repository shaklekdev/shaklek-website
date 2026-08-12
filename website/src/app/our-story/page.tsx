import Header from "@/components/Header";
import Link from "next/link";

const choices = [
  {
    label: "Design",
    body: "Pick from designs our tailors already know how to make — or bring your own reference. Nothing here is a guess at what a factory thinks will sell.",
  },
  {
    label: "Material",
    body: "Cotton or linen — whichever your skin actually loves. Nothing synthetic, nothing that traps heat.",
  },
  {
    label: "Color",
    body: "The shade that makes you shine, not the one that happened to be in stock this season.",
  },
  {
    label: "Shape",
    body: "Cut to flatter your body, not the other way around — standard sizing or made to your exact measurements.",
  },
];

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
        <p className="text-xs tracking-wide text-text-3 uppercase">Our story</p>
        <p className="subtitle mt-2 max-w-md">
          Trendy, or good for your skin. Beautifully made, or actually
          affordable. Fashion rarely lets you have more than one of those at
          once — so most people just pick one and live with the rest.
        </p>

        <h1 className="mt-8 text-[28px] leading-tight text-text">
          You don&apos;t fit fashion.
          <br />
          Fashion fits you.
        </h1>

        <p className="subtitle mt-4 max-w-md">
          Shaklek exists so trend-relevant clothing doesn&apos;t have to cost
          you your skin, your budget, or your actual shape. Every piece is
          made to order, in natural fabric, at a fixed price you know upfront
          — accessible, not a luxury exception.
        </p>

        <div className="mt-10 grid grid-cols-2 gap-6">
          {choices.map((c) => (
            <div key={c.label}>
              <h2 className="font-display text-lg text-gold">Choose your {c.label.toLowerCase()}</h2>
              <p className="mt-1 text-sm text-text-2">{c.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-border pt-6">
          <p className="subtitle max-w-md">
            We built the AI and the fit tools to make those four choices
            real, not to be the headline. Your avatar shows the color that
            actually matches your skin tone before you commit. Your tailor
            builds to the shape and details you asked for — not an
            approximation of them.
          </p>
        </div>

        <h2 className="mt-12 text-[19px] text-text">Why these materials</h2>
        <p className="subtitle max-w-md">
          We keep the fabric choice deliberately narrow — cotton or linen,
          nothing else — because a single, honest material is what lets one
          tailor make your piece well, and what keeps it gentle on your skin
          and light on the planet it came from.
        </p>

        <div className="mt-8 space-y-8">
          {materials.map((m) => (
            <div key={m.name} className="border-t border-border pt-6">
              <h3 className="font-display text-lg text-gold">Why {m.name}?</h3>
              <p className="mt-2 text-sm text-text-2">{m.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-shaklek-sm border border-gold/30 bg-gold/10 p-5">
          <p className="text-sm text-text">
            <strong>From AED 290, fixed.</strong> No membership, no markup
            for customizing it your way — accessible was the point, not an
            afterthought.
          </p>
        </div>

        <Link
          href="/"
          className="mt-10 inline-block rounded-full bg-accent px-6 py-3 text-sm text-white"
        >
          Start designing
        </Link>
      </div>
    </div>
  );
}

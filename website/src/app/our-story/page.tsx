import Header from "@/components/Header";
import Link from "next/link";

const materials = [
  {
    name: "Cotton",
    body: "Gentle, breathable, holds its shape wash after wash.",
  },
  {
    name: "Linen",
    body: "Naturally cooling, softens beautifully — built for this climate.",
  },
];

export default function OurStoryPage() {
  return (
    <div className="flex flex-1 flex-col bg-bg">
      <Header />
      <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-14">
        <p className="text-xs tracking-wide text-text-3 uppercase">Our story</p>

        <h1 className="mt-3 text-[28px] leading-tight text-text">
          Shaklek means &ldquo;your shape.&rdquo; That&apos;s the whole idea.
        </h1>

        <p className="subtitle mt-4 max-w-md">
          Trendy fashion usually costs you something — your skin, your
          budget, or your actual shape. We built Shaklek so it doesn&apos;t
          have to. Your material, your color, your fit: everything here is
          yours to decide, not ours to guess at. Your skin matters to us.
          Your shape matters. Your uniqueness is the point, not a problem to
          work around.
        </p>

        <p className="subtitle mt-4 max-w-md">
          Our AI helps you get the color and fit right for your tone and
          shape before you commit to anything. Then a real tailor makes
          exactly what you chose.
        </p>

        <div className="mt-8 flex gap-8 border-t border-border pt-6">
          {materials.map((m) => (
            <div key={m.name}>
              <h2 className="font-display text-base text-gold">{m.name}</h2>
              <p className="mt-1 text-sm text-text-2">{m.body}</p>
            </div>
          ))}
        </div>

        <p className="mt-8 text-sm text-text">
          <strong>From AED 290, fixed.</strong> Accessible by design, not an
          afterthought.
        </p>

        <Link
          href="/"
          className="mt-8 inline-block rounded-full bg-accent px-6 py-3 text-sm text-white"
        >
          Start designing
        </Link>
      </div>
    </div>
  );
}

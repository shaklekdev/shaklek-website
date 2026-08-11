import Header from "@/components/Header";
import Link from "next/link";

const steps = [
  {
    n: "01",
    title: "Start with an idea",
    body: "Pick a piece from our catalog, or upload a photo or sketch of something you already have in mind — even a look you saw somewhere else.",
  },
  {
    n: "02",
    title: "Make it yours",
    body: "Try a Quick Customize variation with one tap, or tell us exactly what you'd like changed — sleeve length, fit, color, details. A stylist reviews every request personally.",
  },
  {
    n: "03",
    title: "Choose cotton or linen",
    body: "Every piece is made in real cotton or linen — no synthetics. Pick your size, or use the optional camera measurement for a more precise fit.",
  },
  {
    n: "04",
    title: "A real tailor makes it",
    body: "Your piece is cut and sewn by a tailor, not a factory line. About 7 days from order to delivery.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="flex flex-1 flex-col bg-bg">
      <Header />
      <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-14">
        <h1 className="text-[26px] text-text">How Shaklek works</h1>
        <p className="subtitle max-w-md">
          Your look, your way — made by a real person, not a factory.
        </p>

        <div className="mt-10 space-y-8">
          {steps.map((s) => (
            <div key={s.n} className="flex gap-5">
              <span className="font-display text-lg text-gold">{s.n}</span>
              <div>
                <h2 className="text-[15px] font-medium text-text">
                  {s.title}
                </h2>
                <p className="mt-1 text-sm text-text-2">{s.body}</p>
              </div>
            </div>
          ))}
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

import type { Metadata } from "next";
import Link from "next/link";

// Where /api/waitlist/confirm lands someone after the click.
//
// ⚠️ REACHABLE WHILE THE SHOP IS SHUT, via OPEN_WHILE_SHUT in src/proxy.ts.
// Without that entry it would rewrite to /coming-soon and everyone who
// confirmed would be told to sign up again, which reads as a broken form.
//
// noindex: it is the end of a private link, it has no standalone value, and it
// would compete with the pre-launch page for the same thin content.
// ⚠️ NO BRAND NAME HERE. app/layout.tsx sets `template: "%s · Shaklek"`,
// so a title of "Shaklek" rendered as "Shaklek · Shaklek" in the tab. Found
// on 2026-09-16 by crawling every route and reading the titles back.
// Both outcomes this page renders -- confirmed, and expired-link -- are true of
// "Waitlist", which is why it is not "You are on the list".
export const metadata: Metadata = {
  title: "Waitlist",
  robots: { index: false, follow: false },
};

const COPY = {
  ok: {
    heading: "That is confirmed.",
    // Must match the confirm email in substance. If the page and the email
    // describe different promises, one of them is a lie and the reader has no
    // way to tell which.
    body: "We will tell you the day we open, and now and then when something new is made.",
  },
  invalid: {
    heading: "That link has expired or was already used.",
    body: "If you have already confirmed, you are on the list and nothing more is needed. Otherwise, sign up again and we will send a fresh link.",
  },
  error: {
    heading: "Something went wrong at our end.",
    body: "Your address is safe. Try the link again in a few minutes, and if it still fails, write to hello@shaklek.com and we will add you by hand.",
  },
} as const;

export default async function WaitlistConfirmedPage({
  searchParams,
}: {
  searchParams: Promise<{ state?: string }>;
}) {
  const { state } = await searchParams;
  // Anything unrecognised reads as invalid rather than as success. A page that
  // says "confirmed" on a URL anyone can type is a page that lies.
  const copy = COPY[(state as keyof typeof COPY) in COPY ? (state as keyof typeof COPY) : "invalid"];

  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center px-6 py-20 text-center">
      <div className="flex max-w-md flex-col gap-5">
        <Link href="/" className="leading-none">
          <span className="font-wordmark text-3xl tracking-[0.138em] text-text">Shaklek</span>
        </Link>
        <h1 className="font-display text-2xl leading-snug text-text">{copy.heading}</h1>
        <p className="text-sm leading-relaxed text-text-2">{copy.body}</p>
        <p className="text-xs text-text-2">
          Shaklek, Dubai
          <span aria-hidden="true" className="px-1">
            &middot;
          </span>
          <Link href="/legal/privacy" className="underline underline-offset-2 hover:text-text">
            Privacy
          </Link>
        </p>
      </div>
    </main>
  );
}

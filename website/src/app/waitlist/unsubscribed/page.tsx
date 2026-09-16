import type { Metadata } from "next";
import Link from "next/link";

// Where /api/waitlist/unsubscribe lands someone who clicked the link.
//
// Reachable while the shop is shut through the "/waitlist" entry in
// OPEN_WHILE_SHUT. Without it this rewrites to /coming-soon, which would
// answer "please leave me alone" with a sign-up form.
//
// noindex: the end of a private link, no standalone value.
// ⚠️ NO BRAND NAME HERE. app/layout.tsx sets `template: "%s · Shaklek"`,
// so a title of "Shaklek" rendered as "Shaklek · Shaklek" in the tab. Found
// on 2026-09-16 by crawling every route and reading the titles back.
// True of both outcomes this page renders, the same way the confirmed page
// titles itself "Waitlist" rather than promising an outcome it may not be
// showing.
export const metadata: Metadata = {
  title: "Unsubscribed",
  robots: { index: false, follow: false },
};

const COPY = {
  ok: {
    heading: "You are off the list.",
    // No "are you sure", no win-back, no offer. Someone who has just left is
    // the worst possible audience for either, and an unsubscribe that argues
    // back is how a complaint gets filed instead.
    body: "We will not write to you again. If you signed up by mistake and want back on, the form is on our home page.",
  },
  invalid: {
    heading: "That link has expired or was already used.",
    body: "If you have already unsubscribed you are off the list and nothing more is needed. If you are still receiving email from us, write to hello@shaklek.com and we will remove you by hand.",
  },
  error: {
    heading: "Something went wrong at our end.",
    body: "You may still be on the list. Try the link again in a few minutes, and if it still fails, write to hello@shaklek.com and we will remove you by hand.",
  },
} as const;

export default async function WaitlistUnsubscribedPage({
  searchParams,
}: {
  searchParams: Promise<{ state?: string }>;
}) {
  const { state } = await searchParams;
  // Anything unrecognised reads as invalid. A page that says "you are off the
  // list" on a URL anyone can type is a page that lies about a promise.
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

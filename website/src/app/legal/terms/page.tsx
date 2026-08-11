import LegalPage from "@/components/LegalPage";

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="8 August 2026">
      <p>
        Shaklek is a made-to-order clothing studio. These terms cover how
        designs, orders, and accounts work. Our{" "}
        <a href="/legal/returns" className="underline">
          Returns, Alterations &amp; Refunds
        </a>{" "}
        policy and{" "}
        <a href="/legal/privacy" className="underline">
          Privacy Policy
        </a>{" "}
        are part of these terms.
      </p>

      <p className="rounded-shaklek-xs border border-border-strong bg-surface p-3 text-xs text-text-3">
        Shaklek is operated by [legal entity — to be added once the
        business is formally incorporated]. Until then, this is a working
        draft of our terms, not a final legal document.
      </p>

      <h2 className="pt-2 text-base font-medium text-text">
        Inspired by, never a reproduction
      </h2>
      <p>
        You can start a design from our catalog or from a reference you
        upload, including something inspired by an existing brand. Our
        stance: the result should be clearly inspired by a silhouette, made
        your own through customization — never a reproduction of an
        existing design. We may block checkout if a design reads too close
        to its reference, and ask you to customize it further first.
      </p>

      <h2 className="pt-2 text-base font-medium text-text">
        Your uploads and your design
      </h2>
      <p>
        When you upload a photo or sketch, you&apos;re confirming you own
        the rights to it, or have permission to use it. We don&apos;t allow
        logos, trademarks, or copyrighted prints in a submitted design. You
        own the specific garment design that comes out of your session;
        Shaklek retains the right to use anonymized data from it to
        improve how our design tools work.
      </p>

      <h2 className="pt-2 text-base font-medium text-text">
        Where our catalog comes from
      </h2>
      <p>
        Our catalog is refreshed using general trend signals — recurring
        silhouettes, colors, and details seen across fashion — not copies
        of specific products from other retailers. Every catalog piece is
        an original pattern, checked against the same originality standard
        as a customer&apos;s uploaded reference.
      </p>

      <h2 className="pt-2 text-base font-medium text-text">Accounts</h2>
      <p>
        You&apos;re responsible for keeping your account details accurate
        and your login secure. If you subscribe to Shaklek+ and later
        cancel, your saved wardrobe, avatar, and style profile are
        permanently deleted — we&apos;ll always show you this plainly
        before you confirm a cancellation, so it&apos;s never a surprise.
      </p>
    </LegalPage>
  );
}

import LegalPage from "@/components/LegalPage";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Privacy & Cookies",
  description:
    "What Shaklek collects, why, who processes it, how long it is kept, and the cookies the site sets.",
  path: "/legal/privacy",
});

// Rewritten 2026-08-24. The previous version described a camera-based body
// measurement feature that DOES NOT EXIST -- there is no camera code anywhere
// in this repo -- and said the default sizing method was a bucket size, which
// stopped being true the same day Tailored became the default. A privacy
// policy that describes features the product does not have is the same class
// of error as a marketing claim it cannot support, and it is worse here
// because it is the document a regulator reads first.
//
// Structure follows what a UAE e-commerce privacy notice is expected to cover:
// controller, what is collected, why, legal basis, processors, cross-border
// transfer, retention, rights, cookies, changes.
//
// ⚠️ NOT LEGALLY REVIEWED. A UAE-qualified lawyer should read this against
// Federal Decree-Law No. 45 of 2021 on Personal Data Protection before it is
// relied on. The processor list must be kept accurate as the stack changes --
// a named processor that is wrong is worse than none.
export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy & Cookies" updated="24 August 2026">
      <p>
        This explains what Shaklek collects, why, and who else touches it. We
        collect what we need to make and deliver your order, and little else. We
        do not sell personal data, we run no advertising trackers, and there is
        no analytics on this site.
      </p>

      <p className="border border-border-strong bg-surface p-3 text-xs text-text-3">
        The data controller is{" "}
        <strong className="text-text-2">Shaklek For Online Selling</strong>{" "}
        (شكلك للبيع عبر الإنترنت), a sole establishment licensed in Dubai,
        United Arab Emirates under commercial licence no.{" "}
        <strong className="text-text-2">1645657</strong>. Reach a person at{" "}
        <a href="mailto:hello@shaklek.com" className="underline">
          hello@shaklek.com
        </a>
        .
      </p>

      <h2 className="pt-2 text-base font-medium text-text">What we collect</h2>
      <p>
        <strong>When you order:</strong> your email address, your delivery name,
        address and phone number, the details of the piece you configured, your
        size or the measurements you gave us, any note you wrote for the tailor,
        and confirmation from Stripe that payment succeeded. We never see or
        store your card number.
      </p>
      <p>
        <strong>If you create an account:</strong> your name and the measurements
        you choose to save, so you do not have to enter them again.
      </p>
      <p>
        <strong>If you upload a reference image:</strong> the image itself, used
        only to make your order.
      </p>
      <p>
        <strong>Automatically:</strong> standard server logs — IP address,
        browser and the pages requested — kept for security and troubleshooting.
        We do not build a profile from them.
      </p>

      <h2 className="pt-2 text-base font-medium text-text">Measurements</h2>
      <p>
        Measurements are body data, so we treat them as sensitive. You give them
        only if you choose Tailored; choosing a standard size XS–XXL instead
        needs none. They go to the tailor making your piece and nowhere else,
        and you can delete saved measurements from your account at any time.
      </p>

      <h2 className="pt-2 text-base font-medium text-text">Why we hold it</h2>
      <p>
        To make and deliver what you ordered, to answer you when you write to us,
        to handle alterations and remakes, and to keep the records a business is
        required to keep. We rely on the performance of our contract with you
        for order data, your consent for saved measurements, and our legitimate
        interest in a working, secure website for server logs.
      </p>

      <h2 className="pt-2 text-base font-medium text-text">
        Who else processes it
      </h2>
      <p>
        We use a small number of providers, each handling only what its job
        needs: <strong>Stripe</strong> (payments and delivery address),{" "}
        <strong>Clerk</strong> (sign-in), <strong>Neon</strong> (the order
        database, hosted in Frankfurt), <strong>Resend</strong> and Amazon SES
        (order emails), <strong>AWS Amplify and CloudFront</strong> (hosting,
        Ireland), and <strong>Google Fonts</strong>, which receives your IP
        address in order to serve the typeface. The tailor assigned to your order
        receives a spec sheet with what to make — no name, no email, no address.
      </p>
      <p>
        Because our hosting and database sit in the EU, your data is transferred
        outside the UAE and processed there.
      </p>

      <h2 className="pt-2 text-base font-medium text-text">How long we keep it</h2>
      <p>
        Order records are kept for five years, which is what UAE commercial
        record-keeping requires. Account details and saved measurements are kept
        until you delete them or ask us to close your account. Server logs are
        kept for a short period and then discarded.
      </p>

      <h2 className="pt-2 text-base font-medium text-text">Cookies</h2>
      <p>
        This site sets very few. <strong>Sign-in cookies</strong> set by Clerk
        keep you logged in between pages — without them accounts cannot work.
        Your <strong>cart</strong> is kept in your browser&apos;s local storage,
        not sent anywhere until you check out. <strong>Stripe</strong> sets its
        own cookies on its payment page for fraud prevention.
      </p>
      <p>
        There are <strong>no</strong> advertising, behavioural, affiliate or
        social-media cookies, and no analytics. You can block cookies in your
        browser; sign-in will stop working, but browsing and ordering as a guest
        will not.
      </p>

      <h2 className="pt-2 text-base font-medium text-text">Your rights</h2>
      <p>
        You can ask what we hold about you, get a copy, correct it, have it
        deleted, object to a use, or ask us to restrict it. Write to{" "}
        <a href="mailto:hello@shaklek.com" className="underline">
          hello@shaklek.com
        </a>{" "}
        and we will respond within 30 days. If you are unhappy with how we
        handled it, you can complain to the UAE Data Office.
      </p>

      <h2 className="pt-2 text-base font-medium text-text">Changes</h2>
      <p>
        If this changes we will update the date at the top. If a change is
        significant, we will tell customers directly rather than rely on you
        rechecking this page.
      </p>
    </LegalPage>
  );
}

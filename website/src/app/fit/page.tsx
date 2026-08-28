import type { Metadata } from "next";
import Header from "@/components/Header";
import FitFeedbackForm from "@/components/FitFeedbackForm";

// NOT INDEXED. This page is reached from a QR code on a card inside a parcel,
// by someone who has already bought. In a search result it is a form asking
// strangers for an email address with no context, which is both useless and a
// bad look. The URL is short and printed on the card, so it needs no help
// being found by the people it is for.
export const metadata: Metadata = {
  title: "Thank you for your order · Shaklek",
  description: "Tell your tailor how your piece fitted, so the next one starts from it.",
  robots: { index: false, follow: false },
};

export default function FitPage() {
  return (
    <div className="flex flex-1 flex-col bg-bg">
      <Header />
      <div className="mx-auto w-full max-w-lg flex-1 px-6 py-12">
        {/* ⚠️ THIS OPENS ON THE ORDER, NOT ON THE FORM. Founder, 2026-08-28.
            It used to lead with "How did it fit?" over two paragraphs
            explaining the mechanism, which is the site talking about itself to
            someone who has just opened a parcel. Her note: "this needs to tell
            the customer this is a special care, so that we take account of
            every detail they like next time."

            So: thank her, promise the next one, ask. Three lines, and the
            middle one is the whole proposition. Everything the old version
            explained about tailors and size charts is still true and is now
            said once, in the sentence under the promise, instead of three
            times before the first question. Resist adding it back. */}
        <h1 className="text-[26px] leading-snug text-text">
          Thank you for your order.
        </h1>
        <p className="mt-3 text-[17px] leading-snug text-text">
          Let’s make the next one even better.
        </p>
        <p className="mt-4 text-[14px] leading-relaxed text-text-2">
          Tell us how this piece sat on you. Your tailor keeps every detail and
          cuts to it next time.
        </p>
        <FitFeedbackForm />
        <p className="mt-10 border-t border-[#E7E0D2] pt-5 text-[12.5px] leading-relaxed text-text-3">
          Something actually wrong? You get one free alteration or remake within
          14 days.{" "}
          <a href="https://wa.me/971504766769" className="underline">
            Message us
          </a>
          .{" "}
          {/* Notice at the point of collection, where the data is given rather
              than only in the footer. Moved down here with the rest of the
              small print so it is not one more thing to read before the first
              question. */}
          <a href="/legal/privacy" className="underline">
            How we handle your details
          </a>
          .
        </p>
      </div>
    </div>
  );
}

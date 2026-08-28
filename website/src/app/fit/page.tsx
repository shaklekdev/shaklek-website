import type { Metadata } from "next";
import Header from "@/components/Header";
import FitFeedbackForm from "@/components/FitFeedbackForm";

// NOT INDEXED. This page is reached from a QR code on a card inside a parcel,
// by someone who has already bought. In a search result it is a form asking
// strangers for an email address with no context, which is both useless and a
// bad look. The URL is short and printed on the card, so it needs no help
// being found by the people it is for.
export const metadata: Metadata = {
  title: "How did it fit? · Shaklek",
  description: "Tell your tailor how your piece fitted, so the next one starts from it.",
  robots: { index: false, follow: false },
};

export default function FitPage() {
  return (
    <div className="flex flex-1 flex-col bg-bg">
      <Header />
      <div className="mx-auto w-full max-w-lg flex-1 px-6 py-12">
        <h1 className="text-[26px] text-text">How did it fit?</h1>
        <p className="mt-3 text-[14px] leading-relaxed text-text-2">
          Your piece was cut for you, and the next one can be closer still.
          Whatever you tell us here goes to your tailor and stays with your
          measurements, so your next order starts from this instead of from a
          size chart.
        </p>
        <p className="mt-2 text-[13px] text-text-3">
          Two minutes. Answer only what you noticed.{" "}
          {/* Notice AT THE POINT OF COLLECTION. This page takes an email and a
              sentence about someone's body from a visitor who is not signed in,
              and UAE PDPL expects the notice where the data is given, not only
              on a page in the footer. */}
          <a href="/legal/privacy" className="underline">
            How we handle this
          </a>
          .
        </p>
        <FitFeedbackForm />
        <p className="mt-10 border-t border-[#E7E0D2] pt-5 text-[12.5px] leading-relaxed text-text-3">
          If something is actually wrong with the piece, this is not the place —
          you get one free alteration or remake within 14 days.{" "}
          <a href="https://wa.me/971504766769" className="underline">
            Message us
          </a>{" "}
          and we will arrange it.
        </p>
      </div>
    </div>
  );
}

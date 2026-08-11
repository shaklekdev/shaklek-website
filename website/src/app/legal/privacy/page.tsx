import LegalPage from "@/components/LegalPage";

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="8 August 2026">
      <p>
        This explains what information Shaklek collects and why, in plain
        language. We collect what we need to make and deliver your order,
        and nothing beyond that without asking first.
      </p>

      <h2 className="pt-2 text-base font-medium text-text">
        What we collect
      </h2>
      <p>
        Contact details, order and customization history, size selection,
        delivery address, and payment confirmation from our payment
        provider (we don&apos;t store your full card details ourselves).
      </p>

      <h2 className="pt-2 text-base font-medium text-text">
        Body measurement data — opt-in only
      </h2>
      <p>
        The default sizing method is a bucket size (XS–XL) — no
        measurement required. Camera-based measurement is an optional,
        free upgrade for a more accurate fit. Because body-measurement
        data is sensitive personal data, we only collect it with your
        explicit consent, and declining it never blocks you from ordering
        with a bucket size instead.
      </p>

      <h2 className="pt-2 text-base font-medium text-text">
        How your design data is used
      </h2>
      <p>
        Your specific garment design and customization requests are used
        to produce your order and to improve our design tools, in
        anonymized form. We don&apos;t sell your personal data to third
        parties.
      </p>

      <h2 className="pt-2 text-base font-medium text-text">Who sees it</h2>
      <p>
        The tailor assigned to your order receives only what&apos;s needed
        to make it — your spec sheet, not your full account details — and
        that access is scoped to your order, not kept as a reusable
        library.
      </p>

      <h2 className="pt-2 text-base font-medium text-text">Your rights</h2>
      <p>
        You can ask us what data we hold about you, request a copy, or ask
        us to delete your account data, by writing to{" "}
        <a href="mailto:support@shaklek.com" className="underline">
          support@shaklek.com
        </a>
        .
      </p>
    </LegalPage>
  );
}

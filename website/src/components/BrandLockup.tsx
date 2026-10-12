// THE BRAND LOCKUP, the only way the site draws "Shaklek". Wordmark in Italiana
// at 4/29 tracking, a gold rule, then شكلك in Reem Kufi -- the same three pieces
// as branding/source/shaklek-logo.svg, which the packaging and the emails use.
//
// ⚠️ ONE COMPONENT ON PURPOSE. Founder, 2026-10-11: "we have different fonts in
// different places... make everything the same !! it feels like we're changing
// the brand". The header had the full lockup while the waitlist pages, the
// journal and the coming-soon page drew the wordmark alone, and the emails drew
// it in Cormorant. Any new page that shows the brand renders THIS.
//
// Sizes are the header's own (27px, 29px from sm) scaled: the tracking is 4/29
// of the size (0.138em) at every size, and the rule and Arabic scale with it.
const SIZES = {
  md: { word: "text-[27px] sm:text-[29px]", ar: "text-sm", rule: "w-9 my-1.5" },
  lg: { word: "text-[34px] sm:text-[48px]", ar: "text-base sm:text-lg", rule: "w-11 sm:w-14 my-2" },
} as const;

export default function BrandLockup({ size = "md" }: { size?: keyof typeof SIZES }) {
  const s = SIZES[size];
  return (
    <span className="flex flex-col items-center leading-none">
      {/* Italiana, founder's pick 2026-08-26. Single weight and hairline thins,
          so it never goes below the header's 27px. */}
      <span className={`font-wordmark ${s.word} tracking-[0.138em] text-text`}>Shaklek</span>
      <span className={`${s.rule} h-px bg-gold`} aria-hidden="true" />
      <span dir="rtl" lang="ar" className={`font-arabic ${s.ar} tracking-[1px] text-text`}>
        شكلك
      </span>
    </span>
  );
}

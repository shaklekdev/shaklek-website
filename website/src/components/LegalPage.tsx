import Header from "@/components/Header";

export default function LegalPage({
  title,
  updated,
  intro,
  children,
}: {
  title: string;
  // Optional: legal documents carry a revision date, an FAQ or a shipping
  // page does not.
  updated?: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col bg-bg">
      <Header />
      <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-14">
        <h1 className="text-[26px] text-text">{title}</h1>
        {updated && (
          <p className="mt-1 text-xs text-text-3">Last updated {updated}</p>
        )}
        {intro && <p className="mt-2 max-w-lg text-sm text-text-3">{intro}</p>}
        <div className="prose-legal mt-8 space-y-5 text-justify text-[14px] leading-relaxed text-text-2 hyphens-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

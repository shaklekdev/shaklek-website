import Header from "@/components/Header";

export default function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col bg-bg">
      <Header />
      <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-14">
        <h1 className="text-[26px] text-text">{title}</h1>
        <p className="mt-1 text-xs text-text-3">Last updated {updated}</p>
        <div className="prose-legal mt-8 space-y-5 text-justify text-[14px] leading-relaxed text-text-2 hyphens-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

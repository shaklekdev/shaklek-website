import Link from "next/link";
import Header from "@/components/Header";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col bg-bg">
      <Header />
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-6 py-20 text-center">
        <p className="font-display text-5xl text-text-3">404</p>
        <h1 className="mt-4 text-[26px] text-text">Nothing here</h1>
        <p className="subtitle mt-2">
          The page you&apos;re looking for doesn&apos;t exist, or the design
          may have moved.
        </p>
        <Link
          href="/#catalog"
          className="mt-8 rounded-full bg-accent px-8 py-3.5 text-sm text-white transition-opacity hover:opacity-90"
        >
          Back to catalog
        </Link>
      </div>
    </div>
  );
}

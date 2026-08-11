import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="font-display text-2xl font-light tracking-[3px] text-text"
        >
          Shaklek
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-text-2 sm:flex">
          <Link href="/" className="hover:text-text transition-colors">
            Catalog
          </Link>
          <Link href="/upload" className="hover:text-text transition-colors">
            Upload your own
          </Link>
          <Link
            href="/how-it-works"
            className="hover:text-text transition-colors"
          >
            How it works
          </Link>
        </nav>
      </div>
    </header>
  );
}

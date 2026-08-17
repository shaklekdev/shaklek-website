import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border px-6 py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-xs text-text-3 sm:flex-row">
        <p>© 2026 Shaklek</p>
        <div className="flex gap-5">
          <Link href="/legal/terms" className="hover:text-text-2">
            Terms
          </Link>
          <Link href="/legal/returns" className="hover:text-text-2">
            Returns &amp; Alterations
          </Link>
          <Link href="/legal/privacy" className="hover:text-text-2">
            Privacy
          </Link>
          <a href="mailto:hello@shaklek.com" className="hover:text-text-2">
            hello@shaklek.com
          </a>
          <a
            href="https://wa.me/971504766769"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-text-2"
          >
            WhatsApp
          </a>
        </div>
      </div>
    </footer>
  );
}

import Link from "next/link";
import Header from "@/components/Header";
import { isStoreOpen } from "@/lib/storeOpen";

// The header the journal wears, which depends on whether there is a shop to
// point at.
//
// WHY THIS EXISTS. /blog is reachable while the shop is shut (src/proxy.ts) so
// the articles can start earning search ranking before October. But it was
// rendering the full storefront header, and every link in it -- the catalogue,
// the cart, the account, the size guide, our-story -- rewrites to
// /coming-soon. A reader who finished an article and clicked "Shop" got a
// coming-soon page with no explanation, and Google saw five internal links per
// page all resolving to the same URL.
//
// So while shut: the name, and the journal. Nothing offering a shop that is
// not there. The pre-launch page is one click away through the wordmark, which
// is where someone who wants to buy should end up anyway.
//
// ⚠️ Header.tsx is a CLIENT component and cannot read STORE_OPEN itself --
// that variable is server-only on purpose, because a client-readable flag is
// one a client can be tempted to branch on. Hence this server wrapper choosing
// between two headers, rather than a prop threaded through the client tree.
export default function JournalHeader() {
  if (isStoreOpen()) return <Header />;

  return (
    <header className="border-b border-border bg-bg">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-5">
        <Link href="/" className="leading-none">
          <span className="font-wordmark text-2xl tracking-[0.138em] text-text">Shaklek</span>
        </Link>
        <Link
          href="/blog"
          className="text-xs uppercase tracking-[0.18em] text-text-2 hover:text-text"
        >
          Journal
        </Link>
      </div>
    </header>
  );
}

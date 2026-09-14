import Link from "next/link";
import CookieChoicesLink from "@/components/CookieChoicesLink";
import { isStoreOpen } from "@/lib/storeOpen";

export default function Footer() {
  return (
    <footer className="border-t border-border px-6 py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-xs text-text-3 sm:flex-row">
        <p>© 2026 Shaklek</p>
        {/* ⚠️ HALF OF THIS FOOTER DEAD-ENDED WHILE THE SHOP WAS SHUT.
            Questions, Size guide, Delivery and Returns all rewrite to
            /coming-soon in src/proxy.ts, so on the journal pages, the only
            pages a stranger can reach today, four of the nine links took the
            reader to a page that answered none of them. Founder, 2026-09-13:
            "the footer needs to be updated as well to render to the welcome
            page".

            They are HIDDEN rather than repointed: a link labelled "Size guide"
            that lands on a signup page is worse than no link, because the
            reader spends the click finding out. Legal, email and WhatsApp stay
            because they work and because a site collecting email addresses has
            to reach its own privacy policy. Everything comes back when
            STORE_OPEN is true. */}
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 sm:justify-end">
          {isStoreOpen() && (
            <>
              {/* ⚠️ THIS PAGE HAD NOTHING LINKING TO IT AT ALL. It was pulled
                  from the header on 2026-08-25 as "a click that led somewhere
                  nobody can order from", the only other link lived in
                  ValueBand.tsx which no page renders, and it sat in the sitemap
                  at priority 0.8 the whole time. Google was being pointed at an
                  orphan, which is the worst of both: indexed and unreachable.
                  Founder, 2026-09-14: "yes link it if it's adding us views". */}
              <Link href="/how-it-works" className="hover:text-text-2">
                How it works
              </Link>
              <Link href="/faq" className="hover:text-text-2">
                Questions
              </Link>
            </>
          )}
          {/* The journal is NOT in the header nav, deliberately. Three articles
              do not earn a slot beside Catalog, and the traffic path for them is
              Google -> article -> catalogue, not homepage -> blog. But the
              sitemap listed them while nothing on the site linked to them at
              all, which is backwards: a page no page links to is an orphan, and
              orphans rank badly. Footer plus one contextual link from the FAQ
              fabric answer is the right weight for now. Revisit the header once
              there are enough articles to be worth browsing. */}
          <Link href="/blog" className="hover:text-text-2">
            Journal
          </Link>
          {isStoreOpen() && (
            <>
              <Link href="/size-guide" className="hover:text-text-2">
                Size guide
              </Link>
              <Link href="/shipping" className="hover:text-text-2">
                Delivery
              </Link>
              <Link href="/legal/terms#returns" className="hover:text-text-2">
                Returns &amp; Alterations
              </Link>
            </>
          )}
          <Link href="/legal/terms" className="hover:text-text-2">
            Terms
          </Link>
          <Link href="/legal/privacy" className="hover:text-text-2">
            Privacy &amp; Cookies
          </Link>
          <CookieChoicesLink />
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

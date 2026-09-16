import Link from "next/link";
import CookieChoicesLink from "@/components/CookieChoicesLink";
import { isStoreOpen } from "@/lib/storeOpen";
import { SITE_TAGLINE } from "@/lib/seo";

export default function Footer() {
  return (
    <footer className="border-t border-border px-6 py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-xs text-text-3 sm:flex-row">
        {/* ⚠️ THE TAGLINE LIVES HERE, 2026-09-16, and this is the ONLY place
            on the site it is stated as a tagline. It is what the business cards
            and the packaging say, so the footer is what makes the site agree
            with the thing already printed. A comment in coming-soon/page.tsx
            had claimed for weeks that it "lives on the business card, the
            packaging and the footer" -- it was not in the footer at all.
            Everything else here is a link; this is the one line of voice. */}
        <p className="text-center sm:text-left">
          <span className="text-text-2">{SITE_TAGLINE}</span>
          <span className="mt-1 block sm:mt-0 sm:ml-3 sm:inline">© 2026 Shaklek</span>
        </p>
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
            <Link href="/faq" className="hover:text-text-2">
              Questions
            </Link>
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

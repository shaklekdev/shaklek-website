"use client";

import Link from "next/link";
import { useCart } from "@/lib/CartContext";

// "How it works" was removed from the menu on 2026-08-25 and its content moved
// onto the home page. Two reasons, both the founder's: it was a click that led
// somewhere a customer cannot order from, and the concept needs to land on the
// page they arrive on rather than behind a tab most people never open.
//
// "Size custom" replaces it. That page is where a customer can save their
// measurements, which is the thing this business actually runs on -- so it
// earns a menu slot in a way an explainer never did.
const NAV_LINKS = [
  // /#catalog, not "/" -- same fix as the Start designing buttons. A menu item
  // called Catalog that lands someone at the top of the home page makes them
  // scroll past the whole page to reach the clothes they asked for.
  { href: "/#catalog", label: "Catalog" },
  { href: "/size-guide", label: "Size custom" },
  { href: "/our-story", label: "Our story" },
];

export default function Header() {
  const { items } = useCart();
  // Garments, not cart lines -- the cart page counts the same way, and a
  // badge reading "2" over a cart saying "4 pieces" reads as a bug.
  const units = items.reduce((sum, item) => sum + item.quantity, 0);
  // NO HAMBURGER. The three links live in the black bar below the wordmark at
  // every width, so there is nothing left for a menu to hide. That removes the
  // panel, its Escape handler, its close-on-navigation state, and the bug where
  // "/#catalog" tapped from the home page changed only the hash -- which the
  // panel did not treat as navigation, so it stayed open over the clothes.

  // Opaque rather than bg-white/90 + backdrop-blur-xl. A full-width sticky
  // element with a 24px backdrop blur is re-sampled and re-blurred on every
  // frame that anything moves underneath it -- which, thanks to the 20s
  // hero-ken-burns loop, meant every frame even when idle. The page
  // background is #ffffff, so at rest the two render the same pixels.
  return (
    <header className="sticky top-0 z-50 bg-white">
      {/* The wordmark sits CENTRED on its own white row and the menu is a black
          bar underneath it (Youssef's layout, founder 2026-08-26). The mark is
          the thing being introduced, so it gets the row; navigation is a
          different job and now reads as a different band. */}
      <div className="relative mx-auto flex max-w-6xl items-center justify-center px-6 py-4 sm:py-5">
        <Link href="/" className="flex flex-col items-center leading-none">
          <span className="font-display text-2xl font-light tracking-[3px] text-text">
            Shaklek
          </span>
          <span className="my-1.5 h-px w-9 bg-gold" aria-hidden="true" />
          <span
            dir="rtl"
            lang="ar"
            className="font-arabic text-sm tracking-[1px] text-text"
          >
            شكلك
          </span>
        </Link>
        {/* Absolute, so the wordmark is centred on the PAGE and not on whatever
            space these icons leave over. */}
        <div className="absolute right-6 flex items-center gap-5">
          {/* ONE LINK FOR BOTH STATES, and no Clerk in this component.

              This was `isSignedIn ? <UserButton/> : <Link href="/sign-in"/>`, which
              meant Header called useUser() -- and Header renders on every page, so
              Clerk's 356KB loaded on the home page, /our-story, /faq and every
              other page with no sign-in on it. See AuthProvider.tsx for the
              measurements.

              /account is protected by clerkMiddleware, so this one link is correct
              for both states: a signed-out visitor is bounced to sign-in, a
              signed-in one lands on their orders. The avatar menu it replaces
              offered exactly two things -- "My orders", which is this link, and
              sign out, which now lives on /account itself. */}
          <Link
            href="/account"
            aria-label="Your account"
            title="Your account"
            className="flex h-6 w-6 items-center justify-center text-text transition-colors hover:text-text-2"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.6" />
              <path
                d="M5 20c0-4 3.2-6.5 7-6.5s7 2.5 7 6.5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </Link>
          <Link
            href="/cart"
            aria-label={`Cart, ${units} ${units === 1 ? "item" : "items"}`}
            /* h-6 w-6 gives the link a 24x24 hit area (WCAG 2.5.8 minimum);
               the glyph stays 20x20, centred inside it. */
            className="relative flex h-6 w-6 items-center justify-center text-text hover:text-text-2 transition-colors"
          >
            {/* Both wheels sit centred on y=21, spanning 19-23 inside the
                24-high viewBox. The left one was "M9 21", which put its centre
                at y=23 and its outline at y=25 -- two units below its pair and
                past the bottom of the viewBox, so it rendered visibly sliced
                off. Two cart icons exist (header bar and mobile menu) and both
                had it. */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M3 3h2l.4 2M7 13h10l3-8H5.4M7 13L5.4 5M7 13l-2.3 4.6A1 1 0 0 0 5.6 19H17M17 19a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM9 19a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {units > 0 && (
              <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] text-white">
                {units}
              </span>
            )}
          </Link>

        </div>
      </div>

      {/* THE BLACK BAR. Full-bleed, so it reads as a band across the page
          rather than a boxed strip; the links themselves stay inside the same
          max-w-6xl column as everything else.

          Right-aligned from 640px, matching the layout Youssef drew, and
          centred below that -- three short labels fit a phone comfortably,
          which is the whole reason the hamburger could go. */}
      <nav aria-label="Main" className="bg-text">
        <div className="mx-auto flex max-w-6xl items-center justify-center gap-7 px-6 py-2.5 sm:justify-end sm:gap-10">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              /* white/75 rather than a grey: on black, a mid-grey reads as
                 disabled. It lifts to full white on hover. */
              className="font-display text-[13px] tracking-[0.5px] text-white/75 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}

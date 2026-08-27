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
      {/* Wordmark LEFT, icons right, menu in a black band underneath. The bar
          is Youssef's layout; the left-aligned mark is the founder's amendment
          to it (2026-08-26) -- a centred wordmark reads as a fashion editorial,
          and this is a shop where people have to find the cart. */}
      {/* FULL WIDTH, not the max-w-6xl content column. Inside that column the
          mark was left-aligned but the column is centred, so on a wide screen
          it sat ~700px in from the edge and still read as "middle" -- which is
          what the founder was seeing. A header is chrome, not content: it hugs
          the page. */}
      {/* THREE COLUMNS, so the wordmark is centred on the PAGE rather than on
          whatever is left over beside the icons. A flex row with two children
          centres the mark between them and it drifts as either side changes
          width; equal-basis outer columns pin it.

          ⚠️ THE CENTRED MARK REVERSES THE FOUNDER'S OWN 2026-08-26 AMENDMENT.
          Her reasoning then, kept because it may still be right: "a centred
          wordmark reads as a fashion editorial, and this is a shop where people
          have to find the cart." An outside reviewer asked for centred on
          2026-08-27 and she passed it on with a mockup. To go back, swap the
          justify classes below -- it is one line, not a rebuild. */}
      {/* Constrained to the same max-w-6xl column as every page, so the icons
          line up with the content instead of hugging the screen edge -- the
          reviewer's point that an eye should not have to hunt the corners for
          them. The previous full-bleed row existed only to stop a LEFT-aligned
          wordmark reading as "middle" on a wide screen; with the mark centred
          on purpose that reason is gone. */}
      <div className="mx-auto grid w-full max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-6 py-4 sm:py-5">
        {/* A REAL PHONE NUMBER, on purpose, and the reviewer's argument for it
            is a conversion one rather than a design one: the product imagery is
            generated, and a site with AI pictures and an AI chatbot reads as a
            scam. A human number visible without scrolling is what separates
            "shop" from "drop-shipper" in UAE e-commerce, and it reassures the
            larger, quieter group of visitors who never ask anything.

            Same number as the footer. wa.me opens WhatsApp on a phone and
            web.whatsapp.com on a desktop, so one link covers both. */}
        <a
          href="https://wa.me/971504766769"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Message us on WhatsApp"
          className="flex items-center gap-2.5 justify-self-start text-text transition-colors hover:text-text-2"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="6" y="2" width="12" height="20" rx="2.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M10.5 18.5h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span className="hidden leading-tight sm:block">
            <span className="block text-[10px] tracking-wide text-text-3 uppercase">
              Need help? Message us
            </span>
            <span className="block text-[13px] font-medium">+971 50 476 6769</span>
          </span>
        </a>
        {/* items-CENTER, not items-start. The lockup is three stacked pieces --
            wordmark, gold rule, Arabic -- and they centre on each other. Only
            the lockup as a whole sits left on the page. Left-aligning the
            pieces individually hung the rule and the Arabic off the "S" and
            left the mark looking unfinished under its own right half. */}
        <Link href="/" className="col-start-2 flex flex-col items-center leading-none">
          {/* Italiana, founder's pick 2026-08-26. Single weight and hairline
              thins, so it goes UP a step in size -- at 24px its strokes start
              to disappear on a phone -- and gains letter-spacing, which is
              what a display face this fine is drawn to be given. */}
          <span className="font-wordmark text-[27px] tracking-[4px] text-text sm:text-[29px]">
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
        <div className="flex items-center gap-5 justify-self-end">
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
        {/* CENTRED AT EVERY WIDTH (founder, 2026-08-26). It was right-aligned
            from 640px to match the mockup; she wants the three links centred on
            a phone and on a desktop alike, so the bar reads the same way
            everywhere. */}
        <div className="flex items-center justify-center gap-7 px-6 py-2.5 sm:gap-12">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              /* NOT the display serif. Cormorant is a light, high-contrast
                 face -- at 13px reversed out of black its thin strokes broke up
                 and the founder could not read them. Small reversed type wants
                 an even-weight sans, full white, and a little letter-spacing to
                 stop it closing up. The serif belongs in the wordmark and the
                 headings, not in 13px navigation. */
              className="font-body text-[13.5px] tracking-[0.06em] text-white transition-colors hover:text-white/70"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}

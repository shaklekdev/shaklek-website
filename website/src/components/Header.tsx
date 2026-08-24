"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import { useCart } from "@/lib/CartContext";

const NAV_LINKS = [
  { href: "/", label: "Catalog" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/our-story", label: "Our story" },
];

export default function Header() {
  const { items } = useCart();
  // Garments, not cart lines -- the cart page counts the same way, and a
  // badge reading "2" over a cart saying "4 pieces" reads as a bug.
  const units = items.reduce((sum, item) => sum + item.quantity, 0);
  const { isSignedIn } = useUser();
  const pathname = usePathname();

  // Every nav link used to be `hidden sm:inline` with no hamburger anywhere in
  // the markup, so below 640px the header was a logo and a cart icon: Catalog,
  // How it works, Our story and Sign in were all unreachable. Signed-in users
  // were unaffected because Clerk's <UserButton> carries no `hidden` class --
  // so the breakage hit exactly the mobile visitors who had not converted yet,
  // which is why it survived to production.
  const [menuOpen, setMenuOpen] = useState(false);

  // Navigating with the panel open would otherwise leave it covering the new
  // page. Adjusted during render rather than in an effect -- React's own
  // recommended pattern for "reset state when a prop changes", and it avoids
  // the extra commit an effect would cause.
  const [menuPathname, setMenuPathname] = useState(pathname);
  if (pathname !== menuPathname) {
    setMenuPathname(pathname);
    setMenuOpen(false);
  }

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  // Opaque rather than bg-white/90 + backdrop-blur-xl. A full-width sticky
  // element with a 24px backdrop blur is re-sampled and re-blurred on every
  // frame that anything moves underneath it -- which, thanks to the 20s
  // hero-ken-burns loop, meant every frame even when idle. The page
  // background is #ffffff, so at rest the two render the same pixels.
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
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
        <nav className="flex items-center gap-6 text-sm text-text-2 sm:gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hidden hover:text-text transition-colors sm:inline"
            >
              {link.label}
            </Link>
          ))}
          {isSignedIn ? (
            <UserButton userProfileMode="navigation" userProfileUrl="/account">
              <UserButton.MenuItems>
                <UserButton.Link
                  label="My orders"
                  href="/account"
                  labelIcon={
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path
                        d="M3 3h2l.4 2M7 13h10l3-8H5.4M7 13L5.4 5M7 13l-2.3 4.6A1 1 0 0 0 5.6 19H17M17 19a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM9 19a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  }
                />
              </UserButton.MenuItems>
            </UserButton>
          ) : (
            <Link href="/sign-in" className="hidden hover:text-text transition-colors sm:inline">
              Sign in
            </Link>
          )}
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

          {/* Below sm this is the only way to reach the rest of the site.
              44x44 tap target per WCAG 2.5.8. */}
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="-mr-2 flex h-11 w-11 items-center justify-center text-text transition-colors hover:text-text-2 sm:hidden"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              {menuOpen ? (
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </button>
        </nav>
      </div>

      {menuOpen && (
        <nav
          id="mobile-nav"
          aria-label="Main"
          className="border-t border-border bg-white px-6 py-2 sm:hidden"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block border-b border-border py-3.5 text-sm text-text-2 transition-colors hover:text-text"
            >
              {link.label}
            </Link>
          ))}
          {/* Signed-in users get /account through Clerk's <UserButton>, which
              renders on mobile already -- so only the signed-out entry point
              was missing. */}
          {!isSignedIn && (
            <Link
              href="/sign-in"
              className="block py-3.5 text-sm text-text-2 transition-colors hover:text-text"
            >
              Sign in
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}

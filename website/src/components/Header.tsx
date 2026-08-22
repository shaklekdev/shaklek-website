"use client";

import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
import { useCart } from "@/lib/CartContext";

export default function Header() {
  const { items } = useCart();
  const { isSignedIn } = useUser();

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
          <Link href="/" className="hidden hover:text-text transition-colors sm:inline">
            Catalog
          </Link>
          <Link
            href="/how-it-works"
            className="hidden hover:text-text transition-colors sm:inline"
          >
            How it works
          </Link>
          <Link
            href="/our-story"
            className="hidden hover:text-text transition-colors sm:inline"
          >
            Our story
          </Link>
          {isSignedIn ? (
            <UserButton userProfileMode="navigation" userProfileUrl="/account">
              <UserButton.MenuItems>
                <UserButton.Link
                  label="My orders"
                  href="/account"
                  labelIcon={
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path
                        d="M3 3h2l.4 2M7 13h10l3-8H5.4M7 13L5.4 5M7 13l-2.3 4.6A1 1 0 0 0 5.6 19H17M17 19a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM9 21a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"
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
            aria-label={`Cart, ${items.length} ${items.length === 1 ? "item" : "items"}`}
            /* h-6 w-6 gives the link a 24x24 hit area (WCAG 2.5.8 minimum);
               the glyph stays 20x20, centred inside it. */
            className="relative flex h-6 w-6 items-center justify-center text-text hover:text-text-2 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M3 3h2l.4 2M7 13h10l3-8H5.4M7 13L5.4 5M7 13l-2.3 4.6A1 1 0 0 0 5.6 19H17M17 19a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM9 21a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {items.length > 0 && (
              <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] text-white">
                {items.length}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}

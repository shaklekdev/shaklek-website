"use client";

import Link from "next/link";
import { useCart } from "@/lib/CartContext";

export default function Header() {
  const { items } = useCart();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="font-display text-2xl font-light tracking-[3px] text-text"
        >
          Shaklek
        </Link>
        <nav className="flex items-center gap-6 text-sm text-text-2 sm:gap-8">
          <Link href="/" className="hidden hover:text-text transition-colors sm:inline">
            Catalog
          </Link>
          <Link
            href="/upload"
            className="hidden hover:text-text transition-colors sm:inline"
          >
            Upload your own
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
          <Link
            href="/cart"
            aria-label={`Cart, ${items.length} ${items.length === 1 ? "item" : "items"}`}
            className="relative flex items-center text-text hover:text-text-2 transition-colors"
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

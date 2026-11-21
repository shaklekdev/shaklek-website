"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Side drawer menu on phones and tablets (below lg), founder 2026-11-21:
 * "la barre du menu qui s'affiche sur le côté, il faut qu'on l'ait aussi"
 * (shop-zavi.com pattern). Replaces the black two-link bar on small screens;
 * desktop keeps the bar.
 *
 * It closes on: a link tap, the overlay, the X, Escape, and ANY route change
 * (pathname effect). The last one is what the old dropdown lacked: "/catalog"
 * from the home page only changed the hash and the panel stayed open over the
 * clothes (see the history note in Header.tsx). Hash links on the home page
 * are plain <a> so the browser scrolls; the link's own onClick closes the panel.
 */
const LINKS: { href: string; label: string }[] = [
  { href: "/catalog", label: "Catalogue" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#why-choose-us", label: "Why choose us" },
  { href: "/our-story", label: "Our story" },
  { href: "/faq", label: "FAQ" },
  { href: "/account", label: "Your account" },
];

export default function SideMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close on route change: adjust state during render (React's recommended
  // pattern) rather than in an effect.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label="Menu"
        aria-expanded={open}
        aria-controls="side-menu"
        onClick={() => setOpen(true)}
        className="relative flex h-6 w-6 items-center justify-center text-text before:absolute before:-inset-2.5 before:content-['']"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      <div
        aria-hidden={!open}
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-[60] bg-black/40 transition-opacity duration-300 ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
      />
      <nav
        id="side-menu"
        aria-label="Main"
        aria-hidden={!open}
        inert={!open}
        className={`fixed inset-y-0 left-0 z-[61] flex w-[82vw] max-w-[340px] flex-col bg-white shadow-xl transition-transform duration-300 ease-out ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <img src="/brand/shaklek-logo.svg" alt="Shaklek" width={84} height={36} className="h-8 w-auto" />
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="relative flex h-6 w-6 items-center justify-center text-text before:absolute before:-inset-2.5 before:content-['']"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <ul className="flex-1 overflow-y-auto px-6 py-2">
          {LINKS.map((l) => (
            <li key={l.href} className="border-b border-border">
              <Link
                href={l.href}
                onClick={() => setOpen(false)}
                className="flex min-h-14 items-center text-[13px] tracking-[0.14em] text-text uppercase"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="space-y-3 border-t border-border px-6 py-6 text-[13px] text-text-2">
          <a href="mailto:hello@shaklek.com" className="block hover:text-text">hello@shaklek.com</a>
          <a href="https://www.instagram.com/shaklek.uae/" target="_blank" rel="noopener noreferrer" className="block hover:text-text">
            Instagram
          </a>
        </div>
      </nav>
    </>
  );
}

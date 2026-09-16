import type { Metadata } from "next";
import { NOINDEX } from "@/lib/seo";

// Transactional page -- kept out of search results. It is a client
// component, so the robots directive lives in this layout.
//
// ⚠️ AND THE TITLE LIVES HERE FOR THE SAME REASON. page.tsx is "use client" --
// it needs the cart context -- and a client component cannot export
// `metadata`, so with only NOINDEX here both routes fell through to the root
// default and every tab read "Shaklek · Your look, your way". Found on
// 2026-09-16 by crawling every route and reading the titles back, rather than
// assuming a page with no metadata export inherits something sensible.
//
// Spread NOINDEX rather than rewriting the robots object: it is the shared
// constant every transactional page uses, and a hand-copied
// `{ index: false, follow: false }` here is one more thing to keep in sync.
export const metadata: Metadata = {
  ...NOINDEX,
  title: "Cart",
  description: "The pieces you have designed, before you check out.",
};

export default function CartLayout({ children }: LayoutProps<"/cart">) {
  return children;
}

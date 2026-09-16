import type { Metadata } from "next";
import AuthProvider from "@/components/AuthProvider";
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
  title: "Checkout",
  description: "Confirm your order and pay.",
};


// Mounts Clerk. See src/components/AuthProvider.tsx -- the provider is
// per-route rather than in the root layout because it is 356KB and used to
// load on every marketing page.
export default function CheckoutLayout({ children }: LayoutProps<"/checkout">) {
  return <AuthProvider>{children}</AuthProvider>;
}

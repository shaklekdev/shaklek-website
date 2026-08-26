import type { Metadata } from "next";
import AuthProvider from "@/components/AuthProvider";
import { NOINDEX } from "@/lib/seo";

// Transactional page -- kept out of search results. It is a client
// component, so the robots directive lives in this layout.
export const metadata: Metadata = NOINDEX;


// Mounts Clerk. See src/components/AuthProvider.tsx -- the provider is
// per-route rather than in the root layout because it is 356KB and used to
// load on every marketing page.
export default function OrderConfirmedLayout({ children }: LayoutProps<"/order-confirmed">) {
  return <AuthProvider>{children}</AuthProvider>;
}

import type { Metadata } from "next";
import { NOINDEX } from "@/lib/seo";

// Transactional page -- kept out of search results. It is a client
// component, so the robots directive lives in this layout.
export const metadata: Metadata = NOINDEX;

export default function CartLayout({ children }: LayoutProps<"/cart">) {
  return children;
}

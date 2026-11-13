import type { Metadata } from "next";
import { NOINDEX } from "@/lib/seo";

// Reached from the confirmation page or email with the order's access token.
// Never indexed.
export const metadata: Metadata = { ...NOINDEX, title: "Virtual fitting" };

export default function MeasureLayout({ children }: { children: React.ReactNode }) {
  return children;
}

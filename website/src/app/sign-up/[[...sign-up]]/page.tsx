import { SignUp } from "@clerk/nextjs";
import type { Metadata } from "next";
import Header from "@/components/Header";
import AuthShell, { authAppearance } from "@/components/auth/AuthShell";
import { NOINDEX } from "@/lib/seo";

// Founder review 2026-11-11: the page had no header, no title and a raw
// slate background -- a dead end with no way back to the shop.
export const metadata: Metadata = { ...NOINDEX, title: "Sign up" };

export default function SignUpPage() {
  return (
    <div className="flex flex-1 flex-col bg-bg">
      <Header />
      <AuthShell title="Create your account" sub="Shaklek">
        <SignUp appearance={authAppearance} />
      </AuthShell>
    </div>
  );
}

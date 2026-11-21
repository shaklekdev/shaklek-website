import { SignIn } from "@clerk/nextjs";
import type { Metadata } from "next";
import Header from "@/components/Header";
import AuthShell, { authAppearance } from "@/components/auth/AuthShell";
import { NOINDEX } from "@/lib/seo";

// Founder review 2026-11-11: the page had no header, no title and a raw
// slate background -- a dead end with no way back to the shop.
export const metadata: Metadata = { ...NOINDEX, title: "Sign in" };

export default function SignInPage() {
  return (
    <div className="flex flex-1 flex-col bg-bg">
      <Header />
      <AuthShell title="Welcome back" sub="Your account">
        <SignIn appearance={authAppearance} />
      </AuthShell>
    </div>
  );
}

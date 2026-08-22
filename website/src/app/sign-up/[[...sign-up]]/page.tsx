import { SignUp } from "@clerk/nextjs";
import type { Metadata } from "next";
import { NOINDEX } from "@/lib/seo";

export const metadata: Metadata = NOINDEX;

export default function SignUpPage() {
  return (
    <div className="flex flex-1 items-center justify-center bg-slate-50 py-20">
      <SignUp />
    </div>
  );
}

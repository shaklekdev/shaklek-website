import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex flex-1 items-center justify-center bg-slate-50 py-20">
      <SignIn />
    </div>
  );
}

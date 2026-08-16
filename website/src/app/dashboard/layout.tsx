import { currentUser } from "@clerk/nextjs/server";
import { SignOutButton } from "@clerk/nextjs";

// proxy.ts already requires a signed-in Clerk session for every /dashboard
// route. This layer checks *which* signed-in emails are actually allowed
// in -- Clerk sign-up is open by default, so without this any Clerk user
// could reach staff tooling, not just the people running Shaklek.
const STAFF_EMAILS = (process.env.STAFF_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase();
  const allowed = Boolean(email && STAFF_EMAILS.includes(email));

  if (!allowed) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-slate-50 px-6 py-20 text-center font-sans">
        <p className="text-sm text-slate-500">
          {email
            ? `${email} isn't on the Shaklek staff list.`
            : "Not signed in."}
        </p>
        <SignOutButton>
          <button className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:border-slate-400 hover:text-slate-900">
            Sign out
          </button>
        </SignOutButton>
      </div>
    );
  }

  return <>{children}</>;
}

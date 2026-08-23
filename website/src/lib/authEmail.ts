import { currentUser } from "@clerk/nextjs/server";

// Every customer-facing authorization decision on this site is "does the
// signed-in user's email match the email on this row" -- customers are keyed
// by email, not by Clerk user id (see the comment in src/db/schema.ts).
//
// That is only safe if Clerk has actually PROVEN the address belongs to the
// person signed in. If the instance ever allows sign-up without email
// verification, anyone could register a victim's address and read their
// order history, measurements and name. Rather than depend on a Dashboard
// toggle staying correct, check the verification status here on every call.
//
// Returns null when there is no session, no primary address, or the primary
// address is unverified -- all of which callers already treat as "not
// authorized".
export async function getVerifiedEmail(): Promise<string | null> {
  let user;
  try {
    user = await currentUser();
  } catch {
    // currentUser() throws outright if clerkMiddleware never ran for this
    // route (i.e. the path is missing from the proxy matcher). Fail closed
    // rather than 500 -- the caller's unauthenticated branch is correct.
    return null;
  }
  if (!user) return null;

  const primary = user.emailAddresses.find((address) => address.id === user.primaryEmailAddressId);
  if (!primary) return null;
  if (primary.verification?.status !== "verified") return null;

  return primary.emailAddress;
}

// Same check, lowercased -- the staff allowlist compares case-insensitively.
export async function getVerifiedEmailLower(): Promise<string | null> {
  const email = await getVerifiedEmail();
  return email ? email.toLowerCase() : null;
}

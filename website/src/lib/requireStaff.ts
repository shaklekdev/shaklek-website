import "server-only";
import { notFound } from "next/navigation";
import { getVerifiedEmailLower } from "@/lib/authEmail";

/**
 * The staff check, in the DATA PATH. Call it as the first line of every loader
 * behind /dashboard. Do not rely on the layout.
 *
 * ⚠️ A LAYOUT DOES NOT STOP THE PAGE BENEATH IT FROM RUNNING. This is the whole
 * reason this file exists, and it is stated in Next's own shipped docs:
 * "A layout also does not control whether the rest of the route renders. Route
 * segments are rendered by the router, so a layout that hides or swaps them
 * does not stop them from running or from appearing in the RSC Payload."
 *
 * dashboard/layout.tsx returned a refusal screen without {children} and that
 * looked like a gate. It is not one. The page still executes, and its data is
 * embedded in the flight payload inside the HTML that the refusal screen is
 * delivered in. A security review on 2026-09-15 reproduced it against this
 * exact Next build: the browser paints "not authorized" and view-source
 * contains the rows.
 *
 * WHAT THAT MEANT IN PRACTICE. Clerk sign-up is open, because /account needs
 * it. Anyone could register, verify an email, open /dashboard/customers, and
 * read every customer's name, email and body measurements out of the page
 * source. proxy.ts hides /dashboard while STORE_OPEN is unset, so it is not
 * live today; it becomes live the moment step 0 of the launch checklist flips
 * the store on. /dashboard/orders and /dashboard/trends had the same hole
 * before this feature existed.
 *
 * ⚠️ notFound(), NOT a friendly refusal. A 404 does not confirm the route
 * exists, and unlike a rendered message it aborts the render rather than
 * finishing it and hiding the result.
 */

// Same list and comparison as dashboard/layout.tsx. An empty or unset
// STAFF_EMAILS yields [], and [].includes() is false, so the failure mode is
// DENY. Verified: "", undefined and " , " all produce an empty list.
const STAFF_EMAILS = (process.env.STAFF_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export async function requireStaff(): Promise<string> {
  const email = await getVerifiedEmailLower();
  if (!email || !STAFF_EMAILS.includes(email)) notFound();
  return email;
}

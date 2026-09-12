import { NextRequest, NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { getDb, schema } from "@/db/client";
import { isUuid } from "@/lib/requestGuards";
import { verifyWaitlistToken } from "@/lib/waitlistToken";

// THE CLICK THAT MAKES SOMEONE MAILABLE.
//
// A waitlist row is written unconfirmed, because anyone can type anyone's
// address into a public form. This is the only thing that sets confirmed_at,
// and only confirmed rows are ever pushed to Resend -- which is what keeps the
// launch Broadcast off the addresses of people who never asked, and keeps
// shaklek.com's sending reputation (shared with every order confirmation)
// intact.
//
// GET, not POST, because it is a link in an email and that is the only verb a
// mail client will follow. That makes it CSRF-shaped in principle: someone
// could get a third party to load the URL. It does not matter here -- the only
// effect is confirming a subscription the token already proves was requested,
// and the token is unguessable. There is no destructive verb behind it.
//
// ⚠️ /api/waitlist/confirm IS REACHABLE WHILE THE SHOP IS SHUT. API routes are
// never rewritten by src/proxy.ts, so this needs no allowlist entry. The page
// it redirects to DOES -- see OPEN_WHILE_SHUT.
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id") ?? "";
  const token = req.nextUrl.searchParams.get("t");

  // isUuid before the id reaches a query, per §0. A bad id and a bad token get
  // the SAME answer, so this cannot be used to discover which rows exist.
  if (!isUuid(id) || !verifyWaitlistToken(id, token)) {
    return NextResponse.redirect(new URL("/waitlist/confirmed?state=invalid", req.nextUrl.origin));
  }

  const db = getDb();
  if (!db) {
    console.error("[waitlist/confirm] no DATABASE_URL");
    return NextResponse.redirect(new URL("/waitlist/confirmed?state=error", req.nextUrl.origin));
  }

  let email: string | null = null;
  let alreadySynced = false;
  try {
    // Stamp confirmed_at ONCE. Clicking the link twice must not move the date,
    // and the returning() tells us whether this was the first time -- the same
    // shape as the delivered_at guard on orders. Stripe taught this lesson:
    // anything reachable more than once needs a gated transition.
    const [row] = await db
      .update(schema.waitlist)
      // COALESCE, not a bare assignment. A bare `new Date()` re-stamps on every
      // click, and the first version of this file did exactly that while its
      // own comment promised otherwise -- caught by clicking twice in testing.
      // The date has to mean "when she confirmed", not "when she last opened an
      // old email", or the only record of when consent was given moves every
      // time a link is re-followed. Same shape as the delivered_at guard on
      // orders, and the same reason: anything reachable more than once needs a
      // gated transition, not an unconditional write.
      //
      // A second click still succeeds and still says "confirmed", because from
      // her side nothing is wrong -- it just changes nothing.
      .set({ confirmedAt: sql`coalesce(${schema.waitlist.confirmedAt}, now())` })
      .where(eq(schema.waitlist.id, id))
      .returning({
        email: schema.waitlist.email,
        syncedAt: schema.waitlist.syncedAt,
      });
    if (!row) {
      return NextResponse.redirect(new URL("/waitlist/confirmed?state=invalid", req.nextUrl.origin));
    }
    email = row.email;
    alreadySynced = Boolean(row.syncedAt);
  } catch (err) {
    console.error("[waitlist/confirm] db update failed:", err instanceof Error ? err.message : "unknown");
    return NextResponse.redirect(new URL("/waitlist/confirmed?state=error", req.nextUrl.origin));
  }

  // Now, and only now, she goes on the mailing list.
  //
  // A failure here is NOT a failure of the confirmation. Her row is confirmed
  // in our database, which is the record that matters; synced_at stays null so
  // it can be retried without guessing who already made it across. Telling her
  // "something went wrong" when she is in fact confirmed would be a lie.
  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey && email && !alreadySynced) {
    try {
      const contact = await fetch("https://api.resend.com/contacts", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          unsubscribed: false,
          ...(process.env.RESEND_SEGMENT_ID ? { segments: [process.env.RESEND_SEGMENT_ID] } : {}),
        }),
      });
      const body = contact.ok ? "" : await contact.text();
      if (contact.ok || /exists|duplicate|already/i.test(body)) {
        await getDb()!
          .update(schema.waitlist)
          .set({ syncedAt: new Date() })
          .where(eq(schema.waitlist.id, id));
      } else {
        // Status and a parsed code only. A provider validation error can echo
        // the address it rejected, and CloudWatch outlives the signup.
        let code = "unknown";
        try {
          const parsed = JSON.parse(body);
          code = String(parsed?.name ?? parsed?.code ?? "unknown").slice(0, 60);
        } catch {
          /* not JSON */
        }
        console.error("[waitlist/confirm] contact create failed:", contact.status, code);
      }
    } catch (err) {
      console.error("[waitlist/confirm] contact create threw:", err instanceof Error ? err.message : "unknown");
    }
  }

  return NextResponse.redirect(new URL("/waitlist/confirmed?state=ok", req.nextUrl.origin));
}

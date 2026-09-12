import { NextRequest, NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { getDb, schema } from "@/db/client";
import { isUuid } from "@/lib/requestGuards";
import { verifyWaitlistToken } from "@/lib/waitlistToken";

// LEAVING THE LIST. This exists because the confirm email promises it.
//
// The copy used to say "nothing else, ever", which was restrictive but true.
// The founder changed it on 2026-09-12 — the list is for new drops too, not
// only the opening — so it now says "you can leave the list whenever you like".
// That sentence is a permission promise the moment it is written, and the way
// people express a broken one is a spam complaint against the same sending
// domain that carries every order confirmation.
//
// ⚠️ SO THIS IS NOT OPTIONAL AND IT IS NOT ENOUGH TO RELY ON BROADCASTS.
// Resend adds an unsubscribe to a Broadcast, but the confirm email goes through
// POST /emails as a transactional send, and a one-off drop announcement sent
// the same way would carry nothing. Every send from this route file therefore
// carries a List-Unsubscribe header pointing here, so the promise holds however
// the mail was sent rather than depending on anyone remembering.
//
// TWO VERBS, on purpose:
//   GET   a person clicking the link in an email
//   POST  RFC 8058 one-click, which Gmail and Apple Mail call themselves from
//         their own "unsubscribe" button without ever showing the page. That is
//         the one that actually keeps complaints down, because it turns "mark
//         as spam" into "unsubscribe" in the client's own UI.
async function unsubscribe(id: string, token: unknown): Promise<"ok" | "invalid" | "error"> {
  // isUuid before the id reaches a query. A bad id and a bad token get the same
  // answer, so this is not an oracle for which rows exist.
  if (!isUuid(id) || !verifyWaitlistToken(id, token, "unsubscribe")) return "invalid";

  const db = getDb();
  if (!db) {
    console.error("[waitlist/unsubscribe] no DATABASE_URL");
    return "error";
  }

  let email: string | null = null;
  try {
    // COALESCE, like confirmedAt: the date means "when she left", not "when she
    // last clicked an old link". Same gated-transition rule.
    //
    // The row is KEPT rather than deleted. A deleted row is re-created by any
    // later signup, which would silently re-subscribe somebody who left.
    const [row] = await db
      .update(schema.waitlist)
      .set({ unsubscribedAt: sql`coalesce(${schema.waitlist.unsubscribedAt}, now())` })
      .where(eq(schema.waitlist.id, id))
      .returning({ email: schema.waitlist.email });
    if (!row) return "invalid";
    email = row.email;
  } catch (err) {
    console.error("[waitlist/unsubscribe] db failed:", err instanceof Error ? err.message : "unknown");
    return "error";
  }

  // And tell Resend, so a Broadcast cannot reach her either. Our database is
  // the record; this keeps the copy honest. A failure here leaves her
  // unsubscribed with us, which is the half that legally matters, and is
  // recoverable by re-running the sync.
  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey && email) {
    try {
      const r = await fetch(`https://api.resend.com/contacts/${encodeURIComponent(email)}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ unsubscribed: true }),
      });
      if (!r.ok) console.error("[waitlist/unsubscribe] resend patch failed:", r.status);
    } catch (err) {
      console.error("[waitlist/unsubscribe] resend patch threw:", err instanceof Error ? err.message : "unknown");
    }
  }
  return "ok";
}

export async function GET(req: NextRequest) {
  const state = await unsubscribe(
    req.nextUrl.searchParams.get("id") ?? "",
    req.nextUrl.searchParams.get("t"),
  );
  return NextResponse.redirect(new URL(`/waitlist/unsubscribed?state=${state}`, req.nextUrl.origin));
}

// RFC 8058 one-click. The mail client sends `List-Unsubscribe=One-Click` as a
// form body and expects a 2xx; it never renders anything, so there is nothing
// to redirect to. No origin check here on purpose: the caller is Gmail's
// infrastructure, not a browser on our site, and the unguessable signed token
// is what authorizes it.
export async function POST(req: NextRequest) {
  const state = await unsubscribe(
    req.nextUrl.searchParams.get("id") ?? "",
    req.nextUrl.searchParams.get("t"),
  );
  if (state === "error") {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
  // "invalid" answers 200 as well. A mail client retrying a stale link should
  // not be told the address exists or does not, and the person has no way to
  // act on the difference.
  return NextResponse.json({ ok: true });
}

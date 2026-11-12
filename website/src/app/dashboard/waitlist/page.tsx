import { desc } from "drizzle-orm";
import { getDb, schema } from "@/db/client";
import { requireStaff } from "@/lib/requireStaff";

export const dynamic = "force-dynamic";

/**
 * The waitlist, for the founder (2026-11-12: "show me the list of these
 * people"), so she can see who signed up before the opening email goes out.
 *
 * ⚠️ THE STAFF CHECK LIVES IN THE LOADER, NOT IN THE LAYOUT (see
 * src/lib/requireStaff.ts): a layout does not stop this query from running or
 * its rows from reaching the RSC payload. notFound() for anyone else.
 *
 * Only "confirmed" addresses may be mailed (they proved the inbox is theirs);
 * unconfirmed ones are shown so she can count them, and unsubscribed ones are
 * flagged so nobody mails them by hand.
 */
async function getWaitlist() {
  await requireStaff();
  const db = getDb();
  if (!db) return null;
  return db
    .select({
      id: schema.waitlist.id,
      email: schema.waitlist.email,
      source: schema.waitlist.source,
      createdAt: schema.waitlist.createdAt,
      confirmedAt: schema.waitlist.confirmedAt,
      unsubscribedAt: schema.waitlist.unsubscribedAt,
    })
    .from(schema.waitlist)
    .orderBy(desc(schema.waitlist.createdAt));
}

const fmt = (d: Date | string | null) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : null;

export default async function WaitlistPage() {
  const rows = await getWaitlist();
  if (!rows) {
    return <p className="p-6 text-sm text-slate-600">Not available.</p>;
  }

  const confirmed = rows.filter((r) => r.confirmedAt && !r.unsubscribedAt).length;

  return (
    <div className="mx-auto w-full max-w-5xl p-6">
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="text-xl font-medium text-slate-900">Waitlist</h1>
        <p className="text-sm text-slate-500">
          {rows.length} total · {confirmed} confirmed (can be emailed)
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="mt-8 text-sm text-slate-600">Nobody on the waitlist yet.</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="py-2 pr-4 font-medium">Email</th>
                <th className="py-2 pr-4 font-medium">Signed up</th>
                <th className="py-2 pr-4 font-medium">Status</th>
                <th className="py-2 font-medium">From</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-slate-100">
                  <td className="py-3 pr-4 text-slate-900">{r.email}</td>
                  <td className="py-3 pr-4 text-slate-700">{fmt(r.createdAt)}</td>
                  <td className="py-3 pr-4">
                    {r.unsubscribedAt ? (
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">Unsubscribed</span>
                    ) : r.confirmedAt ? (
                      <span className="rounded bg-emerald-50 px-2 py-0.5 text-xs text-emerald-800 ring-1 ring-inset ring-emerald-200">
                        Confirmed
                      </span>
                    ) : (
                      <span className="rounded bg-amber-50 px-2 py-0.5 text-xs text-amber-800 ring-1 ring-inset ring-amber-200">
                        Not confirmed
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-slate-500">{r.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

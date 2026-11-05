/**
 * Meta Conversions API, OPTION A (founder, 2026-11-05).
 *
 * The server sends the SAME events the pixel sends, for the SAME visitors, so
 * that an ad blocker or Safari's tracking prevention does not hide a sale from
 * Meta. It is a second delivery route, not more data:
 *
 * - ONLY WITH CONSENT. Every event requires the visitor to have accepted the
 *   cookie bar. The browser says so at checkout (`adConsent: true`), and the
 *   order carries that flag to the webhook in Stripe metadata. No flag, no event.
 * - NO EMAIL, NO PHONE, NO NAME. user_data is limited to what the pixel itself
 *   gives Meta: the _fbp/_fbc cookie ids, the IP address and the user agent.
 *   Sending hashed email/phone ("option B", Advanced Matching) would make the
 *   cookie bar's "they tell us nothing about who you are" false; she chose A.
 * - DEDUPLICATED. Each event carries the same event_id as its pixel twin, so
 *   Meta counts a purchase once whichever route reaches it first.
 * - NEVER IN THE WAY. A Meta outage must not slow or break checkout or the
 *   webhook: short timeout, every error swallowed and logged without PII.
 *
 * Needs META_CAPI_TOKEN (server only, in the build-spec allowlist) and the
 * pixel id. META_CAPI_TEST_CODE, set on staging only, routes events to Events
 * Manager > Test events instead of the live dataset.
 */

const GRAPH = "https://graph.facebook.com/v21.0";

export type CapiUser = {
  fbp?: string | null;
  fbc?: string | null;
  ip?: string | null;
  ua?: string | null;
};

// _fbp looks like fb.1.1700000000000.1234567890, _fbc like fb.1.1700000000000.AbCd...
const FB_COOKIE = /^fb\.\d\.\d{10,13}\.[A-Za-z0-9_\-.]{1,200}$/;

/** Keep only well-formed cookie ids; anything else from the body is dropped. */
export function cleanFbCookie(v: unknown): string | null {
  return typeof v === "string" && v.length <= 240 && FB_COOKIE.test(v) ? v : null;
}

/** An event id we minted on the client: short, boring characters only. */
export function cleanEventId(v: unknown): string | null {
  return typeof v === "string" && /^[A-Za-z0-9_\-]{6,64}$/.test(v) ? v : null;
}

export async function sendCapiEvent(ev: {
  name: "InitiateCheckout" | "Purchase";
  eventId: string;
  sourceUrl: string;
  user: CapiUser;
  value: number;
  contentIds: string[];
  numItems: number;
  orderId?: string;
}): Promise<void> {
  const token = process.env.META_CAPI_TOKEN;
  const pixel = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  if (!token || !pixel) return; // not configured: a silent no-op, like the pixel
  if (!ev.user.ua) return; // Meta rejects website events without a user agent

  const user_data: Record<string, string> = { client_user_agent: ev.user.ua.slice(0, 400) };
  if (ev.user.ip) user_data.client_ip_address = ev.user.ip;
  if (ev.user.fbp) user_data.fbp = ev.user.fbp;
  if (ev.user.fbc) user_data.fbc = ev.user.fbc;

  const body: Record<string, unknown> = {
    // In the body, not the URL, so an error message can never carry it.
    access_token: token,
    data: [
      {
        event_name: ev.name,
        event_time: Math.floor(Date.now() / 1000),
        event_id: ev.eventId,
        action_source: "website",
        event_source_url: ev.sourceUrl,
        user_data,
        custom_data: {
          currency: "AED",
          value: Math.round(ev.value * 100) / 100,
          content_type: "product",
          content_ids: ev.contentIds.slice(0, 20),
          num_items: ev.numItems,
          ...(ev.orderId ? { order_id: ev.orderId } : {}),
        },
      },
    ],
  };
  if (process.env.META_CAPI_TEST_CODE) body.test_event_code = process.env.META_CAPI_TEST_CODE;

  try {
    const res = await fetch(`${GRAPH}/${pixel}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) {
      // Status and Meta's error code only: the body can echo the payload.
      let code = "unknown";
      try {
        const j = await res.json();
        code = String(j?.error?.code ?? "unknown").slice(0, 20);
      } catch {
        /* keep "unknown" */
      }
      console.error(`[capi] ${ev.name} rejected: ${res.status} code ${code}`);
    }
  } catch (err) {
    console.error(`[capi] ${ev.name} not sent:`, err instanceof Error ? err.name : "unknown");
  }
}

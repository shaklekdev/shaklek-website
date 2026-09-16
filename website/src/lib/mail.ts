import { appUrl } from "@/lib/appUrl";

// One place that knows what a Shaklek email looks like.
//
// ⚠️ WHY HTML AT ALL. The first version sent plain text, which cannot put a
// link behind a word. A 90-character signed URL printed in full wraps across
// four lines on a phone and reads like phishing. Founder, 2026-09-13: "the
// links don't be plain, shorten them under something like 'verify me'".
// Every send carries a plain-text alternative too, because some clients refuse
// HTML and a blank email is worse than an ugly one.
//
// ⚠️ AND WHY IT LOOKS PLAIN. No logo image, no wide coloured header, no three
// columns. A first email from an unknown sender that arrives looking like a
// newsletter template is the one people report. This is a short letter with one
// button, which is what a person expects after typing their address into a box.
//
// ⚠️ THAT RULE SURVIVED THE 2026-09-16 REDESIGN, and it is the reason the
// redesign is as small as it is. Founder: "let's make the email confirmations
// and orders look nice as well". What changed is a gold hairline under the
// wordmark, a serif heading, real spacing rhythm, and an item table for orders.
// What deliberately did NOT change: still no logo image, still one column,
// still no coloured band. "Nice" here means a well-set letter, not a campaign.
//
// ⚠️ AND THE ORDER CONFIRMATION NOW COMES THROUGH HERE TOO. Until that day it
// was hand-built HTML inside lib/orderEmail.ts with its own fonts, its own
// greys and its own width, so the two emails a customer actually receives --
// "confirm your email" and "your order is confirmed" -- looked like they came
// from different companies. Anything customer-facing goes through buildEmail.
// The three STAFF emails (new order, reconcile alert, new account) do not:
// they are read by one person who needs the facts, and dressing them up only
// makes a 3am alert slower to scan.
//
// ⚠️ EMAIL HTML IS NOT WEB HTML. Tables, not flexbox or grid. Inline styles,
// because Gmail strips <style> blocks in several contexts. No external CSS, no
// web fonts -- Cormorant is not installed on anyone's phone, so the serif
// stack falls back to Georgia, which is the right shape anyway.

type Button = { label: string; url: string };

/** One line item on an order. `spec` is the fabric/colour/size line under it. */
export type MailRow = { name: string; spec?: string; amount: string };

const FOOT = "Shaklek, Dubai";

// The site's own tokens, from globals.css, so an email and the page it links to
// are recognisably the same brand: text #1a1a1a, muted #6b6b6b, faint #a0a0a0,
// gold #9c8445. The two backgrounds are warmer than the site's white because an
// email is read inside someone else's chrome and a pure-white card on a
// pure-white client disappears.
const INK = "#1a1a1a";
const MUTED = "#6b6b6b";
const FAINT = "#a0a0a0";
const GOLD = "#9c8445";
const PAPER = "#fffdf8";
const OUTER = "#f4f1ea";
const RULE = "#e8e1d3";

const SANS =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
// Cormorant Garamond is the site's display face and is not installed anywhere,
// so this is the fallback chain it would land on regardless. Named first anyway
// for the handful of desktop clients that do use installed fonts.
const SERIF = "'Cormorant Garamond',Georgia,'Times New Roman',serif";

/**
 * ⚠️ UNSUBSCRIBE IS NOT ON EVERY EMAIL, AND THAT IS DELIBERATE.
 *
 * Founder, 2026-09-13: "we put the link for confirmation, and then on any
 * future emails we put the option to unsubscribe, this is how it works."
 * She is right, and the first version had it backwards.
 *
 * A confirmation is TRANSACTIONAL: it is the direct answer to something the
 * person did ten seconds ago, and offering to remove her from a list she has
 * not yet joined is confusing at best. Marketing sends are different and must
 * always carry one.
 *
 * The List-Unsubscribe HEADER still goes on everything. It is invisible to the
 * reader, it is what Gmail's own unsubscribe button uses, and mailbox providers
 * treat its presence as a good-sender signal. Removing the visible line does
 * not remove the ability to leave.
 */
export type MailKind = "transactional" | "marketing";

export function buildEmail(opts: {
  kind: MailKind;
  /** Inbox preview text. Never left empty: the client falls back to the first
   *  words of the body, which for an order is a reference number. */
  preheader: string;
  /** Serif headline under the wordmark. Optional -- a two-line note does not
   *  need one, and a heading on a one-sentence email reads as shouting. */
  heading?: string;
  /** Small caps line under the heading, e.g. an order reference. */
  eyebrow?: string;
  lines: string[];
  /** Order lines. Rendered as a table with hairline separators. */
  rows?: MailRow[];
  /** Right-aligned figures under the table. `strong` is the final total. */
  totals?: { label: string; amount: string; strong?: boolean }[];
  button?: Button;
  /** A quiet panel after the button, for a secondary offer. */
  note?: { lines: string[]; button?: Button };
  unsubscribeUrl?: string;
}) {
  const {
    kind, preheader, heading, eyebrow, lines,
    rows, totals, button, note, unsubscribeUrl,
  } = opts;
  // esc() is for TEXT nodes. It does NOT escape quotes, so it must never be
  // used inside an attribute -- escAttr exists so the next person cannot get
  // that wrong. Today both hrefs are built from a Postgres uuid and an HMAC
  // with no request field anywhere near them, but "safe because of who happens
  // to call it" is how the prototype-key bug got in.
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const escAttr = (s: string) => esc(s).replace(/"/g, "&quot;");

  const showUnsub = kind === "marketing" && unsubscribeUrl;

  // One button, rendered the same wherever it appears. `padding` on the anchor
  // rather than a nested table: it loses Outlook's exact box but keeps every
  // other client simple, and Outlook still renders a tappable dark rectangle.
  const btn = (b: Button, bg: string) =>
    `<a href="${escAttr(b.url)}" style="display:inline-block;background:${bg};color:#ffffff;text-decoration:none;font-family:${SANS};font-size:15px;line-height:1;padding:15px 30px;">${esc(b.label)}</a>`;

  const rowsHtml = rows?.length
    ? `<tr><td style="padding:4px 32px 0;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
  ${rows
    .map(
      (r) => `<tr>
    <td style="padding:14px 0;border-bottom:1px solid ${RULE};font-family:${SANS};vertical-align:top;">
      <div style="font-size:15px;color:${INK};">${esc(r.name)}</div>${
        r.spec
          ? `\n      <div style="font-size:12px;line-height:1.5;color:${MUTED};margin-top:3px;">${esc(r.spec)}</div>`
          : ""
      }
    </td>
    <td style="padding:14px 0;border-bottom:1px solid ${RULE};font-family:${SANS};font-size:15px;color:${INK};text-align:right;white-space:nowrap;vertical-align:top;">${esc(r.amount)}</td>
  </tr>`,
    )
    .join("\n  ")}
  </table>
</td></tr>`
    : "";

  const totalsHtml = totals?.length
    ? `<tr><td style="padding:14px 32px 0;font-family:${SANS};text-align:right;">
  ${totals
    .map(
      (t) =>
        `<div style="font-size:${t.strong ? "17" : "13"}px;color:${t.strong ? INK : MUTED};margin-top:${t.strong ? "6" : "0"}px;">${esc(t.label)} ${esc(t.amount)}</div>`,
    )
    .join("\n  ")}
</td></tr>`
    : "";

  const noteHtml = note
    ? `<tr><td style="padding:28px 32px 0;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${OUTER};">
  <tr><td style="padding:22px 24px;font-family:${SANS};font-size:14px;line-height:1.6;color:${INK};">
    ${note.lines.map((l) => `<p style="margin:0 0 14px;">${esc(l)}</p>`).join("\n    ")}${
      note.button ? `\n    ${btn(note.button, INK)}` : ""
    }
  </td></tr>
  </table>
</td></tr>`
    : "";

  const html = `<!doctype html>
<html><body style="margin:0;padding:0;background:${OUTER};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${OUTER};padding:32px 16px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:${PAPER};border:1px solid ${RULE};">
<tr><td style="padding:36px 32px 0;">
  <div style="font-family:${SERIF};font-size:26px;letter-spacing:3px;color:${INK};">Shaklek</div>
  <div style="height:1px;background:${GOLD};width:34px;margin-top:14px;font-size:0;line-height:0;">&nbsp;</div>
</td></tr>${
    heading
      ? `
<tr><td style="padding:26px 32px 0;">
  <div style="font-family:${SERIF};font-size:27px;line-height:1.2;color:${INK};">${esc(heading)}</div>${
    eyebrow
      ? `\n  <div style="font-family:${SANS};font-size:12px;letter-spacing:1.4px;color:${MUTED};margin-top:8px;text-transform:uppercase;">${esc(eyebrow)}</div>`
      : ""
  }
</td></tr>`
      : ""
  }
<tr><td style="padding:${heading ? "18" : "26"}px 32px 0;font-family:${SANS};font-size:15px;line-height:1.65;color:${MUTED};">
  ${lines.map((l) => `<p style="margin:0 0 16px;">${esc(l)}</p>`).join("\n  ")}
</td></tr>
${rowsHtml}${totalsHtml}${
    button
      ? `
<tr><td style="padding:16px 32px 0;">
  ${btn(button, INK)}
</td></tr>`
      : ""
  }${noteHtml}
<tr><td style="padding:32px 32px 32px;">
  <div style="border-top:1px solid ${RULE};padding-top:18px;font-family:${SANS};font-size:12px;line-height:1.6;color:${FAINT};">
    ${FOOT}${
      showUnsub
        ? ` &middot; <a href="${escAttr(unsubscribeUrl)}" style="color:${FAINT};">Unsubscribe</a>`
        : ""
    }
  </div>
</td></tr>
</table>
</td></tr>
</table>
</body></html>`;

  // The plain-text alternative DOES print the URL, because there is nowhere
  // else for it to go. It is the fallback, not the thing most people see.
  const text = [
    ...(heading ? [heading, ...(eyebrow ? [eyebrow] : []), ""] : []),
    ...lines,
    ...(rows?.length
      ? ["", ...rows.map((r) => `${r.name}${r.spec ? ` (${r.spec})` : ""} — ${r.amount}`)]
      : []),
    ...(totals?.length ? ["", ...totals.map((t) => `${t.label} ${t.amount}`)] : []),
    ...(button ? ["", `${button.label}: ${button.url}`] : []),
    ...(note ? ["", ...note.lines, ...(note.button ? [`${note.button.label}: ${note.button.url}`] : [])] : []),
    "",
    FOOT,
    ...(showUnsub ? [`Unsubscribe: ${unsubscribeUrl}`] : []),
  ].join("\n");

  return { html, text };
}

/** The List-Unsubscribe pair. Goes on EVERY send, visible link or not. */
export function unsubscribeHeaders(url: string) {
  return {
    "List-Unsubscribe": `<${url}>`,
    // RFC 8058 one-click: Gmail and Apple Mail call the URL from their own
    // button. It is what turns "mark as spam" into "unsubscribe" in the client.
    "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
  };
}

export function absolute(path: string) {
  return `${appUrl()}${path}`;
}

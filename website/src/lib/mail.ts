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

type Button = { label: string; url: string };

const FOOT = "Shaklek, Dubai";

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
  preheader: string;
  lines: string[];
  button?: Button;
  unsubscribeUrl?: string;
}) {
  const { kind, preheader, lines, button, unsubscribeUrl } = opts;
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const showUnsub = kind === "marketing" && unsubscribeUrl;

  const html = `<!doctype html>
<html><body style="margin:0;padding:0;background:#f4f1ea;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f1ea;padding:32px 16px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#fffdf8;border:1px solid #ddd6c7;">
<tr><td style="padding:36px 32px 8px;">
  <div style="font-family:Georgia,'Times New Roman',serif;font-size:26px;letter-spacing:3px;color:#1c1f26;">Shaklek</div>
</td></tr>
<tr><td style="padding:8px 32px 4px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#3a3730;">
  ${lines.map((l) => `<p style="margin:0 0 16px;">${esc(l)}</p>`).join("\n  ")}
</td></tr>
${
  button
    ? `<tr><td style="padding:12px 32px 8px;">
  <a href="${button.url}" style="display:inline-block;background:#1c1f26;color:#ffffff;text-decoration:none;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;padding:14px 28px;">${esc(button.label)}</a>
</td></tr>`
    : ""
}
<tr><td style="padding:24px 32px 32px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:12px;line-height:1.6;color:#8d8679;border-top:1px solid #eee8dc;">
  ${FOOT}${
    showUnsub
      ? ` &middot; <a href="${unsubscribeUrl}" style="color:#8d8679;">Unsubscribe</a>`
      : ""
  }
</td></tr>
</table>
</td></tr>
</table>
</body></html>`;

  // The plain-text alternative DOES print the URL, because there is nowhere
  // else for it to go. It is the fallback, not the thing most people see.
  const text = [
    ...lines,
    ...(button ? ["", `${button.label}: ${button.url}`] : []),
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

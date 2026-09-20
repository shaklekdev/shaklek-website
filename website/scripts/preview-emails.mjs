// Render every CUSTOMER-facing email to an .html file so it can be opened and
// looked at.
//
// ⚠️ THIS EXISTS BECAUSE THE ONLY RESEND KEY ON THIS PROJECT IS THE PRODUCTION
// ONE. CLAUDE.md forbids test sends against production, so "let's see what the
// email looks like" has no send-based answer. It renders the SAME builders the
// senders call -- lib/mail.ts and buildCustomerConfirmation -- so what is
// reviewed is what ships.
//
// ⚠️ IT SENDS NOTHING AND TOUCHES NO NETWORK. Keep it that way.
//
//   npx tsx scripts/preview-emails.mjs && open .email-preview/index.html
// ⚠️ RUN IT WITH tsx, NOT node: `npx tsx scripts/preview-emails.mjs`. It
// imports .ts modules directly so the preview cannot drift from the sender,
// and tsx is what resolves both the types and the "@/" path alias.
import { mkdirSync, writeFileSync } from "node:fs";
import { buildEmail } from "../src/lib/mail.ts";
import { buildCustomerConfirmation } from "../src/lib/orderEmail.ts";

const OUT = ".email-preview";
mkdirSync(OUT, { recursive: true });

const APP = "https://www.shaklek.com";
const CONFIRM = `${APP}/api/waitlist/confirm?id=11111111-2222-3333-4444-555555555555&t=EXAMPLE`;
const UNSUB = `${APP}/api/waitlist/unsubscribe?id=11111111-2222-3333-4444-555555555555&t=EXAMPLE`;

const emails = [
  {
    file: "order-confirmation.html",
    label: "Order confirmed (customer)",
    subject: "Your Shaklek order is confirmed",
    ...buildCustomerConfirmation({
      items: [
        { name: "Oversized Shirt", fabric: "Linen", color: "Ivory", size: "Tailored",
          price: 449, quantity: 1, changes: ["Long sleeve", "Longer length"] },
        { name: "Wide-leg Trousers", fabric: "Linen", color: "Navy", size: "M",
          price: 519, quantity: 2, changes: ["Cropped"] },
      ],
      total: 1487,
      email: "customer@example.com",
      appUrl: APP,
      ref: "SHK-4F2A9C",
    }),
  },
  {
    file: "waitlist-confirm.html",
    label: "Confirm your email (waitlist)",
    subject: "Confirm your email, and we will tell you when we open",
    ...buildEmail({
      kind: "transactional",
      preheader: "One tap and you are on the list.",
      lines: [
        "Thank you for asking.",
        "We are Shaklek. 100% linen, cut to your shape, made here in the UAE, and nothing cut before somebody wants it.",
        "Tap below and we will tell you the day we open.",
        "If you did not ask for this, ignore it and you will never hear from us again.",
      ],
      button: { label: "Confirm my email", url: CONFIRM },
    }),
  },
  {
    file: "waitlist-already.html",
    label: "Already on the list (waitlist)",
    subject: "You are already on the list",
    ...buildEmail({
      kind: "marketing",
      preheader: "You are already on the list.",
      lines: ["Nothing to do, then. We will write the day we open, and now and then when there is something new."],
      unsubscribeUrl: UNSUB,
    }),
  },
];

for (const e of emails) writeFileSync(`${OUT}/${e.file}`, e.html);

// One index so all of them can be seen side by side at phone width, which is
// where they are actually read.
writeFileSync(
  `${OUT}/index.html`,
  `<!doctype html><meta charset="utf-8"><title>Shaklek email previews</title>
<style>body{margin:0;font:14px -apple-system,sans-serif;background:#222;color:#eee}
h2{font-size:13px;font-weight:500;margin:0 0 6px;color:#bbb}
small{color:#888;display:block;margin-bottom:8px}
.row{display:flex;gap:20px;padding:24px;overflow-x:auto}
iframe{width:400px;height:760px;border:0;background:#fff;flex:0 0 auto}</style>
<div class="row">${emails
    .map(
      (e) =>
        `<div><h2>${e.label}</h2><small>Subject: ${e.subject}</small><iframe src="${e.file}"></iframe></div>`,
    )
    .join("")}</div>`,
);

console.log(`Rendered ${emails.length} emails to ${OUT}/ — open ${OUT}/index.html`);

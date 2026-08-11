# Payment & Authentication — TODO

Status: neither exists for real yet. Checkout has a payment method *picker* with no gateway behind it; there are no customer accounts at all (fully guest flow). **Both provider decisions below are now made** — driven by one overriding constraint: this will be maintained by one person, so "easiest to keep running" beat "purest AWS" or "cheapest on paper" every time it came up.

## Payment

### Gateway — decided: Stripe
- [x] **Stripe** — chosen over Telr/PayTabs. Reasoning: best documentation and developer experience by a wide margin, **Stripe Checkout** is a hosted payment page that removes almost all PCI compliance burden (Shaklek's code never touches card details), and Stripe now settles in AED and operates in the UAE directly. Telr/PayTabs are UAE-local and may integrate more natively with some local banks, but cost more in integration and maintenance effort for a solo maintainer, without a clear offsetting advantage at pilot scale.
- [ ] Create the Stripe merchant account (real business details needed — ties to the still-pending incorporation decision in the business dossier's checklist)
- [ ] Wire Stripe Checkout into `/checkout` — the UI (Apple Pay / Card / Tabby selection) already exists in `CheckoutForm.tsx`; Apple Pay and card both run through Stripe Checkout directly, Stripe's own Apple Pay support included
- [ ] **Tabby (BNPL)** — Stripe doesn't bundle UAE BNPL natively, so this stays a separate direct integration/commercial agreement, per dossier §11. Not a blocker to shipping Stripe first — add it as a fast-follow once card checkout works.
- [ ] Webhook handling for payment success/failure (see `backend-todo.md`) — Stripe's webhook events (`checkout.session.completed`, etc.) drive this
- [ ] Refund path — dossier policy is refund-only-if-an-order-is-never-produced; call Stripe's refund API when that specific case happens, and nothing else

### What NOT to build
Per dossier §11, the refund mechanic itself doesn't need custom engineering — Stripe (and Tabby/Tamara separately) support standard refunds via their existing APIs. Don't build a bespoke refund system.

## Authentication

### Customer accounts — decided: Clerk
- [ ] Currently there are none — checkout is fully guest. Needed for: order history, the "digital wardrobe" retention feature (dossier §10), saved measurements, Shaklek+ subscription state
- [x] **Clerk**, chosen over Cognito and over Auth.js/NextAuth. Reasoning: Cognito is the "stays inside AWS" option but has real, well-known developer-experience friction for custom flows — not worth it for a solo maintainer. Auth.js is free and flexible but self-hosted: you own the session logic, the database adapter tables, and keeping it patched. Clerk is a fully managed service — prebuilt sign-in UI, session handling, and magic-link/social login all done for you — which means the least ongoing maintenance of the three, and its free tier (currently ~10k monthly active users) comfortably covers pilot scale. "Easiest" and "cheapest" point the same direction here, which is why it won over Auth.js despite Auth.js being nominally free.
- [ ] Magic link as the primary sign-in method — fits the low-friction brand positioning best, and is a built-in Clerk flow, not custom code

### Staff accounts (separate system)
- [ ] Tailors need their own lightweight login for the swipe tool (`backend-todo.md`) — different permissions from customer accounts, should not share the same auth flow
- [ ] Admin/stylist accounts for the ops dashboard

### Data privacy tie-in
- [ ] Whatever auth system is chosen needs to handle the PDPL consent requirements already documented for body-measurement data (dossier §11, also covered in `/legal/privacy` on the live site) — this isn't a separate concern, it has to be built into the account/consent flow from the start.

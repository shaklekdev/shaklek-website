# AWS Cloud Infrastructure — TODO

Status: **nothing is deployed anywhere yet.** The site only exists as code on this machine. `shaklek.com` is purchased and protected, but currently shows nothing (or a registrar parking page) — this is the most urgent item on this whole list if the goal is to actually show people something live.

**See [`aws-architecture-diagram.html`](./aws-architecture-diagram.html) for the full visual architecture** — every component, what's built vs. decided vs. open, and which pieces are genuinely AWS versus external APIs AWS-hosted code happens to call.

This plan is deliberately sized for a pre-revenue pilot, not a scaled business — real AWS, priced for near-zero traffic, not a toy and not overbuilt. Revisit sizing once there's real order volume.

## Revision note
Originally scoped around a raw EC2 instance. Switched to **AWS Amplify** instead — it's AWS's own managed hosting product, purpose-built for apps like this one (automatic HTTPS, CDN, CI/CD from git, no manual server/Nginx/process-manager setup). Gets the same "real AWS, cost-optimized" goal with close to none of raw EC2's manual operational overhead, and likely cheaper at near-zero traffic since it's usage-priced rather than a server running 24/7.

## AI: Google Gemini API (Nano Banana), not Amazon Bedrock
**Superseded 12 August 2026.** Previously decided Amazon Bedrock (Claude + Nova Canvas, itself a correction from an earlier Titan Image Generator reference) — now moved to the **Google Gemini API** for both text and image, external to AWS entirely. Reasoning:
- Nano Banana's specific strength is consistent, targeted image edits — change one thing on a garment photo, keep everything else identical — a better technical fit for the live customization preview than Nova Canvas was. Not a lateral swap, a real capability upgrade for the core product loop.
- Text parsing moved too, for operational simplicity: one external AI vendor (Google) instead of splitting across AWS Bedrock (Claude) and Google (images). Consistent with this project's running pattern of favoring least ongoing maintenance for a solo founder (same logic as Clerk over Cognito, Stripe over Telr).
- The real cost of this move: AI no longer shares AWS's bill or IAM. It's a genuine external dependency now, same category as Clerk and Stripe — own account, own outage surface, own bill. That's a real trade-off, not a free upgrade.
- Two callers, same API: Amplify calls Gemini synchronously for live customization parsing + preview generation during a customer session; the weekly Lambda trend-intake job calls Gemini to analyze trend signals and regenerate an inspired (not copied) candidate image. See `aws-architecture-diagram.html` for the full flow, and `ai-integration-todo.md` for the product-level detail.
- Open item: confirm exactly which Gemini image model/tier is in use (Nano Banana vs. Nano Banana Pro have different free-tier terms) before this becomes a real cost line.

## Immediate: get the site live at all
- [ ] **AWS Amplify Hosting** — connect the Next.js project (`~/Desktop/Shaklek/website`), deploys automatically on every push, HTTPS and CDN handled automatically
- [ ] Point `shaklek.com`'s DNS at the Amplify app (Route 53, or keep DNS at GoDaddy and just add the record — doesn't require moving registrars)
- [ ] **AWS Budgets + a billing alarm**, set up on day one, before anything else goes live

## Database
- [ ] **RDS Postgres**, `db.t4g.micro`, single-AZ, no read replica — holds the orders/customer tables from `backend-todo.md`
- [x] Backend schema + persistence code is now ready (`website/src/db/schema.ts`, wired into `/api/orders`) — the sequencing note below is satisfied; provisioning RDS is now unblocked whenever the cost is approved (see cost-guardrail rule — state the exact monthly figure before creating it)

## Storage
- [ ] **S3 bucket** for catalog images and uploaded reference photos — genuinely a small task: create the bucket, attach an IAM permission so Amplify can write to it, swap `/api/custom-requests` from base64-emailing images to uploading them to S3 instead. Not the same scope as the database work.

## Authentication — decided: Clerk, not yet built
- [x] **Clerk** over Cognito and Auth.js — outside the AWS umbrella, but the least ongoing maintenance of the three for a solo maintainer (managed sign-in UI, sessions, magic link all handled), and its free tier covers pilot scale. See `payment-auth-todo.md` for the full reasoning. Needed for customer accounts and separate staff logins (tailor swipe tool, admin dashboard, trend review dashboard).

## Payment gateway — decided: Stripe, likely blocked on incorporation
- [x] **Stripe** over Telr/PayTabs — best docs, Stripe Checkout removes most PCI burden, settles in AED. See `payment-auth-todo.md` for the full reasoning. Most gateways require a registered business entity for a real merchant account, so account creation is still gated on the incorporation decision, not a purely technical one.

## Email
- [x] Already handled outside AWS — Microsoft 365 (`hello@`, `orders@`, `support@shaklek.com`) is already purchased and configured. No need for SES unless/until transactional volume from the app itself gets large — **Resend is already wired into the code** (`backend-todo.md`), just needs an API key.

## Cost discipline
- [ ] On-demand / usage-based pricing only — no Reserved Instance or Savings Plan commitment until there's a real, predictable traffic pattern to commit against
- [ ] No multi-AZ redundancy until real concurrent traffic or uptime requirements justify the added cost — matches the same capacity-paced philosophy the business dossier applies to tailor recruiting and ad spend
- [ ] Rough target: still roughly **$30–50/month or less** at pilot scale, likely on the lower end of that given Amplify's usage-based pricing versus a 24/7 EC2 instance. Re-check once real usage exists.

## Sequencing note
Originally: don't build the RDS database until `backend-todo.md`'s schema work is actually ready to use it. **Satisfied as of 2026-08-13** — schema and persistence code exist and degrade gracefully without a live database, so the only remaining step is provisioning RDS itself (cost-gated, see Database section above).

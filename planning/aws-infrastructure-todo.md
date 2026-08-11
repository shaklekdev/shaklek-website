# AWS Cloud Infrastructure — TODO

Status: **nothing is deployed anywhere yet.** The site only exists as code on this machine. `shaklek.com` is purchased and protected, but currently shows nothing (or a registrar parking page) — this is the most urgent item on this whole list if the goal is to actually show people something live.

**See [`aws-architecture-diagram.html`](./aws-architecture-diagram.html) for the full visual architecture** — every component, what's built vs. decided vs. open, and which pieces are genuinely AWS versus external APIs AWS-hosted code happens to call.

This plan is deliberately sized for a pre-revenue pilot, not a scaled business — real AWS, priced for near-zero traffic, not a toy and not overbuilt. Revisit sizing once there's real order volume.

## Revision note
Originally scoped around a raw EC2 instance. Switched to **AWS Amplify** instead — it's AWS's own managed hosting product, purpose-built for apps like this one (automatic HTTPS, CDN, CI/CD from git, no manual server/Nginx/process-manager setup). Gets the same "real AWS, cost-optimized" goal with close to none of raw EC2's manual operational overhead, and likely cheaper at near-zero traffic since it's usage-priced rather than a server running 24/7.

## AI: Amazon Bedrock, not the direct Anthropic API
Decided **Amazon Bedrock** over calling Anthropic directly. Reasoning:
- Pricing is roughly at parity — Bedrock doesn't add a real discount at pilot scale (only kicks in with Provisioned Throughput at high committed volume), so this isn't a cost call.
- The real reason is **multi-model access**: two distinct AI needs exist — Claude for text/reasoning, and image generation for design previews and trend-candidate regeneration. Claude doesn't generate images. Bedrock hosts both Claude *and* Titan Image Generator behind one AWS-native API, so both needs are met without adding a second, non-AWS vendor.
- Practical upside: shows up on the one AWS bill, shares IAM with everything else Amplify/Lambda already touch, no separate vendor account/API key to manage outside AWS.
- Two callers, same service: Amplify calls Bedrock synchronously for live customization parsing + preview generation during a customer session; the weekly Lambda trend-intake job calls Bedrock to analyze trend signals and regenerate an inspired (not copied) candidate image. See `aws-architecture-diagram.html` for the full flow, and `ai-integration-todo.md` for the product-level detail.

## Immediate: get the site live at all
- [ ] **AWS Amplify Hosting** — connect the Next.js project (`~/Desktop/Shaklek/website`), deploys automatically on every push, HTTPS and CDN handled automatically
- [ ] Point `shaklek.com`'s DNS at the Amplify app (Route 53, or keep DNS at GoDaddy and just add the record — doesn't require moving registrars)
- [ ] **AWS Budgets + a billing alarm**, set up on day one, before anything else goes live

## Database
- [ ] **RDS Postgres**, `db.t4g.micro`, single-AZ, no read replica — holds the orders/customer/tailor tables from `backend-todo.md`
- [ ] Don't build this until the backend schema work is actually ready to use it (see Sequencing note below)

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
Don't build the RDS database until `backend-todo.md`'s schema work is actually ready to use it — standing up infrastructure ahead of the code that needs it is exactly the kind of premature spend this whole project has otherwise been careful to avoid. Get Amplify hosting live first; everything else follows from there.

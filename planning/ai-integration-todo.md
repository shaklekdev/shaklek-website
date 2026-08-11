# AI Integration — TODO

Status: **zero real AI exists in the product today**, and per the business dossier (§13), that's deliberate — Phase 1 is a human-run "Concierge MVP" on purpose, to validate the co-design loop before investing in the hard engineering. Don't skip ahead of this without a real reason.

## Where things actually stand
- Quick Customize on the design page simulates variation by cycling a hardcoded local color list — not AI, just a UI stand-in
- The "tell us what you'd like changed" field and the upload flow both route to a human stylist by email — this **is** the Phase 1 model working as intended, not a gap to rush past

## Phase 2 — Assisted AI (per dossier §13, only after Phase 1 data exists)
- [ ] **Structured design-spec schema** — the shared format that chat, the visualization, and the tailor spec sheet all read from. Needs to be defined before any of the below can start (dossier checklist item 8).
- [ ] **Intent parsing** — real NLP on the common request patterns Phase 1 surfaces (e.g. "shorter sleeves," "looser waist") into that structured spec, via **Claude on Amazon Bedrock** (not the direct Anthropic API — see `aws-infrastructure-todo.md` for why Bedrock). Should be scoped against real Phase 1 request data, not decided in the abstract.
- [ ] **Live preview image generation** — **Titan Image Generator on Bedrock**, called synchronously alongside the intent-parsing call, image-to-image conditioned on the catalog item's base photo (never generated from scratch). This is deliberately a constrained preview, not a replacement for the parametric engine below — it answers "roughly what will this look like," the tailor spec still governs what actually gets made.
- [ ] **Constraint enforcement** — the producibility rule (one fabric, one layer, no logos) and the originality-distance rule (dossier §4b/§11 — customization must diverge enough from any brand reference before checkout) both need to be hard rules the system enforces, not a model's best guess.
- [ ] **Parametric visualization** — dossier's recommendation is a parametric 3D garment engine (the category CLO3D/Browzwear/Style3D belong to) rather than raw text-to-3D, specifically because it guarantees producibility by construction. Still the long-term goal for guaranteed producibility; the Bedrock image-to-image preview above is the interim Phase 2 approach, not a replacement. Real build-vs-buy decision, not something to build from scratch casually.
- [ ] **Mandatory human review** — every AI-generated spec still needs a person to check it before it reaches a tailor, per the dossier's own safety net, until the model has earned trust with real data.

## Trend intake (dossier §5)
- [ ] Pipeline that pulls trend *signals* (recurring silhouettes, colors, details) from fast-fashion/marketplace sites and broader fashion sources — explicitly **not** scraping and reproducing specific listings, which is a real legal exposure (§11)
- [x] **See [`trend-sourcing.md`](./trend-sourcing.md) for the full source-by-source breakdown** — what's real vs. legally risky vs. actually built. Short version: Google's daily trending RSS is built and works but is too general to be a reliable fashion signal; the more useful curated-term interest-over-time is built but currently blocked by Google's rate-limiting on this dev environment's IP; Instagram/influencer scraping is explicitly ruled out (ToS + IP-attribution risk); retailer trending pages are the next real thing to build.
- [ ] Weekly job (Amazon EventBridge → AWS Lambda): Lambda calls **Claude on Bedrock** to analyze the pulled signals, then **Titan Image Generator on Bedrock** to regenerate an inspired candidate image — image-to-image, never a direct import of the source image. This is the concrete mechanism behind the "not scraping and reproducing" rule above, not just a policy statement.
- [ ] Every trend-derived catalog candidate lands in RDS as **pending review**, not directly in the catalog, and needs to clear the same originality check as a customer's brand reference before it's approved
- [ ] **Trend review dashboard** — the staff-facing screen where a stylist approves or rejects pending candidates before they reach the catalog. See `frontend-todo.md` / `backend-todo.md` for build status.

## Explicitly not now
Full AI co-designer, autonomous chat, real-time generative visualization — all Phase 3, gated on Phase 2 proving out with real usage data. Building these before Phase 1/2 validate anything is the specific mistake the dossier's roadmap was designed to avoid.

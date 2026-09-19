# OPEN — the only list

⚠️ **This is the single source of truth for what is outstanding.** If an item is
not here it is not open. Print the live board with:

```bash
node planning/status.mjs
```

**Do not write anything here that a script can check.** Whether an abaya exists,
what the prices are, whether the shop is shut, whether a page still advertises a
lead time: all of that is DERIVED in `status.mjs` and printed fresh every run.
Writing a derivable fact down is what made `pricing-todo.md` wrong for a
fortnight while the founder had already answered it.

Only things a machine cannot know go here, and every one carries the date it was
last confirmed and by whom. `status.mjs` flags anything older than 14 days.

## Format

```
- [ ] id | owner | confirmed:YYYY-MM-DD | one line of what it is
```

`owner` is `founder` when only she can do it, otherwise `session`.
Tick the box and leave it; `status.mjs` hides closed items after 30 days.

## Items

- [ ] rotate-keys | founder | confirmed:2026-09-12 | RESEND_API_KEY, RECONCILE_TOKEN and CLERK_WEBHOOK_SECRET were exposed in a terminal and are still valid
- [x] sitemap-gsc | founder | confirmed:2026-09-14 | DONE: URL-prefix property https://www.shaklek.com verified by META TAG, sitemap submitted and accepted, 8 URLs live. ⚠️ The tag lives in layout.tsx as Next metadata `verification:` and MUST NOT be removed; Google re-checks and ownership lapses silently. The FILE method fails here because proxy.ts rewrites every path to /coming-soon while the shop is shut, so a google-xxxx.html at the root is rewritten and verification fails with no useful error. Same trap for Bing, Pinterest, anything asking you to drop a file at the site root
- [ ] www-timeouts | founder | confirmed:2026-09-13 | One datapoint needed: load the site on mobile data with wifi off. Every other angle is exhausted and the Route 53 check is IPv4 only
- [ ] det-permit | founder | confirmed:2026-09-12 | DET advertising permit, required before any discount campaign is advertised
- [x] how-it-works-timing | founder | confirmed:2026-09-14 | ANSWERED: "approximately 10 working days", hedged with "we strive to". Reverses the 2026-09-12 cut. /faq and /order-confirmed done; /how-it-works is the other session's file
- [ ] abaya-metres | founder | confirmed:2026-09-14 | Abaya modelled at 3.2m and dress at 3.0m, never quoted. She confirmed 2.0 for a shirt and for pants; these two are still assumptions and the abaya is the metre-hungry item she is launching
- [ ] abaya-product | session | confirmed:2026-09-14 | Abaya needs a catalogue entry with a slug, a price and parameters before any photography can start
- [ ] abaya-photography | session | confirmed:2026-09-14 | ~40 generations, about $2. Method is written in catalog-images-todo.md: one abaya per colourway, layered over approved set shots
- [x] measuring-visit-pages | session | confirmed:2026-09-16 | DONE: all 8 product pages, the customizer (under the price), the /catalog intro, the home-page rail subtitle and /our-story. Once per grid, not once per card: eight tiles each repeating the same promise reads as boilerplate. /our-story had never mentioned the visit OR Dubai at all
- [ ] ads-post-1 | session | confirmed:2026-09-14 | Meta pixel is built and switched off. Needs NEXT_PUBLIC_META_PIXEL_ID plus a redeploy before any spend
- [ ] post-1-publish | founder | confirmed:2026-09-14 | Post 1 is finished and saved and has not been posted
- [ ] teasers-2-to-5 | session | confirmed:2026-09-14 | Rebuild on the light palette and the hook rule she set on 2026-09-13
- [ ] videos | session | confirmed:2026-09-14 | craft.mp4 exists. The rest need building, and the two phone shoots need her
- [x] card-bodies-phone | founder | confirmed:2026-09-14 | DONE in 8ca9a8f. The bodies show on phone, so a phone reader gets the reason and not just the claim. It was left on the list after it shipped, which is the exact staleness this file exists to stop
- [ ] brand-assets-backup | session | confirmed:2026-09-14 | brand-assets/ is gitignored, so only the first post is in git. Reels, craft stills and four carousels exist on one machine
- [ ] fifth-article | session | confirmed:2026-09-14 | Optional. Growth work, not a fix. Nothing in the journal is wrong
- [ ] shaklek-plus-review | founder | confirmed:2026-09-14 | Review the Shaklek+ offer. Not urgent. It renders on every product page and under the Pay button, and it was advertising saved measurements the day after they were removed
- [x] store-fitting-measurements | session | confirmed:2026-09-16 | DONE: drizzle 0012 shipped in 98da6fd, applied to PROD and deployed in Amplify job 350 (SUCCEED). Admin view at /dashboard/customers/[id] plus MeasurementSheet. Closed on shaklek-22's report, checked against the commit and the job, not taken on trust
- [ ] outside-dubai-disclaimers | session | confirmed:2026-09-14 | Nothing blocks a Sharjah or Abu Dhabi order, and she does not want it blocked. Needs a clear disclaimer in several places that delivery and the appointment are not included outside Dubai; she then handles each case, offering travel for a fee or cancelling
- [ ] sitemap-orphans | session | confirmed:2026-09-14 | status.mjs should flag any sitemap URL with no inbound link. /how-it-works sat at priority 0.8 with not one live link to it
- [ ] abaya-pockets-ui | session | confirmed:2026-09-15 | Founder wants pockets customisable on the abaya. Not a config flip: premiumParamsForCategory is computed in CustomizeParameters.tsx:108 and never rendered, so premium sliders have no UI at all. And making pockets "render" tier would double abaya photography from 16 to 32 images to show side-seam pockets that barely register in a photo. Needs a third tier: customer-editable, sent to the tailor, NOT part of comboKeyForCategory
- [ ] email-design | session | confirmed:2026-09-16 | IN PROGRESS, uncommitted in this session's tree. buildEmail() in lib/mail.ts was ALREADY a shared template (52426f8) and both waitlist senders already used it -- what was NOT true is the ORDER CONFIRMATION: `git show HEAD:website/src/lib/orderEmail.ts | grep -c buildEmail` returns 0, it was hand-built HTML with its own fonts, greys and width. Now ported, plus a gold rule, serif heading, item table and buildCustomerConfirmation() split out pure so scripts/preview-emails.mjs can render it. ⚠️ A peer session read the working tree and reported this closed against a commit; the commit does not contain it. Not done until it is committed
- [ ] product-page-leadtime | session | confirmed:2026-09-16 | DONE same day, kept for the reason: the lead time was in 7 places and on NO product page, so a customer met the 10-day wait for the first time at checkout. Found by crawling every route rather than by reading a doc
- [ ] dashboard-trends-gate | session | confirmed:2026-09-19 | RESOLVED the vague "two disagreeing staff controls" flag from shaklek-22 by reading the code, so it is now one narrow fact instead of a worry. THE DATA IS SAFE: orders, customers and customers/[id] all call requireStaff() BEFORE any db.select (orders/page.tsx:48 gates, :59 queries). The 200-plus-refusal instead of a 404 is just dashboard/layout.tsx returning its refusal screen and short-circuiting, so the loaders never run to call notFound(). Both controls work; they only disagree about which one the browser sees. ⚠️ THE ONE REAL GAP: /dashboard/trends calls requireStaff ZERO times and leans entirely on the layout, which CLAUDE.md §0 says is not a gate. Severity is low, checked not assumed: it is a "use client" component reading src/data/trends.ts, a committed file with no email, measurement, phone or address field in it. NOT FIXED because it is not a one-liner -- a client component cannot await requireStaff, so it needs a server wrapper or a route layout -- and it is security-adjacent work while she is away


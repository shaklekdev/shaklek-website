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
- [ ] sitemap-gsc | founder | confirmed:2026-09-14 | Submit sitemap.xml in Search Console. She is signed out; property sits under a personal Gmail, not the Outlook shaklek.com address
- [ ] www-timeouts | founder | confirmed:2026-09-13 | One datapoint needed: load the site on mobile data with wifi off. Every other angle is exhausted and the Route 53 check is IPv4 only
- [ ] det-permit | founder | confirmed:2026-09-12 | DET advertising permit, required before any discount campaign is advertised
- [ ] how-it-works-timing | founder | confirmed:2026-09-14 | What should the page say about lead time? She cut the promise on 2026-09-12 and the reverted page still carries it. Options: say nothing, give a range, or confirm per order as the terms page does
- [ ] abaya-metres | founder | confirmed:2026-09-14 | Abaya modelled at 3.2m and dress at 3.0m, never quoted. She confirmed 2.0 for a shirt and for pants; these two are still assumptions and the abaya is the metre-hungry item she is launching
- [ ] abaya-product | session | confirmed:2026-09-14 | Abaya needs a catalogue entry with a slug, a price and parameters before any photography can start
- [ ] abaya-photography | session | confirmed:2026-09-14 | ~40 generations, about $2. Method is written in catalog-images-todo.md: one abaya per colourway, layered over approved set shots
- [ ] measuring-visit-pages | session | confirmed:2026-09-14 | The free visit is missing from the catalogue grid, every product page, and the customizer. SizePicker is this session, the rest is the other
- [ ] ads-post-1 | session | confirmed:2026-09-14 | Meta pixel is built and switched off. Needs NEXT_PUBLIC_META_PIXEL_ID plus a redeploy before any spend
- [ ] post-1-publish | founder | confirmed:2026-09-14 | Post 1 is finished and saved and has not been posted
- [ ] teasers-2-to-5 | session | confirmed:2026-09-14 | Rebuild on the light palette and the hook rule she set on 2026-09-13
- [ ] videos | session | confirmed:2026-09-14 | craft.mp4 exists. The rest need building, and the two phone shoots need her
- [ ] card-bodies-phone | founder | confirmed:2026-09-14 | Show the three card bodies on phone or keep them hidden. Costs about 130px
- [ ] brand-assets-backup | session | confirmed:2026-09-14 | brand-assets/ is gitignored, so only the first post is in git. Reels, craft stills and four carousels exist on one machine
- [ ] fifth-article | session | confirmed:2026-09-14 | Optional. Growth work, not a fix. Nothing in the journal is wrong

# Carousels — every post, in one shape

⚠️ **THIS FOLDER IS THE ONLY PLACE TO LOOK.** Every post is `ig/` (1080x1350),
`tt/` (1080x1920) and `caption.txt`, the layout of `00-first-post-the-name`.
Nothing else needs opening to post something.

Founder, 2026-09-15: *"i don't see any of the new posts."* They existed, in
`brand-assets/teaser/ig/`, in a different folder with a different layout. A post
saved somewhere only its author knows about is not saved.

| | Post | Source | Slides |
|---|---|---|---|
| 00 | The name | `teaser/build.mjs` | 5 |
| 01 | Check the label | `.dc.html` artboards | 6 |
| 02 | Nobody is a medium | `.dc.html` artboards | 4 |
| 03 | Nothing here exists yet | `.dc.html` artboards | 4 |
| 04 | Nobody knows their shoulder | `.dc.html` artboards | 5 |
| 05 | Two places at once | `teaser/build.mjs` | 5 |
| 06 | I used to be cool | `teaser/build.mjs` | 5 |
| 07 | Your hot-day shirt | `teaser/build.mjs` | 5 |
| 08 | Nothing exists yet (short) | `teaser/build.mjs` | 5 |
| 09 | We come to you | `teaser/build.mjs` | 5 |

**05 to 09 were renumbered on the way in.** They were 02, 03, 04, 05 and 06 in
`teaser/`, which collided with the artboard carousels already numbered 02 to 04.

⚠️ **03 and 08 are the same argument told twice** — made to order, nothing
exists until you ask. One is a six-slide artboard set, the other five type
slides. Post one of them, not both, and probably not in the same week.

## Where to edit

- **00, 05 to 09** — `brand-assets/teaser/build.mjs`, then `node build.mjs` and
  copy `teaser/ig/<name>/` and `teaser/tt/<name>/` back here.
- **01 to 04** — the `.dc.html` artboards in each folder, then
  `node _tools/render-post.mjs <folder> <Slide> <Slide> ...`. Arg order is slide
  order and it comes from that folder's README, not from the filenames.

⚠️ **Never edit the PNGs.** They are output. The next rebuild overwrites them.

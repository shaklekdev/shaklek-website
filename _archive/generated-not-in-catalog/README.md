# Generated but not in the catalog

Images that were produced and passed automated verification, but are **not yet
referenced by `website/src/data/catalog.ts`** — so nothing on the site uses
them. Kept because regenerating costs money.

Nothing here is served or deployed. It sits outside `website/`, so it is not
part of the Amplify build and does not count against the build size cap.

## `pleated-trousers-combos/` — 12 images, generated 2026-08-21

Leg-width × length combos for Pleated Trousers, Navy and Ivory masters:
`normal:cropped`, `normal:full`, `wide:cropped`, front and back each.
(`wide:full` is the base photo and is deliberately never generated.)

All 12 passed the verifier — the change actually happened and the colour did
not drift. **They have not been reviewed by the founder**, which is the only
reason they are not live.

To use them:

1. Review them with the founder first.
2. Copy into `website/public/catalog/pleated-trousers/`.
3. Add the `comboImages` entries for Ivory and Navy in `catalog.ts`, following
   the Wide-leg Trousers block as the pattern.
4. Derive Burgundy and White from these masters — see the two-master strategy
   in the root `CLAUDE.md`.

Stored as JPEG q92 under `.png` names, matching the catalog convention.

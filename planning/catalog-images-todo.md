# Catalog Images — TODO

Status as of **2026-08-21**. Method, tooling and gotchas live in the root
`CLAUDE.md` — read that first, don't re-derive them here.

---

## Where each item stands

`comboKey` = `sleeve:length` (shirts) or `legwidth:length` (pants). The default
combo is the base photo and is deliberately never generated.

| Item | Ivory | White | Navy | Burgundy | Notes |
|---|---|---|---|---|---|
| Oversized Shirt | 3/3 | 3/3 | 3/3 | 3/3 | complete |
| Structured Blouse | 3/3 | 3/3 | 3/3 | 3/3 | complete |
| Wrap Top | 3/3 | 3/3 | 3/3 | 3/3 | complete; all 8 backs rebuilt from one master 2026-08-21 |
| Utility Shirt | 3/3 | 3/3 | 3/3 | 3/3 | complete |
| Wide-leg Trousers | 3/3 | — | 3/3 | — | **White + Burgundy missing** |
| Banded Trousers | 3/3 | — | 3/3 | — | **White + Burgundy missing** |
| Pleated Trousers | — | — | — | — | **not started** |
| Cargo Trousers | — | — | — | — | **not started** |

Approved pants scope is **3 combos per item**: `normal:cropped`, `normal:full`,
`wide:cropped`. `wide:full` is the base photo.

---

## Next up

- [ ] **Wide-leg + Banded: derive White and Burgundy** from the existing Navy
      and Ivory masters. Navy→Burgundy is free (deterministic, same lightness
      family). Ivory→White needs generation. ~6 generations total.
- [ ] **Pleated Trousers combos.** 12 images already generated and sitting in a
      previous session's scratchpad — **assume gone, regenerate.** Masters are
      `pleated-trousers-{navy,ivory}-front-v3/back-v2`. Use
      `scripts/catalog/pants-batch` pattern: 3 combos × 2 views × 2 masters.
- [ ] **Cargo Trousers combos.** Same shape. Masters
      `cargo-trousers-{navy,ivory}-front/back-v2`.
- [ ] Derive Burgundy + White for both once the masters are approved.

Estimated remaining: roughly **30 Flash generations, about $1.20**, plus free
deterministic derivation.

---

## Known open defects

- [ ] **Wrap Top backs have no tie at all.** Deliberate, and signed off by the
      founder: the back is a plain standing view whose only job is to show
      length. The wrap tie shows on the front photo. Earlier attempts to render
      the tie at the side edge kept drawing a sash across the back instead.
- [ ] **Utility Shirt has no shared master across colours.** Each colour was
      shot separately at a different canvas size (Navy 1111×960, Burgundy
      848×733). The combos are consistent within a colour but the base photos
      are not consistent between colours. Would need re-shooting from one
      master to fully fix.
- [ ] **Framing is not uniform across items.** Wide-leg was a tight side crop
      that cut off the ankle (Navy front fixed 2026-08-21); Banded and Cargo are
      full-body; Pleated is waist-down. Fine within an item, inconsistent across
      the catalog.

---

## Decisions worth not relitigating

- **Two masters per garment, not four.** One per lightness family — Navy for
  dark, Ivory for light — then derive the sibling colour. Halves cost and makes
  hem length match by construction rather than by luck.
- **Burgundy is the original warm wine, h≈353**, not the brand hex `#4a1a2d`
  (h=336). A catalog-wide normalisation onto the brand hex was tried on
  2026-08-21 and reverted — the founder preferred the existing warmer tone. All
  40 burgundy files now sit at h≈352–355.
- **Catalog images are stored as JPEG q92 under `.png` filenames.** Required to
  stay under Amplify's 230MB build cap; PNG put the build at 291MB and it
  failed. Keep new images in this format.
- **Gemini Flash is the default model**, Pro only on failure. Pro is 3.5× the
  price and was not measurably better at these edits.

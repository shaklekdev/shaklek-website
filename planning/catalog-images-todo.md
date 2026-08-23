# Catalog Images — TODO

Status as of **2026-08-22**. The generation method lives in root `CLAUDE.md`
**§4b — the trouser combo recipe**. Read that before generating anything; it is
the distilled output of a full day of trial and error and it is what made the
last two items fast.

---

## Where each item stands

All eight catalog items now have complete customizer photography.

| Item | Category | Matrix | Colours | State |
|---|---|---|---|---|
| Oversized Shirt | Shirt | `sleeve:length`, 3 combos | 4/4 | complete |
| Structured Blouse | Shirt | `sleeve:length`, 3 combos | 4/4 | complete |
| Wrap Top | Shirt | `sleeve:length`, 3 combos | 4/4 | complete |
| Utility Shirt | Shirt | `sleeve:length`, 3 combos | 4/4 | complete |
| Cargo Trousers | Pants | `straight/wide` x `full/cropped` | 4/4 | complete 2026-08-22 |
| Banded Trousers | Pants | same | 4/4 | complete 2026-08-22 |
| Pleated Trousers | Pants | same, **wide = barrel leg** | 4/4 | complete 2026-08-22 |
| Wide-leg Trousers | Pants | same | 4/4 | complete, defects below |

**64 trouser combination photos** shipped 2026-08-22 (commit `f4f1864`, Amplify
job 109). Twelve *base* photos were corrected along the way: banded had four
tapered backs and three tapered fronts that contradicted each other, and cargo's
four backs were cropped above the hem so length changes were invisible from
behind.

---

## Next up

### 1. Wide-leg Trousers — finish the cleanup (~8 generations, ~$0.60)

Built before the recipe existed, and still carries defects:

- [ ] **`wide:full` has black heels** on navy, burgundy and white where every
      other cell has nude sandals. Came from an extension pass that invented
      footwear. The base photos already show shoes, so **no extension is needed
      on this item at all** -- regenerate at base framing.
- [ ] **`wide:full` sits at a different frame** from its neighbours (extended
      then trimmed), so the image shape jumps when toggling length.
- [ ] **Burgundy's base photo is from a different shoot** -- full body, different
      pose -- while its own combos are chest-down crops.
- [ ] Straight-vs-wide difference is modest (~5-7%) because **the base is already
      a palazzo**. A rebuilt navy master exists in
      `catalog-archive/2026-08-22-session/wideleg2/` using an inverted axis
      (`wide:full` = the base photo, `straight` = a relaxed straight column
      generated from it). Founder view: slim/close-to-body is off-trend, so if
      revisited the straight option must stay **relaxed**, never slim.

### 2. New items -- the recipe generalises

Nothing in the recipe is trouser-specific. For **new pants, new shirts and
dresses**, follow `CLAUDE.md` §4b as written:

- Build each cell from the cell that already has the property (never generate a
  two-change cell from the base).
- Approve the one "changed" master image before generating anything from it.
- Navy master -> Ivory with the *same prompt string* -> Burgundy by recolour ->
  White from its own base.
- Flash for everything except **reshaping a silhouette**, which needs Pro.
- Pass an approved image as a reference instead of describing the target.
- Give each item its **own silhouette identity**. Pleated got a barrel leg
  specifically so it would not read as a second wide-leg trouser. Repeating a
  silhouette across items wastes the customizer.

**Budget shape:** a clean item is roughly 30 generations, ~$1.50. Add ~$1.00 if
the base photos need correcting first.

### 3. Dresses (not started)

`category: "Dress"` exists in the `CatalogItem` type but no dress items exist
yet. A dress matrix needs its own render-tier sliders alongside `SHIRT_PARAMS`
and `PANTS_PARAMS` -- likely `sleeve` x `length`, mirroring the shirts.

---

## Known open defects

- [ ] **Wide-leg:** see section 1.
- [ ] **Cargo white's back frame** is 832x1100 where the others are ~832x1248, so
      its back view reads slightly tighter.
- [ ] **Banded navy and burgundy fronts** are in a 3/4 turned pose while every
      other cell is straight-on. Inherent to the navy base photo.
- [ ] **Pleated white** is framed 928x1152 against everyone else's 848x1264 --
      internally consistent, different from the other colours.
- [ ] **Burgundy exposure drift**: cells vary by ~23 lightness points. Do NOT
      post-process this -- a hue window around burgundy wraps past 360 into skin
      tones and tints hands and feet (tried and reverted 2026-08-22).
      Regenerate the offending cell instead.
- [ ] **Wrap Top backs have no tie.** Deliberate, signed off by the founder.
- [ ] **Utility Shirt has no shared master across colours** -- each colour was
      shot at a different canvas size.

---

## Decisions worth not relitigating

- **Pants matrix is `straight | wide` x `full | cropped`.** The slider option
  *values* must match those words -- `comboKeyForCategory` builds keys from them.
- **`straight:full` is the base photo and is never generated.**
- **Pleated's wide option is a barrel leg**, not a palazzo: full at the knee,
  neat at the ankle. Chosen so it reads as a different garment from Wide-leg.
  Balloon was considered and rejected -- its gathered hem clashes with the flat
  cuffed hems used across the range.
- **Burgundy is the warm wine at h≈353**, not the brand hex `#4a1a2d`.
- **Catalog images are JPEG q92 under `.png` filenames** -- required to stay under
  Amplify's 230MB build cap.
- **Never delete a generated image.** They are paid for, and a superseded version
  has twice turned out to be the one needed. Archive to
  `catalog-archive/<date>-session/` before the session ends -- the scratchpad is
  wiped on exit.

---

## ⚠️ The photography is not one aspect ratio (found 2026-08-24)

Surveying all 286 files in `public/catalog/` turned up **at least eight
different dimensions**, spanning portrait to landscape:

```
848x1264   x82   ratio 0.671
832x1248   x66   ratio 0.667
864x1184   x29   ratio 0.730
896x1200   x25   ratio 0.747
1111x960   x21   ratio 1.157   <- landscape
848x733    x12   ratio 1.157   <- landscape
1088x960   x12   ratio 1.133   <- landscape
896x1152    x9   ratio 0.778
```

This is why the customizer preview looked wrong. No single box fits them all:
`object-cover` crops (it was cutting the hem off trousers on phones, i.e. the
exact thing the customer is choosing), and `object-contain` letterboxes, which
the founder correctly read as ugly "square lines" once the box had a border.

Mitigated in the UI on 2026-08-24 — the box is `aspect-[2/3]`, matching the
dominant format, with the border removed so any remaining letterbox reads as
margin rather than a frame. **That is a workaround, not a fix.** The ~45 files
that are landscape or near-square still sit inside a portrait box with visible
space around them.

**The real fix is normalising the source images to one ratio.** This is
deterministic padding/cropping, not generation — no model cost, no
`GEMINI_API_KEY`, and it can be done with `sharp` alone. Pad to 2:3 on the
sampled background colour rather than cropping, so nothing is lost: the
landscape combo shots are the ones most likely to lose a hem or a sleeve if
cropped.

Note the deploy trap in `CLAUDE.md` §6 before doing it: image content changes
need a **filename change** (`-v3`), or CloudFront keeps serving the old file
for four hours, and the build must stay under 230MB with JPEG q92 under `.png`
filenames.

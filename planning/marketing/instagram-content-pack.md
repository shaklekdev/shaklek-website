# Instagram content pack — ready to post

26 finished 1080×1080 images in `brand-assets/instagram/`. Every claim below is
checked against the shipped site; the source line is noted where it matters.

**Bio link must be `https://www.shaklek.com`** — the apex 404s on deep links.

---

## Brand assets (not posts)

| File | Use |
|---|---|
| `00-profile-picture.png` | Instagram profile photo — cropped to survive the circular mask |
| `00-logo-transparent.png` | Logo with alpha, for overlaying on photography |
| `01-logo-ivory.png` | Logo on ivory, postable as-is |

---

## The strongest posts — lead with these

### `p-*-shapes.png` (6 posts) — one garment, four ways to cut it

This is the post no competitor can copy, because it needs the photography of a
garment *changing shape*. Trousers are cropped to the leg deliberately: the
subject is the hem and the width, not the model.

> One trouser. Four ways to cut it.
>
> Straight or wide. Full length or cropped. You choose the shape on the page and
> the photograph changes with you — so you see the piece you are actually
> ordering, not a version of it.
>
> Then it's cut for you. From AED 429, made in about 10 days.

`#MadeToOrder #MadeToMeasure #DubaiFashion #UAEFashion #Linen #تفصيل #دبي`

### `p-*-colours.png` (8 posts) — the same piece in all four colourways

> Ivory, white, navy, burgundy. The same piece, four ways.
>
> We keep the palette small on purpose — every colour is one we'd wear all
> year in this climate, and every one is cut in cotton or linen. Nothing else.
>
> From AED 389.

`#Linen #CottonClothing #UAEFashion #DubaiFashion #Minimalist #كتان`

---

## How it works — post as a 3-slide carousel

`t-h1-choose.png` → `t-h2-measure.png` → `t-h3-made.png`

> How a Shaklek piece actually gets made.
>
> 1. Choose. Pick a piece, change the cut and the colour, and watch the
>    photograph change with it.
> 2. Measure. Pick XS–XXL, or send us your own numbers and it's cut to those.
>    Same price either way — tailoring is never an upgrade here.
> 3. Made. One person, one piece, nothing made before you order it.
>
> About 10 days to your door, anywhere in the UAE.

`#MadeToOrder #SlowFashion #TailoredForYou #DubaiFashion #UAEFashion`

---

## Statement tiles — use as spacers between product posts

| File | Text | Caption starter |
|---|---|---|
| `t-s1.png` | NOTHING IS MADE / BEFORE YOU ORDER IT | Nothing sits in a warehouse waiting for you. Your piece starts existing the day you order it. |
| `t-s2.png` | COTTON AND LINEN / NOTHING ELSE | Two fibres. Linen breathes in Gulf heat and softens with every wash; cotton does the quiet work. |
| `t-s3.png` | XS–XXL, OR YOUR OWN MEASUREMENTS / SAME PRICE | A size chart is an average of everyone, which makes it exact for no one. |
| `t-s4.png` | FROM AED 389 / MADE IN 10 DAYS | One price per piece. Tailoring included, never an upgrade. |
| `t-s5.png` | ONE FREE ALTERATION / WITHIN 14 DAYS | If it isn't right, we fix it. Made-to-order should mean it fits. |

## The grid sentence — four tiles reading as one line

`02-text-cut` · `04-text-for-your-body` · `06-text-not` · `08-text-a-size-chart`

Placed at grid positions 2, 4, 6 and 8 they read: **CUT — FOR YOUR BODY — NOT —
A SIZE CHART.** Post 9 → 1 in reverse so the grid assembles correctly.

---

## Claim audit

| Claim | Source |
|---|---|
| From AED 389 · made in 10 days | `website/src/app/page.tsx:68` |
| Trousers AED 429 | `website/src/data/catalog.ts` `BASE_PRICE_BY_CATEGORY` |
| XS–XXL or own measurements, same price | `website/src/app/how-it-works/page.tsx:38` |
| Nothing made before you order it | `website/src/app/how-it-works/page.tsx:43` |
| One free alteration within 14 days | `website/src/app/legal/returns/page.tsx:26` |

**Do not reuse the older "From AED 390" line** from `instagram-launch.md` — the
price ladder moved to charm endings in `3f2969e`.

## Gaps

- Three shirts (structured blouse, wrap top, utility shirt) have no
  `short:normal` photo, so they get no shapes post. Four of eight garments do.
- Posts 1/3/5/9 of the original launch grid still need photography that does not
  exist: dunes, a linen macro, a cutting table, a shoreline.

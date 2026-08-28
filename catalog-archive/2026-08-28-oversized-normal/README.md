# 2026-08-28 — Oversized Shirt shorter "normal", and the Wrap Top hip length

Three paid generations. Kept because every generation is money already spent
and a rejected shape is often the right answer for a different item.

| File | What it is |
|---|---|
| `navy-front-normal-try1.jpg` | Oversized Shirt, attempt at a shorter "normal". **Rejected — the hem did not move.** Flash, vaguer prompt ("a few centimetres below the waistband"). |
| `navy-front-normal-try3.jpg` | Same, second attempt with a hard landmark ("hem level with the top of the belt, both hands entirely below it"). **Also rejected — hem still did not move.** |
| `wrap-navy-long-longer-front-try1.jpg` | Wrap Top navy `long:longer` front, shortened from prose. **Rejected by the founder — too short.** It came out level with the existing `normal`, so the two lengths were indistinguishable. |
| `wrap-navy-long-longer-front-try2.jpg` | Same cell, shortened against the **back view as a reference image** rather than a description. Sits between `normal` and the old tunic, matching the back. Awaiting approval before the remaining seven fronts. |

## The wrap top, and why prose lost to a reference

The brief was a hem "just under the hip". Written as prose, that produced a top
level with the existing `normal` — a correct-sounding instruction landing on the
wrong body landmark, and unarguable only once the two were put side by side.

The back view of this exact cell was **already the right length** and had been
all along. Passing it through `edit2.mjs` as a labelled reference put the hem
where it belonged in one attempt. This is CLAUDE.md §4b's "references beat
descriptions" a third time; the reference here was sitting in `public/catalog/`
the whole time.

Framing drifted about 15% larger than the source. That is inside the spread the
shipped wrap-top fronts already carry (`short:longer` reads 49.8% body width
against `long:longer`'s 45.9%), so it was left rather than chased.

## What the two rejects are evidence of

Both passed `minDiff` (14.1 and 5.4) and neither shortened anything. The tell is
that the difference against the source is spread **evenly across the whole
frame** rather than concentrating at the hem — the model re-rendered the picture
and changed nothing structural. `minDiff` cannot catch this, exactly as it could
not catch a missing widening on Banded white.

So: for a length or width edit, diff the result against the source **row by row**
and check the change is where the edit was asked for. A single scalar diff will
pass a no-op.

`gemini-3-pro-image`, the tier that does reshape silhouettes, returned 503 six
times running, so this was never tried on the model most likely to do it.

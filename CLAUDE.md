# Shaklek — quick start

Made-to-order fashion, UAE. Next.js app in `website/`, deployed to AWS Amplify
on push to `main`. Planning docs in `planning/`.

**Read this file only. Do not go read the whole catalog or planning folder to
"get oriented" — everything load-bearing is here.**

---

## 1. Token discipline (read this before touching images)

The expensive thing in this project is **reading catalog photos into context**.
One `Read` of a catalog PNG costs roughly 1,500–2,500 tokens, it stays in
context, and it is re-sent on every later turn. A session that reads 60 images
burns most of its budget on looking at pictures.

Rules, in order of impact:

1. **Let the user review, not you.** `open file.png` costs ~0 tokens and puts
   the image in Preview for them. `Read` is for when *you* must verify a
   specific thing you cannot measure.
2. **Measure instead of looking.** `scripts/catalog/normalize-colour.mjs
   --measure <files>` prints hue/saturation/lightness for ~50 tokens. This has
   caught defects the eye missed (a desaturated "black" navy, a 21° burgundy
   spread across the catalog). Prefer numbers over eyes.
3. **Crop before you read.** If you must look, `sharp().extract()` a 500px
   region of the hem or collar. A full 1000×1200 photo costs many times more.
4. **Never re-read an image you already read** in the same session.
5. **Batch generation, then review once.** Generate N images, `open` them all
   together, and let the user give one round of feedback — instead of
   generate → read → tweak → read.

Rework is the other big cost. Confirm the exact change with the user before a
batch, because a wrong batch costs twice: the generation *and* the re-review.

---

## 2. How catalog images work

`website/src/data/catalog.ts` is the single source of truth. Each item has:

- `colorImages[color] = {front, back}` — the base photo per colour
- `comboImages[color][comboKey] = {front, back}` — per-combination photos
- `defaultChanges` — when the base photo isn't the category default

`comboKey` is built by `comboKeyForCategory()` in `src/data/parameterSliders.ts`
from the **"render"-tier sliders only**, joined by `:` in declared order.

| Category | Key format | Combos | Default (= base photo, not generated) |
|---|---|---|---|
| Shirt | `sleeve:length` | short/long × normal/longer | usually `long:normal` |
| Pants | `legwidth:length` | normal/wide/wider × cropped/ankle/full | `wide:full` |

The default combo is deliberately **not** generated — it falls back to
`colorImages`. Only generate the non-default ones.

Colours (`src/data/colors.ts`): Ivory `#f5f0e8`, White `#fafafa`,
Navy `#0a2d4a`, Burgundy `#4a1a2d`.

After changing `catalog.ts`, always verify every referenced file exists:

```bash
cd website && node -e "
const src=require('fs').readFileSync('src/data/catalog.ts','utf8');const fs=require('fs');let bad=0;
for(const m of src.matchAll(/\"(\/catalog\/[^\"]+)\"/g)) if(!fs.existsSync('public'+m[1])){console.log('MISSING',m[1]);bad++;}
console.log(bad?bad+' MISSING':'ok');"
```

---

## 3. The two-master strategy (this is the whole method)

Every consistency bug in this catalog came from **generating each colour and
each view independently**, then hoping they matched. They never did — hem
lengths, framing, poses and colours all drifted.

The method that works:

1. Generate **one master per lightness family**, not per colour:
   - **Dark family** → Navy
   - **Light family** → Ivory
2. Derive the sibling colour from the master: Navy → Burgundy, Ivory → White.
3. Because derived images are the *same pixels* recoloured, hem length, pose
   and framing match **by construction** — not by luck.

Cost: 2 generations per combo instead of 4, and no drift to debug.

**Front and back must agree before anything is derived from them.** If the base
front/back pair doesn't match in length, every combo and colour inherits the
mismatch. Fix the pair first.

Deriving across lightness families (Ivory → Navy) needs a *generative* recolour;
the deterministic tool cannot make dark from light. Within a family it's free.

---

## 4. Tooling — `website/scripts/catalog/`

All take `GEMINI_API_KEY` from `website/.env.local`.

| Script | Use |
|---|---|
| `normalize-colour.mjs` | **Start here.** `--measure <files>` prints h/s/l. Also exports `normalise()` to shift a garment onto a target colour — free, deterministic, keeps folds and texture. |
| `gen-verified.mjs` | Generate with auto-verify + retry. Rejects "model returned the source unchanged" and "colour drifted". |
| `run-batch.mjs` | Batch driver over `gen-verified`. Takes a JSON array of jobs. Tries Flash, escalates to Pro on failure. |
| `edit.mjs` | Single-image edit, prompt sent verbatim. |
| `edit2.mjs` | Two-image edit — pass a labelled reference (e.g. the front view) alongside the image to change. |
| `region-recolor.mjs` | Flood-fill recolour from a seed point. For pale garments where hue alone can't separate fabric from skin. |
| `measure-pants.mjs` | Hem height and leg width as frame fractions. |

### Models and cost

- `gemini-2.5-flash-image` — **$0.039/image. Default to this.**
- `gemini-3-pro-image` — $0.134/image. Only when Flash fails or 503s.

Flash handles nearly everything. Escalate, don't start at Pro.

Google AI Studio budget is capped — check https://aistudio.google.com/usage
before large batches and tell the user the expected cost first.

---

## 5. Hard-won gotchas

**Prompting**

- Describe the **target end state**, not a delta. "A woman wearing a beltless
  tunic, one smooth sheet of linen" works. "Remove the belt" usually doesn't.
- Name **every** element that must stay, explicitly — including `background`.
  Saying "keep the lighting" does not keep the backdrop.
- For sleeves, call out the **occluded arm** ("the raised arm reaching to her
  hair is covered to the wrist"), or the model leaves it short and you get one
  long and one short sleeve.
- Say **matte, uniform, both sides identical texture** on recolours, or one
  side can come back with a metallic sheen.
- The model **will not zoom out**. To widen a crop, pad the canvas yourself
  with matching background, then ask it to complete the figure into the new
  space. That works first try.
- A pose implies the garment. A hand tucked at the hip **regenerates a pocket**
  no matter how firmly you forbid one — change the source pose instead.

**Colour**

- Recolour by measuring the actual hue and **shifting** it. Do not regenerate
  the whole image to change a colour.
- Two guards are mandatory, both learned by breaking things:
  - a **lightness ceiling** — fabric sits at l≈0.20–0.27, lit skin at l≈0.33+;
    without it you bleach skin
  - a **skin-band exclusion** — a garment near h≈353 has a hue window that
    wraps past 360° into skin hues, tinting faces and hands pink
- Verify colour by **hue**, not by pixel-diff. Navy→Burgundy barely changes
  greyscale, so a diff check reports a correct recolour as "unchanged".

**What doesn't work**

- OpenAI `gpt-image-1` masked edits: the docs state masking is *prompt-based*
  and "may not follow its exact shape with complete precision" — it regenerates
  the whole frame, so faces and fabric drift. Not a reliable lock.
- Clone/tile-stretching a hem from the same photo: fails whenever an arm
  crosses the extension zone, which it usually does.

---

## 6. Workflow

```bash
cd website
npm run dev          # localhost:3000
npx tsc --noEmit -p . # after any catalog.ts edit
npm run build        # MUST pass before deploying
```

Images are cached by filename and the filenames don't change, so after
replacing photos:

```bash
rm -rf .next/dev/cache/images   # then restart dev server
```

The user still needs a hard refresh (Cmd+Shift+R) — that cache is theirs.

**Deploying:** push to `main`; Amplify builds automatically. Run `npm run build`
first.

⚠️ **The repo root contains untracked personal documents** — passport, Emirates
ID, visa, bank letters. **Never `git add -A` or `git add .`** from the repo
root. Stage explicit paths only:

```bash
git add website/public/catalog/ website/src/data/catalog.ts
```

---

## 7. Working with this user

- They review visually and catch real defects — take the feedback literally.
- Confirm scope before a batch. Broad unrequested passes have caused most of
  the damage here; a catalog-wide "improvement" nobody asked for is worse than
  doing nothing.
- Report cost honestly, before spending.
- When something breaks, `git checkout` the affected files individually — per
  file in a loop, since a single `git checkout -- $LIST` treats the whole
  string as one pathspec and silently fails.

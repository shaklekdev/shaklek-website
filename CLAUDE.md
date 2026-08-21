# Shaklek — quick start

Made-to-order fashion, UAE. Next.js app in `website/`, deployed to AWS Amplify
on push to `main`. Planning docs in `planning/`.

**Read this file only. Do not go read the whole catalog or planning folder to
"get oriented" — everything load-bearing is here.**

**§7 matters more than the technical sections.** Nearly everything that has gone
wrong on this project was scope creep or claiming success without checking —
not missing knowledge. Read it before doing anything that costs money.

## Where the project stands (2026-08-21)

Live at `shaklek.com` on AWS Amplify. Commerce works end to end: Stripe
Checkout → webhook → order persisted in Neon Postgres → notification email via
Resend. Auth is Clerk (staff `/dashboard`, customers `/account`).

- **Stripe merchant account is verified** (2026-08-20) — charges and payouts
  enabled, Wio bank account attached, no outstanding requirements. Still
  running **test keys**; taking real money is a key swap in Amplify env vars,
  not a code change.
- **Clerk is still on development keys in production** — has hard usage caps.
  Needs a production instance and a key swap. See `planning/payment-auth-todo.md`.
- **Customizer photography** is the active workstream — all four shirt items are
  complete across four colours; trousers are partly done. Status table and
  remaining work: `planning/catalog-images-todo.md`. **This is what most
  sessions are about — sections 1–5 below are the working knowledge for it.**

Zero real AI exists in the product itself; that is deliberate (Phase 1 is a
human-run concierge model). The image generation described here is a build-time
tool for producing catalog photos, not a product feature.

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

Filenames carry a `-v2`/`-v3` suffix. That is **cache-busting, not versioning** —
see the deploy traps in §6. Changing an image's content means changing its
filename.

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

### Running a batch

`run-batch.mjs` takes a JSON array of jobs and handles verify + retry +
Flash→Pro escalation. Generate the JSON with `node -e` rather than writing it by
hand — prompts are long and shell quoting will bite you.

```bash
cd website/scripts/catalog
node run-batch.mjs "$(node -e '
const C="../../public/catalog", S="/tmp/out";
console.log(JSON.stringify([{
  label:"wrap navy short back",
  inputPath:  C+"/wrap-top-ivory-combo-short-longer-back-v2.png",
  outputPath: S+"/navy-sl.png",
  expectedHex:"#0a2d4a",   // verifier checks the result lands near this hue
  maxAttempts:3,
  minDiff:0.5,             // lower for pure recolours (see gotcha below)
  maxHueDrift:25,
  prompt:"Change the colour of ... "
}]));
')"
```

`minDiff` guards against "the model returned the source unchanged". It compares
**greyscale**, so for a pure recolour (navy→burgundy barely changes lightness)
set it low — otherwise correct results get rejected. For structural edits
(sleeve/hem length) leave it around 2.

**Generated images live in a temp dir and die with the session.** Install them
into `public/catalog/` as soon as they're approved. A batch of 12 trouser
images was lost this way.

### Models and cost

- `gemini-2.5-flash-image` — **$0.039/image. Default to this.**
- `gemini-3-pro-image` — $0.134/image. Only when Flash fails or 503s.

Flash handles nearly everything. Escalate, don't start at Pro. Flash 503s under
load — that's transient, back off and retry rather than switching model.

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

### Deploying — two traps, both hit on 2026-08-21

Push to `main`; Amplify builds automatically. Always `npm run build` first.

**Trap 1 — build size cap.** Amplify rejects build output over **230MB**. The
catalog is the bulk of it. Keep catalog images as **JPEG q92** (mozjpeg) *under
their `.png` filenames* — that is the existing convention here, and PNG blew
past the cap (291MB) and failed the deploy. To re-encode:

```js
await sharp(p).jpeg({quality:92,mozjpeg:true}).toBuffer()  // write back over the .png
```

**Trap 2 — replacing an image in place does not change what users see.**
Catalog photos are served through Next's optimizer
(`/_next/image?url=/catalog/foo.png&…`), and CloudFront caches *that* response
for 4 hours (`max-age=14400`). The cache key is the URL, so overwriting the
file changes nothing for visitors even after a green deploy — and Amplify owns
the distribution, so there is no invalidation available.

**If you change an image's content, you must change its filename.** That is
what the `-v2` / `-v3` suffixes throughout `public/catalog/` are for. Bump the
suffix and update the reference in `catalog.ts`. New files need no bump — their
URLs are already new.

### Checking a deploy (AWS CLI is available)

```bash
export PATH="$PATH:/Users/nadatlohi/Library/Python/3.8/bin"
APP=dqcptedylrif0   # shaklek-website, eu-west-1
aws amplify list-jobs --app-id $APP --branch-name main --max-results 3 \
  --query 'jobSummaries[].{id:jobId,status:status,commit:commitId}' --output table
# on failure, read the build log:
aws amplify get-job --app-id $APP --branch-name main --job-id <ID> \
  --query 'job.steps[0].logUrl' --output text | xargs curl -s | grep -iE "error|exceed"
```

**A failed build is silent** — the site just keeps serving the old version. If
the user says a change isn't live, check the job status *before* assuming
caching.

To prove what production actually serves, compare pixels rather than guessing:
fetch the `/_next/image?...` URL and diff it against the local file and against
`git show <old-commit>:website/public/catalog/<file>`. Byte size alone is
misleading.

⚠️ **The repo root contains untracked personal documents** — passport, Emirates
ID, visa, bank letters. **Never `git add -A` or `git add .`** from the repo
root. Stage explicit paths only:

```bash
git add website/public/catalog/ website/src/data/catalog.ts
```

---

## 7. How to work here — the expensive lessons

These cost more than any technical problem in this project. Every one is from
a real failure on 2026-08-20/21.

### Verify before you claim it worked

The worst habit, by far, was announcing success and being corrected. Every
time, a cheap check would have caught it first.

- A masked edit was called "a real success" — it had silently regenerated the
  whole frame at a different aspect ratio, changing the model's face and skin.
  It was judged on appearance alone, never diffed against the source.
- "Both sleeves are now full length" — one was still short.
- A pocket fix was approved with the pocket still plainly visible.

**Before saying a change worked: check the specific thing that was asked for,
with the narrowest instrument available.** Measure it, crop into it, or diff it
against the source. "It looks right" is not verification, and this user *will*
spot what you missed.

### Stay inside the ask

The single most damaging action was a catalog-wide burgundy normalisation
nobody requested. Burgundy had been uniform; the unasked-for pass broke it and
cost a full audit plus a 41-file revert.

- Fix **only** the item, colour and combo named. Do not "while I'm here".
- If you notice something else wrong, **say so and let them decide.**
- Re-read which garment the feedback was about. Wrap Top feedback was once
  applied to the Oversized Shirt, and paid for.

### Ask instead of engineering around it

Faced with an ambiguous "the tie shouldn't be on the back", the response was
three new scripts and several generations. One question — *"is a thin band
acceptable, or must it be invisible?"* — would have resolved it immediately.

**A clarifying question costs nothing. A wrong batch costs twice.**

### Stop after two failures

The same back image was regenerated six times with near-identical prompts, all
failing the same way. Two identical failures means the approach is wrong, not
the wording. Stop, say what's failing, and propose something different.

### Pick the right instrument

- Verifying a recolour with a greyscale pixel-diff → correct results rejected
  as "unchanged" (navy→burgundy barely moves lightness). Check **hue**.
- Verifying a deploy by byte size → misleading. Compare **pixels** against both
  the local file and the previous committed version.

### Money

Every generation is real money against a capped budget, and the user watches it.
State the expected cost before a batch, and report what was actually spent —
including what was wasted. Prefer the free deterministic tools; reach for
generation only when new pixels genuinely have to be invented.

### Reverting

`git checkout -- $LIST` with a shell-expanded list silently fails — git reads
the whole string as one pathspec. Loop and revert **per file**, then confirm
with `git status`.

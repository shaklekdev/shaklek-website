# Shaklek — quick start

Made-to-order fashion, UAE. Next.js app in `website/`, deployed to AWS Amplify
on push to `main`. Planning docs in `planning/`.

**Read this file only. Do not go read the whole catalog or planning folder to
"get oriented" — everything load-bearing is here.**

**One exception: `planning/session-log.md`.** More than one Claude session works
on this repo at once. Read it before you start so you do not edit a file another
session is holding uncommitted, and update it before you finish.

## The architecture file is the map. Keep it true.

**`planning/aws-architecture-diagram.html`** — open it in a browser. It is the
single answer to *what is deployed, how it fits together, and what is still
pending*. It carries the live component table, the request flow, the deploy
traps, the security posture, the verified deployed state, and the ranked
"what to build next".

> ⚠️ **EVERY CHANGE TO THE ENVIRONMENT MUST BE MAPPED THERE, IN THE SAME
> SESSION THAT MAKES IT.** A new service, a new alarm, a new scheduled job, a
> new environment variable, a component removed, a status that moved from
> planned to live — if it changes what is deployed or how, it goes in that file
> before the session ends. Founder's instruction, 2026-08-26.

This is not bookkeeping. That file spent months naming **Amazon RDS** as the
database (it is Neon), showing an **S3 bucket** that has never existed, and
drawing **Gemini in the live request path** when Gemini has never been called
at runtime. Every component still read "not deployed" while the site was taking
real cards. A map that lies is worse than no map, because people act on it.

> ⚠️ **A NEW ENVIRONMENT VARIABLE TAKES TWO STEPS, AND THE CONSOLE IS ONLY
> ONE OF THEM.** Amplify's build spec carries an explicit allowlist:
> `env | grep -e DATABASE_URL -e STRIPE_SECRET_KEY … >> .env.production`.
> A variable set in the console but missing from that grep **never reaches the
> running app** — `process.env.YOURS` is simply undefined in production while
> the console shows it set. Cost an hour on 2026-08-26 with `RECONCILE_TOKEN`:
> the route 404'd against a correct token and every other explanation was
> checked first. Read the spec with
> `aws amplify get-app --app-id dqcptedylrif0 --query 'app.buildSpec'`, add
> `-e YOUR_VAR`, and **redeploy** — the spec is read at build time.

**Verify, do not inherit.** Infrastructure state lives outside git — the
Amplify console, the Stripe dashboard, the AWS account — so a sentence about it
goes stale with no diff to notice. The same file also claimed for days that the
apex domain 404s; it 301-redirects. Check the live system, then write it down.

**§7 matters more than the technical sections.** Nearly everything that has gone
wrong on this project was scope creep or claiming success without checking —
not missing knowledge. Read it before doing anything that costs money.

## Where the project stands (2026-08-26)

Live at `www.shaklek.com` on AWS Amplify. (The apex `shaklek.com` **301-redirects
to www** — re-verified 2026-08-26. This file previously said it 404s; that was
true once and was copied forward for days without anyone re-testing it.) Commerce works end to end: Stripe Checkout → webhook → order persisted in
Neon Postgres → notification email via Resend. Auth is Clerk (staff
`/dashboard`, customers `/account`).

**This is LIVE and taking real card payments** as of 2026-08-22. Both key swaps
are done — Stripe is on live keys, Clerk is on production keys
(`pk_live_`, `clerk.shaklek.com`). A full payment has been made with a real
card.

⚠️ **Never read credential state out of this file.** It lives in the Amplify
console, so a swap leaves no git trace and this doc goes stale silently — which
is exactly what happened on 2026-08-22 and caused a live price vulnerability to
be assessed as "test mode, no real money". Verify it:

```bash
aws amplify get-app --app-id dqcptedylrif0 --query 'app.environmentVariables' --output json
curl -s https://www.shaklek.com/ | grep -oE 'pk_(live|test)_[A-Za-z0-9]+'
```

**Customizer photography is complete for all eight catalog items** as of
2026-08-22 (commit `f4f1864`). Four shirts on `sleeve:length`, four trousers on
`straight/wide` × `full/cropped` — 64 trouser combination photos, front and
back, in four colours each. Twelve base photos were corrected along the way.

- **The method is written down: §4b below.** It was proven across cargo and
  banded and it generalises to new pants, shirts and dresses. Read it before
  generating anything — it is a full day of trial and error distilled, and it is
  the difference between an item taking one hour and taking six.
- Remaining photography work and known defects: `planning/catalog-images-todo.md`.

**Why this mattered:** the customizer *is* the product. Made-to-order only sells
if choosing an option visibly changes the garment; four items with static photos
is a small brand with no reason to exist. Every silhouette decision on this
project is judged against that.

Zero real AI exists in the product itself; that is deliberate (Phase 1 is a
human-run concierge model). The image generation described here is a build-time
tool for producing catalog photos, not a product feature.

**The architecture, as it actually runs, is drawn in
`planning/aws-architecture-diagram.html`** (rewritten 2026-08-26). Open it in a
browser before designing anything that adds a service. The short version:
**Amplify is the only AWS service in the system.** The database is **Neon
Postgres, not RDS**; there is **no S3 bucket** (catalog photography is committed
to the repo); and **no Lambda or EventBridge exists** — the trend job was never
built. That file previously claimed all three and was wrong for months.

### Changed since 2026-08-22, in the order it will bite you

- **Every catalog image is 2:3**, and **113 files carry a true `.jpg`
  extension**. The deployed optimizer picks its output format from the
  extension, not the magic bytes, so a `.png` name served 248KB of PNG where a
  `.jpg` served 18KB. **Any future rename uses `.jpg`, not the old
  JPEG-under-`.png` convention.**
- **`npm run build` runs `scripts/verify-catalog.mjs` first** and exits 1 on a
  `catalog.ts` entry pointing at a missing file. A broken image path used to
  build green and deploy broken.
- **Linen is the only sellable fabric.** `src/data/fabrics.ts` is the single
  source of truth for what can be made; `resolveFabric()` pins it server-side in
  `/api/orders`. The organic-cotton entry is **switched off, not deleted**.
  ⚠️ **On hold until Friday 2026-08-28** pending real in-store quotes — do not
  change a fabric or a price before then. The founder's plan if both fabrics
  can be bought: cotton keeps today's prices, linen +49. That is a price rise in
  `catalog.ts`, **not a `surchargeAed`** — linen is the only fabric today, so
  every live price is already a linen price.
- **There is no active promotion code.** WELCOME20 was deactivated in live
  Stripe on 2026-08-26 with 0 redemptions ever. A code is enterable on our own
  checkout page and validated against the API, so an active code is reachable by
  anyone who guesses the word, advertised or not. **Do not leave one active
  "for later".**
- **The pricing model was rebuilt on real fabric quotes** — see
  `planning/pricing-todo.md`. The old "fabric is not the lever" conclusion is
  struck through: at 30–40 AED/metre, fabric costs more than the tailor.
- **Saving measurements works.** `/api/account/measurements` accepts both the
  field shape and the flattened string the Save button sends; it previously
  matched neither and wrote five empty columns while answering `ok: true`. The
  sign-up modal passes `forceRedirectUrl` because Amplify sets
  `NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/account`, which used to throw
  the customer off the page mid-design. The pending stash in sessionStorage
  **expires after 15 minutes** — that is a security property, asserted in
  `scripts/test-measurements.mjs`, not a nicety.
- **The Meta pixel is built and switched off.** Without
  `NEXT_PUBLIC_META_PIXEL_ID` no script loads and nothing reaches Meta. Turning
  ads on is an environment variable and a redeploy. Product feed at
  `/feed/meta.xml`.

---

## 0. Security — this site takes live card payments

**Read this before touching payments, auth, a route handler, the webhook, or
anything that reads a request body.**

On 2026-08-23 an external audit found that anyone could buy an AED 450 garment
for **AED 5** against live cards, plus three more Critical/High issues. A
follow-up source audit found nine more. Full record and root-cause analysis:
`planning/security/rca-2026-08-23.md`. Read it once; it is short and it is the
reason this section exists.

The cause was not missing knowledge. It was that this file — the project's
operating manual — had a detailed §7 on image-generation discipline and **not
one word about security**, so security was never on any session's checklist
while a payment flow was built over nine days.

### The rule that would have prevented all of it

`/api/orders` was written when `items[].price` was harmless display data for an
email. Stripe was later bolted onto **the same handler**, turning that same
untrusted field into `unit_amount`. The trust boundary moved; the input
handling didn't.

> **When a value starts being used for something new — money, identity,
> authorization — re-audit every place it enters the system.** Extending a
> handler is a new threat model for every field it already read.

### Non-negotiables

- **The server owns every price.** `src/lib/pricing.ts` recomputes from
  `catalog.ts` by slug. Nothing from the request body may reach `unit_amount`
  or the DB. The client's `total` is advisory and only used as a mismatch check.
- **Authorization goes through `getVerifiedEmail()`** (`src/lib/authEmail.ts`).
  Customers are keyed by email, so an unverified address must never authorize.
- **Every write route** gets `rejectCrossOrigin` + `rejectOversizedBody` +
  per-field caps from `src/lib/requestGuards.ts`, and `isUuid()` before any id
  reaches a query.
- **Webhook state transitions are gated**, never unconditional — Stripe
  delivers at-least-once.
- **Never reflect a request header** into a redirect target.
- **Never log PII** (email, measurements, notes). CloudWatch outlives the order.
- **Never create test orders against production.** The external audit left real
  Stripe sessions and order rows in the live Neon DB doing exactly that. Test
  pure functions with `npx tsx --eval`, or probe a local production build.

### Before shipping anything in that blast radius

Run the security agent: `.claude/agents/shaklek-security.md`. There are also
`shaklek-ui` and `shaklek-marketing` agents, each carrying the specific
failures in its own area. They exist so the lessons survive the session that
learned them.

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
| Pants | `legwidth:length` | **straight/wide × cropped/full** | **`straight:full`** |

The pants vocabulary changed on 2026-08-22 (was normal/wide/wider ×
cropped/ankle/full). `comboKeyForCategory` builds keys from the slider option
**values**, so `PANTS_PARAMS` must use exactly `straight`/`wide` and
`cropped`/`full` or the photos become unreachable. Every pants item now has all
three non-default cells in all four colours.

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

## 4b. The trouser combo recipe (proven on Cargo + Banded, 2026-08-22)

The matrix is **2x2**: leg width `straight | wide`, length `full | cropped`.
`straight:full` is the base photo and is never generated. The slider option
*values* in `PANTS_PARAMS` must be `straight`/`wide` and `cropped`/`full` --
`comboKeyForCategory` builds keys from them, so anything else makes the images
unreachable.

### Order of generation -- this is the whole trick

Build each cell **from the cell that already has the property**:

1. `straight:cropped` <- from the **base** (already straight). Shorten only.
2. `wide:full` <- from the **base**. Widen only. **Approve this one image before
   generating anything else** -- everything below inherits from it.
3. `wide:cropped` <- from **`wide:full`**, never from the base. Shorten only.

Generating `wide:cropped` from the base makes the model shorten and quietly skip
the widening, so `straight:cropped` and `wide:cropped` come out identical. That
is what happened to Wide-leg: 3 of 4 colours ended up with `wide:cropped`
*narrower* than `straight:cropped`.

### Colour order

Navy master -> approve -> Ivory using the **same prompt string with only the
colour word changed** -> Burgundy by generative recolour of the approved Navy
files -> White generated from the White base (recolouring pale fabric greys the
skin, see section 5). Re-tuning the prompt between colours is what produced the
over-wide Ivory on 2026-08-21.

### Model tier -- Flash vs Pro

Flash for everything **except reshaping a silhouette**, which it cannot do:

| Edit | Model |
|---|---|
| Shorten / crop | Flash |
| Recolour | Flash |
| Widen a **front** | Flash |
| Widen a **back** | **Pro** |
| Remove a taper (either view) | **Pro** |

Evidence: widening Cargo navy's back moved leg width 0.258 -> 0.244 -> 0.254 on
three Flash attempts (one with a reference image), then 0.470 on one Pro call.
De-tapering the three Banded fronts failed on Flash and worked on Pro first try.
Budget ~1 Pro call per colour per item ($0.134 each).

### References beat descriptions -- always

Pass an approved image via `edit2.mjs` (`EDIT2_INPUT_LABEL` /
`EDIT2_REF_LABEL` set the two labels). Hem height, heel style, leg width and
burgundy shade all landed first try this way and repeatedly failed as prose.

- **Cross-colour references are safe** -- referencing a navy image from an ivory
  or white job did not drag colour across (verify with mean lightness anyway).
- For colour consistency, reference the **base photo of that colour**, not a hex
  target. A hex let Banded burgundy drift to h=357 with a 30-point lightness
  spread; the base as reference pulled it to h=350-355, spread 23.
- **A bad reference propagates silently.** Banded white's back was widened
  against a front that was itself un-widened, so it faithfully copied a straight
  leg. Check the reference is correct before using it.
- For pale colours, reference the **navy** wide image and **drop any "do not
  overdo it" wording** -- that restraint left Cargo ivory/white only 5-9% wider.

### Always pin, in every prompt

The shoes by name ("nude heeled sandals" / "high-heeled shoes, never flat
shoes"), "one single smooth seamless studio backdrop with NO visible panel
edges, vertical lines, seams or dark bands", the pockets that must survive
(cargo side pockets; simple welt back pockets, no flaps, no buttons), the hem
detail (flat turned-up cuff; NOT gathered/elasticated/tapered), the exact colour
word, and the framing/camera angle.

### Backs framed above the hem (Cargo, Pleated)

Extend them before use, or `cropped` and `full` look identical from behind.
Pad the canvas ~30% with the sampled bottom-edge colour, ask the model to
complete the figure and shoes into it, then **trim deterministically**: find the
lowest row with real contrast (the shoes) and keep ~4% of height below it.
Trimming by "uniform rows" instead eats the floor and clips the shoes.

### Check the base photos first

Banded cost roughly double Cargo because eight *shipped* base photos were
internally inconsistent -- all four backs tapered at the ankle while their
fronts fell straight, then three fronts turned out tapered too. Every combo
built on them inherited it. **Do one low-res read of each master, front and
back together, before generating anything from it.**

### Never delete a generated image

**Every generation is money already spent.** Images that were rejected, superseded
or simply not chosen still get archived -- a rejected shape is often the right
answer for a different item, and a "previous version" was needed twice on
2026-08-22 to undo a bad regeneration.

- `gen-verified.mjs` keeps rejected attempts as `<output>.rejected-<n>.png`
  instead of unlinking them. Do not re-add the delete.
- When replacing an image, move the old one to a `rejected/` subfolder. Never
  `rm` it -- `rm` has no undo and cost a paid regeneration on 2026-08-21.
- **The scratchpad is wiped when the session ends.** Before wrapping up, archive
  everything generated to `catalog-archive/<date>-session/` as JPEG q92. That
  directory sits at the repo root, outside `website/`, so it is committed for
  safekeeping but never reaches the Amplify build output.

### Measuring -- and the instruments that lie

The only width measure that works on **both** dark and pale garments: for each
row, estimate that row's own background from its outer 6% of columns, then
measure the span of pixels differing from it by >14. Take the widest row in the
lower leg zone. (Even this saturates when the backdrop has a floor line across
the frame, as Banded's does -- check the base reads sensibly before trusting it.)

Everything else failed at some point today:

- `measure-pants.mjs` counts dark shoes as hem -- reported `hem=0.999` for
  cropped *and* full-length.
- Hue masks catch the floor on ivory/white.
- `normalize-colour.mjs --measure` locks onto **skin** on pale garments -- that
  is why the White base reads h=17.
- `minDiff` cannot catch a missing widening: Banded white's `wide:full` scored
  2.2 against a threshold of 2 and was a pixel-identical duplicate of the
  straight version. Raising the threshold would reject good pale results.

**So: verify the specific thing that was asked for, and on pale colourways look
at the image.** Every pale-fabric defect this session was caught by eye, never
by a metric.

Two rules that keep being re-learned:

- Never verify with a metric that shares the transform's own thresholds -- a
  "0% residual navy" check built from the same hue window is circular. Use an
  independent test (e.g. "blue exceeds red" for burgundy).
- Exposure drift between combos is real (Burgundy spread 45 lightness points on
  Wide-leg) but **do not post-process it**: a +/-45 degree hue window around
  burgundy wraps past 360 into skin hues and tints hands and feet. Regenerate
  the offending cell instead.

### Cost shape

Cargo: ~34 Flash + 6 Pro ~= $2.10. Banded: ~40 Flash + 11 Pro ~= $2.30 (higher
only because its base photos needed fixing). A clean item is roughly **30
generations, ~$1.50**. Fixing one cell in the wide column always cascades --
`wide:cropped` derives from `wide:full`, and the back mirrors the front -- so
settle `wide:full` front first, get it approved, then generate the rest from it.

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

**Trap 3 — Amplify never runs your migration, and a new column breaks
checkout before it breaks the feature you added it for.**

The build spec is `npm ci` then `npm run build`. There is no migrate step and
there never has been. So a commit that adds a column to `schema.ts` deploys
code that believes the column exists against a database where it does not.

That is not a broken feature, it is an outage, because Drizzle's bare
`db.select()` expands to an explicit column list. Seven files use it on
`customers`, and two of them are **`/api/orders`** and the **Stripe webhook** —
so the failure is "nobody can buy" and "cards are charged and the order is
never marked paid", not "the new page 500s".

**⚠️ THERE ARE TWO DATABASES AND `.env.local` POINTS AT THE WRONG ONE.**

```
dev   ep-jolly-cloud-b1e2dn40-pooler…   ← what website/.env.local uses
prod  ep-blue-cell-b1krtp0o-pooler…     ← what Amplify actually serves with
```

They differ only after `ep-`. On 2026-08-28 the `fit_feedback` table was
created, verified against `information_schema`, and reported done — **on dev**,
while the code was already pushed. Production served for a while querying a
table that did not exist there and `/account` broke for every signed-in
customer. Every check run was a real check; not one asked *which database*.

**⚠️ AND `drizzle-kit migrate` DOES NOTHING HERE.** The schema was created with
`drizzle-kit push`, so `drizzle.__drizzle_migrations` is empty; the tool thinks
every migration since 0000 is unapplied, tries to create tables that exist, and
**exits 0 having done nothing**. It did that twice before anyone checked.

**So use the script, which names the database out loud:**

```bash
cd website
node scripts/db-migrate.mjs --target=prod   # or --target=dev. No default.
```

It prints the host, refuses if the host does not match the target, applies each
file in its own transaction, records it in `shaklek_migrations` (our ledger,
not drizzle's), and prints the tables afterwards.

Then **verify against `information_schema`**, never against the exit code —
that is what the exit code got wrong. Additive changes are safe in this order;
the running code simply ignores a table it does not know about.

Additive nullable columns are safe in that order — the running code simply
ignores them. Reverse the order and there is a window with live cards in it.
Found on 2026-08-28 while adding `fit_feedback`; caught before the push.

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

/**
 * Builds the TikTok launch set.
 *
 *   npx tsx scripts/social/tiktok-videos.mjs           # all
 *   npx tsx scripts/social/tiktok-videos.mjs 01 03     # just these
 *
 * Each video is declared as a list of (frame, seconds). Pacing matters more
 * than anything else here: README.md records that 2-7 frames per state reads as
 * a glitch rather than a decision, and roughly 1.2-1.4s per choice is legible.
 * The first state is held longer, because the first two seconds decide whether
 * the rest is watched at all.
 */
import {
  render, encode, hold, photoFrame, sayFrame, gridFrame, endFrame, shot, OUTDIR,
} from "./tiktok-launch.mjs";
import { lint } from "./copy-rules.mjs";
import fs from "node:fs";

const only = process.argv.slice(2);
const want = (id) => only.length === 0 || only.includes(id);

const videos = [];

// ---------------------------------------------------------------------- 01
// The core asset. One trouser, four cuts, the option named as it changes.
// Focus is `legs` throughout: leg width and hem length are the subject, and a
// crop that flatters the face shows four identical frames.
videos.push({
  id: "01",
  name: "01-same-trouser-four-ways",
  caption:
    "Same trouser, four ways to cut it. You pick one and a tailor makes that one. No stock, nothing sitting in a warehouse. Dubai.",
  build() {
    const S = (combo) => shot("wide-leg-trousers", "Ivory", combo);
    const state = (combo, label, hook) =>
      photoFrame({
        src: S(combo),
        focus: "legs",
        hook,
        note: [label[0], label[1]],
        price: "AED 429",
      });
    const f = [];
    f.push(...hold(render(sayFrame({ big: "One trouser.<br>Four ways." }), "v01hook"), 1.9));
    f.push(...hold(render(photoFrame({
      src: S("base"), focus: "legs",
      note: ["Straight", "Full length"],
      price: "AED 429",
    }), "v01a"), 1.4));
    f.push(...hold(render(state("straight:cropped", ["Straight", "Cropped"], "Four ways to cut it"), "v01b"), 1.3));
    f.push(...hold(render(state("wide:full", ["Wide", "Full length"], "Four ways to cut it"), "v01c"), 1.3));
    f.push(...hold(render(state("wide:cropped", ["Wide", "Cropped"], "Four ways to cut it"), "v01d"), 1.3));
    f.push(...hold(render(gridFrame({
      cells: [
        { src: S("base"), label: "Straight, full" },
        { src: S("straight:cropped"), label: "Straight, cropped" },
        { src: S("wide:full"), label: "Wide, full" },
        { src: S("wide:cropped"), label: "Wide, cropped" },
      ],
    }), "v01e"), 2.2));
    f.push(...hold(render(endFrame(), "v01f"), 1.4));
    return f;
  },
});

// ---------------------------------------------------------------------- 02
// The sleeve version. Focus `arms`, because that is what moves.
videos.push({
  id: "02",
  name: "02-the-sleeves-never-fit",
  caption:
    "The shirt fits. The sleeves never do. So we let you set the sleeve, then cut the shirt to your measurements. Same price either way.",
  build() {
    const S = (combo) => shot("oversized-shirt", "Ivory", combo);
    // focus:"full", not "arms". Both the sleeve AND the hem have to be inside
    // the frame or two of the four states are the same picture.
    const state = (combo, note, hook, sub) =>
      photoFrame({ src: S(combo), focus: "full", hook, sub,
        note, price: "AED 389" });
    const f = [];
    f.push(...hold(render(sayFrame({
      big: "The shirt fits.<br>The sleeves<br>never do.",
    }), "v02a"), 2.4));
    f.push(...hold(render(state("short:normal", ["Short sleeve", "Normal length"], "So you set the sleeve"), "v02b"), 1.3));
    f.push(...hold(render(state("base", ["Long sleeve", "Normal length"], "So you set the sleeve"), "v02c"), 1.3));
    f.push(...hold(render(state("long:longer", ["Long sleeve", "Longer"], "So you set the sleeve"), "v02d"), 1.3));
    f.push(...hold(render(state("short:longer", ["Short sleeve", "Longer"], "So you set the sleeve"), "v02e"), 1.3));
    f.push(...hold(render(photoFrame({
      src: S("long:longer"), focus: "full",
      hook: "Then it is cut<br>to your measurements",
      sub: "Or pick XS to XXL. Same price.", subTop: 430,
    }), "v02f"), 2.0));
    f.push(...hold(render(endFrame(), "v02g"), 1.4));
    return f;
  },
});

// ---------------------------------------------------------------------- 03
// Colour. The one sequence where `full` is right, because the whole garment
// is the thing changing.
videos.push({
  id: "03",
  name: "03-pick-a-colour",
  caption:
    "Four colours, one piece. Each image shows the combination you chose, so you can see the cut and the colour before anyone cuts the linen.",
  build() {
    const S = (colour) => shot("wide-leg-trousers", colour, "wide:full");
    const state = (colour, hook) =>
      photoFrame({ src: S(colour), focus: "full", hook: hook || undefined, note: [colour], price: "AED 429" });
    const f = [];
    f.push(...hold(render(sayFrame({ big: "Pick a colour." }), "v03hook"), 1.7));
    f.push(...hold(render(state("Ivory", ""), "v03a"), 1.2));
    f.push(...hold(render(state("White", "Pick a colour"), "v03b"), 1.2));
    f.push(...hold(render(state("Navy", "Pick a colour"), "v03c"), 1.2));
    f.push(...hold(render(state("Burgundy", "Pick a colour"), "v03d"), 1.2));
    f.push(...hold(render(gridFrame({
      cols: 2,
      cells: ["Ivory", "White", "Navy", "Burgundy"].map((c) => ({ src: S(c), label: c, focus: "full" })),
    }), "v03e"), 2.0));
    f.push(...hold(render(endFrame(), "v03f"), 1.4));
    return f;
  },
});


// ---------------------------------------------------------------------- 04
// "Nothing here exists yet." The made-to-order identity line, which research
// found is the one small MTO labels actually use (By Megan Crosby: "if you
// don't place an order with us, the item isn't made"). It reframes the ten-day
// wait as the reason to buy rather than the cost of buying.
videos.push({
  id: "04",
  name: "04-nothing-here-exists-yet",
  caption:
    "Nothing in these pictures exists yet. Not one of them is sitting in a warehouse. You choose the cut, then one tailor makes that piece, and it takes about ten days because it has to.",
  build() {
    const f = [];
    f.push(...hold(render(sayFrame({
      big: "Nothing here<br>exists yet.",
      under: "Not one of these is in a warehouse.",
    }), "v04a"), 2.5));
    f.push(...hold(render(photoFrame({
      src: shot("oversized-shirt", "Burgundy", "long:longer"), focus: "full",
      hook: "Not one of these<br>is in a warehouse",
    }), "v04b"), 1.7));
    f.push(...hold(render(photoFrame({
      src: shot("banded-trousers", "Ivory", "wide:cropped"), focus: "legs",
      hook: "You choose the cut",
      sub: "Sleeve. Leg. Length. Colour.", subTop: 400,
    }), "v04c"), 1.7));
    f.push(...hold(render(photoFrame({
      src: shot("structured-blouse", "White", "long:longer"), focus: "arms",
      hook: "Then one tailor<br>makes that one",
      sub: "About ten days. Because it has to be.", subTop: 430,
    }), "v04d"), 2.2));
    f.push(...hold(render(endFrame(), "v04e"), 1.4));
    return f;
  },
});

// ---------------------------------------------------------------------- 05
// "You are not a medium." The size argument, which is the strongest idea the
// brand owns. ORGANIC ONLY: Meta rejects creative implying knowledge of the
// viewer's body, and second-person size references are the known trigger. The
// ad-safe rewrite lives in planning/marketing/social-playbook.md as h01ad.
videos.push({
  id: "05",
  name: "05-nobody-is-a-medium-ORGANIC-ONLY",
  caption:
    "A size chart is an average of everyone. You are not an average of everyone. Pick a size, or send four measurements and we cut to those instead. Same price.",
  build() {
    const f = [];
    f.push(...hold(render(sayFrame({
      big: "A size chart is<br>an average<br>of everyone.",
    }), "v05a"), 2.6));
    f.push(...hold(render(photoFrame({
      src: shot("structured-blouse", "Ivory", "long:longer"), focus: "full",
      hook: "So pick a size",
      sub: "XS to XXL. Trousers 32 to 44.",
    }), "v05b"), 1.8));
    f.push(...hold(render(photoFrame({
      src: shot("pleated-trousers", "Ivory", "wide:full"), focus: "full",
      hook: "Or send four numbers",
      sub: "Bust. Waist. Hip. Height. We cut to those instead.",
    }), "v05c"), 2.2));
    f.push(...hold(render(photoFrame({
      src: shot("wrap-top", "Ivory", "long:longer"), focus: "full",
      hook: "Same price either way",
      sub: "Tailoring costs nothing extra here.",
    }), "v05d"), 2.0));
    f.push(...hold(render(endFrame(), "v05e"), 1.4));
    return f;
  },
});

// ------------------------------------------------------------------- build
let built = 0;
for (const v of videos) {
  if (!want(v.id)) continue;
  // Every caption goes through the founder's standing corrections before a
  // single frame is encoded. This exists because the first version of these
  // captions called the imagery "the actual piece", which is the exact phrasing
  // scripts/social/README.md forbids.
  lint(v.caption, `${v.name} caption`);
  const frames = v.build();
  const out = `${OUTDIR}/${v.name}.mp4`;
  encode(frames, out);
  const secs = (frames.length / 30).toFixed(1);
  const kb = (fs.statSync(out).size / 1024).toFixed(0);
  console.log(`${v.name}  ${secs}s  ${kb}KB  ${frames.length} frames`);
  fs.writeFileSync(`${OUTDIR}/${v.name}.caption.txt`, v.caption + "\n");
  built++;
}
console.log(`\n${built} video(s) in ${OUTDIR}`);

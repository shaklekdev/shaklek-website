/**
 * The two reels. `node reels.mjs shoulder` / `node reels.mjs label` / `all`.
 * Format rationale and the beat model live in reel-beats.mjs.
 */
import { buildReel, IMG } from "./reel-beats.mjs";

const GOLD = "#9c8445", CREAM = "#faf8f4", INK = "#1a1a1a", PAPER = "#fafafa", NAVY = "#0a2d4a";

/** Photo beat: image under a bottom-weighted veil, words at the foot, slow push. */
const photo = ({ img, words, sub, frames, pos = "50% 40%", from = 1.0, to = 1.07 }) => ({
  frames, motion: true, words: words + " " + (sub ?? ""),
  render: (t) => {
    const s = (from + (to - from) * t).toFixed(4);
    return `
    <img class="bg" src="${img}" style="object-position:${pos};transform:scale(${s});transform-origin:50% 45%">
    <div class="veil" style="background:linear-gradient(to bottom,rgba(26,26,26,.12) 0%,rgba(26,26,26,.30) 38%,rgba(26,26,26,.93) 100%)"></div>
    <div class="mark">Shaklek</div>
    <div class="pad" style="justify-content:flex-end;gap:30px">
      <div class="rule"></div>
      <div class="d" style="color:${PAPER};font-size:112px;line-height:1.03;text-wrap:pretty">${words}</div>
      ${sub ? `<div class="ui" style="color:#d6d0c6;font-size:38px;line-height:1.5;max-width:840px">${sub}</div>` : ""}
    </div>`;
  },
});

/** Text beat on a flat field. `build` reveals eyebrow, line, then sub. */
const text = ({ eyebrow, words, sub, frames, dark = true, bg, build = 1, size = 108 }) => ({
  frames, build, words: [eyebrow, words, sub].filter(Boolean).join(" "),
  render: (_t, step) => `
    <div class="mark ${dark ? "" : "markd"}">Shaklek</div>
    <div class="f" style="background:${bg ?? (dark ? INK : CREAM)}"></div>
    <div class="pad" style="justify-content:center;gap:28px">
      ${eyebrow ? `<div class="eyebrow" style="color:${GOLD}">${eyebrow}</div>` : ""}
      ${build > 1 && step < 1 ? "" : `<div class="d" style="color:${dark ? PAPER : INK};font-size:${size}px;line-height:1.04;text-wrap:pretty">${words}</div>`}
      ${sub && (build === 1 || step >= build - 1) ? `<div class="rule" style="margin-top:14px"></div>
        <div class="ui" style="color:${bg === NAVY ? "#bccadb" : dark ? "#a0a0a0" : "#6b6b6b"};font-size:36px;line-height:1.5;max-width:840px;margin-top:6px">${sub}</div>` : ""}
    </div>`,
});

const SEVENTEEN = [
  ["Chest", 1], ["Thigh", 0], ["Stomach", 0], ["Knee", 0], ["Waist", 1], ["Bottom", 0],
  ["Hips", 1], ["Crotch", 0], ["Shoulder", 0], ["Trouser length", 0], ["Neck", 0],
  ["Band position", 0], ["Biceps", 0], ["Shirt length", 0], ["Elbow", 0], ["Hand length", 0],
  ["Cuff", 0],
];

/** The list beat. Step 0 is the heading alone, step 1 adds the seventeen,
    step 2 adds the four-line payoff. Dimming fourteen of them is the whole
    argument: it shows the gap instead of asserting it. */
const listBeat = (frames) => ({
  frames, build: 3, words: "What the tailor measures. Seventeen. A website can ask you for four.",
  render: (_t, step) => `
    <div class="f" style="background:${CREAM}"></div>
    <div class="mark markd">Shaklek</div>
    <div class="pad" style="justify-content:center;gap:26px">
      <div class="eyebrow" style="color:${GOLD}">WHAT THE TAILOR MEASURES</div>
      <div class="d" style="color:${INK};font-size:126px;line-height:1.0">Seventeen.</div>
      ${step >= 1 ? `<div class="ui" style="display:grid;grid-template-columns:1fr 1fr;column-gap:56px;
        margin-top:26px;font-size:44px;line-height:1.46;color:#c9c4ba">
        ${SEVENTEEN.map(([n, lit]) => `<div${lit ? ` style="color:${INK}"` : ""}>${n}</div>`).join("")}
      </div>` : ""}
      ${step >= 2 ? `<div class="rule" style="margin-top:34px"></div>
        <div class="d" style="color:${INK};font-size:68px;line-height:1.14;margin-top:10px">A website can ask you for four.</div>` : ""}
    </div>`,
});

const close = (line, bg = INK) => ({
  frames: 66, words: line,
  render: () => `
    <div class="f" style="background:${bg}"></div>
    <div class="pad" style="justify-content:center;align-items:center;text-align:center;gap:50px">
      <div class="w" style="color:${PAPER};font-size:150px;line-height:1">Shaklek</div>
      <div class="rule"></div>
      <div class="d" style="color:${bg === NAVY ? "#dde5ee" : "#a0a0a0"};font-size:54px;line-height:1.26;max-width:820px;text-wrap:pretty">${line}</div>
    </div>
    <div class="ui" style="position:absolute;left:0;right:0;bottom:150px;text-align:center;
      color:${bg === NAVY ? "#8ea4bb" : "#6b6b6b"};font-size:32px;letter-spacing:.20em">SHAKLEK.COM</div>`,
});


const REELS = {

  /* THE MADE-TO-ORDER REEL. Founder's insight, 2026-09-13: Belumie posts
     scissors and sewing machines while selling stock that already exists, so
     for them it is set dressing. For us it is a description. That difference
     is the only thing this reel says, and it is the one claim no competitor
     with a warehouse can make.
     Short beats on purpose: roughly two seconds each, hard cuts, one slow push
     inside each. Nothing here is decoration waiting for a voiceover. */
  craft: (I) => ({
    beats: [
      photo({ img: I.bolt, words: "Right now, this is all there is.", frames: 72, pos: "50% 50%", to: 1.06 }),
      photo({ img: I.tape, words: "Until somebody asks for something.", frames: 66, pos: "50% 55%", to: 1.06 }),
      photo({ img: I.chalk, words: "", frames: 48, pos: "50% 50%", to: 1.08 }),
      photo({ img: I.scissors, words: "Then it gets cut.", frames: 66, pos: "50% 50%", to: 1.07 }),
      photo({ img: I.machine, words: "And sewn.", frames: 60, pos: "50% 50%", to: 1.06 }),
      photo({ img: I.needle, words: "One piece. For one person.", frames: 84, pos: "50% 50%", to: 1.07 }),
      close("Join the waitlist.", NAVY),
    ],
    caption: `Nothing in this shop exists yet.

There is cloth, and there is a tailor, and that is it. A piece is cut when somebody asks for it, in their measurements, and not before. No warehouse, no stock room, no rail of things nobody wanted.

It is a slower way to do this and it is the only way we are interested in doing it.

Opening soon. Put your name down at shaklek.com.

#madetoorder #dubaifashion #linen #madeintheuae #shaklek
#دبي #كتان #تفصيل`,
  }),

  // PRE-LAUNCH. No garment, no price, no mechanics. Founder, 2026-09-13:
  // "things showing the customers what we're about to launch but without
  // showing them everything".
  teaser: (I) => ({
    beats: [
      photo({ img: I.placket, words: "We are not showing you the clothes yet.", frames: 90, pos: "50% 46%", to: 1.06 }),
      text({ bg: NAVY, words: "Only the linen, the seams, and the hands that will make them.", frames: 96, size: 98 }),
      photo({ img: I.cuff, words: "Linen.", frames: 84, pos: "50% 50%", to: 1.06,
        sub: "In a country that spends five months above forty degrees." }),
      text({ bg: NAVY, words: "Every piece is cut after somebody asks for it.", frames: 96, build: 2, size: 100,
        sub: "Nothing here exists yet. That is on purpose." }),
      close("Join the waitlist.", NAVY),
    ],
    caption: `We are not showing you the clothes yet. Only the linen, the seams, and the hands that will make them.

Linen, in a country that spends five months above forty degrees. Cut to your shape. Sewn in the UAE after you order it, and not before.

Opening soon. Put your name down at shaklek.com and you will hear from us first.

#comingsoon #dubaifashion #linen #madeintheuae #shaklek
#دبي #كتان #تفصيل`,
  }),
  shoulder: (I) => ({
    beats: [
      photo({ img: I.shoulder, words: "Nobody knows their own shoulder measurement.", frames: 78, pos: "42% 22%" }),
      listBeat(168),
      text({ eyebrow: "THE SHOULDER", words: "Cannot be altered after the cloth is cut.", frames: 96, build: 2,
        sub: "A waist can be taken in. A hem can come up. A shoulder is decided once." }),
      // ⚠️ NO "BEST GUESS". That wording died on 2026-09-14 when Tailored became
      // the measuring visit itself: there are no measurement fields left on the
      // site to guess into. Founder: "I'm NOT MAKING A CUSTOMER PUT 17
      // measurements there." The offer is now simply that we take them.
      photo({ img: I.hands, words: "So we come to you.", frames: 108, pos: "50% 46%",
        sub: "Order your piece, and we come and take all seventeen ourselves before anything is cut. Free, in Dubai." }),
      close("Measured in person on your first order.<br>Cut and sewn in the UAE."),
    ],
    caption: `Nobody knows their own shoulder measurement. It is not a failing, it is just not a number anyone has a reason to know.

Our tailor works from seventeen. A website can ask you for four, and two of the seventeen cannot be taken on yourself at all.

So we come to you. Order your piece, and we come and take all seventeen ourselves before anything is cut. Nothing to measure, nothing to work out. Free, in Dubai.

shaklek.com

#dubaifashion #madetomeasure #madetoorder #linen #shaklek
#دبي #تفصيل #خياطة`,
  }),

  label: (I) => ({
    beats: [
      // ⚠️ DO NOT INSTRUCT A STRANGER. This opened "Check the label on what you
      // are wearing right now", which the founder rejected outright: "no brand
      // would say go and check to their customers." It also opens on a fault in
      // the viewer, which fails her hook rule. Same facts, arriving as the
      // reason her favourite shirt works rather than as a verdict on the rest.
      photo({ img: I.shirt, words: "There is one shirt you reach for every hot day.", frames: 84, pos: "50% 24%" }),
      text({ words: "There is usually a reason it is that one.", frames: 84, size: 100 }),
      text({ eyebrow: "LINEN", words: "Is a plant.", frames: 72, dark: false, build: 2, size: 132,
        sub: "Breathable. Gentle. Comfortable." }),
      text({ eyebrow: "POLYESTER", words: "Is petroleum.", frames: 72, build: 2, size: 132,
        sub: "Traps the heat. Traps the sweat. Holds the smell." }),
      photo({ img: I.flax, words: "Ours is 100% linen.", frames: 84, pos: "50% 50%",
        sub: "One fibre, from a plant that flowers blue." }),
      close("100% linen, cut to your shape.<br>Made in the UAE."),
    ],
    caption: `There is one shirt you reach for every hot day. There is usually a reason it is that one.

Polyester is plastic, and in forty four degrees it traps the heat, it traps the sweat, and it holds on to the smell.

Linen is a plant. It takes up moisture and gives it up again, and it lets air through. That is the entire argument.

Ours is 100% linen, cut to your shape, made in the UAE after you order it.

shaklek.com

#dubaifashion #linen #madetoorder #madetomeasure #shaklek
#دبي #كتان #تفصيل`,
  }),
};

const which = process.argv[2] ?? "all";
const names = which === "all" ? Object.keys(REELS) : [which];
for (const n of names) {
  if (!REELS[n]) throw new Error(`no reel "${n}". have: ${Object.keys(REELS).join(", ")}`);
  const { beats, caption } = REELS[n](IMG);
  buildReel(n, beats, caption);
}

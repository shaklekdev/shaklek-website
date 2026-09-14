/**
 * Pre-launch teasers. Built 2026-09-13 after the founder's direction change:
 * the four offer carousels are held for launch, and what goes out NOW is
 * content that builds a waitlist while the shop is shut.
 *
 * THE BRIEF, in her words: "things teasing the customers, things showing the
 * customers what we're about to launch but without showing them everything."
 *
 * So the hard rule here, and it is the whole format:
 *   ⚠️ NEVER SHOW A WHOLE GARMENT. A collar, a cuff, a hem, a seam, a fold.
 *   Nothing in `src/` is a product shot and nothing here may become one.
 *   The crops in src/ were cut tight for exactly this reason; two of them were
 *   recut on the first pass because one showed a face and one showed a leg.
 *
 * Also: no price, no mechanics, no "how it works". The offer carousels explain
 * the offer. These make somebody want to know what it is. Belumie
 * (@belumie.brand, 135 followers, pre-launch) is running precisely this play
 * and it is written up in planning/marketing/reference-brands.md.
 *
 *   node brand-assets/teaser/build.mjs
 *
 * Out: brand-assets/teaser/ig/<post>/NN.png   1080x1350
 *      brand-assets/teaser/tt/<post>/NN.png   1080x1920
 */
import fs from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { lint } from "../../website/scripts/social/copy-rules.mjs";

const HERE = fileURLToPath(new URL(".", import.meta.url)).replace(/\/$/, "");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const TMP = "/tmp/shaklek-teaser";
const INK = "#1a1a1a", NAVY = "#0a2d4a", CREAM = "#faf8f4", GOLD = "#9c8445", PAPER = "#fafafa";
// Warm nudes for tonal variation inside the light palette, plus the burgundy
// used as a TYPE colour only. The ground never goes dark.
const SAND = "#f4ece1", DEEP_SAND = "#ece1d3", BURGUNDY = "#4a1a2d";

const img = (n) => `data:image/jpeg;base64,${fs.readFileSync(
  n.includes("/") ? `${HERE}/../${n.split("/")[0]}/src/${n.split("/")[1]}.jpg` : `${HERE}/src/${n}.jpg`,
).toString("base64")}`;

const SIZES = {
  ig: { W: 1080, H: 1350, out: "ig", scale: 1 },
  tt: { W: 1080, H: 1920, out: "tt", scale: 1.12 },
};

const css = (W, H, k) => `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400&family=Italiana&family=Reem+Kufi:wght@400;500&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${W}px;height:${H}px;overflow:hidden;background:${INK}}
.f{position:relative;width:${W}px;height:${H}px;overflow:hidden}
.d{font-family:"Cormorant Garamond",Georgia,serif;font-weight:300;letter-spacing:-.012em}
.w{font-family:"Italiana",Georgia,serif;letter-spacing:.138em}
.ui{font-family:-apple-system,BlinkMacSystemFont,sans-serif;font-weight:300}
.ar{font-family:"Reem Kufi",sans-serif;font-weight:400;direction:rtl}
.eyebrow{font-family:-apple-system,sans-serif;font-weight:300;letter-spacing:.26em;font-size:${Math.round(30 * k)}px}
.rule{width:${Math.round(64 * k)}px;height:1px;background:${GOLD}}
.pad{position:absolute;inset:0;display:flex;flex-direction:column;padding:${Math.round(76 * k)}px ${Math.round(80 * k)}px}
.mark{position:absolute;left:${Math.round(80 * k)}px;top:${Math.round(70 * k)}px;
  font-family:"Italiana",Georgia,serif;letter-spacing:.138em;font-size:${Math.round(34 * k)}px}
img.bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.veil{position:absolute;inset:0}
/* The handle, bottom right, on every single slide. Layere does this and it is
   why their text slides still read as theirs after a reshare. */
.handle{position:absolute;right:${Math.round(72 * k)}px;bottom:${Math.round(66 * k)}px;
  font-family:-apple-system,sans-serif;font-weight:300;font-size:${Math.round(26 * k)}px;letter-spacing:.16em}
`;

/** A detail crop under a veil, one line at the foot. */
const detail = ({ src, words, sub, pos = "50% 50%", lift = 0, veil, size = 106, light = false }) => (k) => `
  <img class="bg" src="${img(src)}" style="object-position:${pos}">
  <div class="veil" style="background:${veil ?? "linear-gradient(to bottom,rgba(26,26,26,.06) 0%,rgba(26,26,26,.26) 40%,rgba(26,26,26,.90) 100%)"}"></div>
  <div class="mark" style="color:rgba(250,250,250,.88)">Shaklek</div>
  <div class="pad" style="justify-content:flex-end;padding-bottom:${Math.round((132 + lift) * k)}px;gap:${Math.round(28 * k)}px">
    <div class="rule"></div>
    <div class="d" style="color:${PAPER};font-size:${Math.round(size * k)}px;line-height:1.04;text-wrap:pretty">${words}</div>
    ${sub ? `<div class="ui" style="color:#e2ddd3;font-size:${Math.round(42 * k)}px;line-height:1.44;max-width:${Math.round(820 * k)}px">${sub}</div>` : ""}
  </div>
  <div class="handle" style="color:rgba(250,250,250,.55)">SHAKLEK.COM</div>`;

/** A flat field with one sentence. `bg` is ink, navy or cream. */
const field = ({ bg = INK, eyebrow, words, sub, size = 104, subSize, centre = false, texture, quad, half, monogram, lift, colour }) => (k) => {
  const dark = bg !== CREAM && bg !== SAND && bg !== DEEP_SAND;
  const type = colour ?? (dark ? PAPER : INK);
  return `
  <div class="f" style="background:${bg}"></div>
  ${texture ? `<img src="${img(texture)}" style="position:absolute;inset:0;width:100%;height:100%;
      object-fit:cover;opacity:.30;filter:saturate(.35) brightness(1.28)">
    <div style="position:absolute;inset:0;background:rgba(250,248,244,.55)"></div>` : ""}
  ${monogram ? `<div class="ar" dir="rtl" lang="ar" style="position:absolute;right:${Math.round(-90 * k)}px;
      top:50%;transform:translateY(-50%);font-size:${Math.round(980 * k)}px;line-height:.8;
      color:rgba(26,26,26,.055);pointer-events:none">ش</div>` : ""}
  ${half ? `<div style="position:absolute;top:0;bottom:0;right:0;width:50%;overflow:hidden;
      -webkit-mask-image:linear-gradient(to left,rgba(0,0,0,1) 44%,rgba(0,0,0,0) 100%);
      mask-image:linear-gradient(to left,rgba(0,0,0,1) 44%,rgba(0,0,0,0) 100%)">
      <img src="${img(half)}" style="width:100%;height:100%;object-fit:cover;object-position:52% 50%;
        opacity:.66;filter:saturate(.38) brightness(1.14)"></div>` : ""}
  ${quad ? `<div style="position:absolute;right:0;bottom:0;width:56%;height:46%;overflow:hidden;
      -webkit-mask-image:radial-gradient(120% 120% at 100% 100%,rgba(0,0,0,1) 40%,rgba(0,0,0,0) 100%);
      mask-image:radial-gradient(120% 120% at 100% 100%,rgba(0,0,0,1) 40%,rgba(0,0,0,0) 100%)">
      <img src="${img(quad)}" style="width:100%;height:100%;object-fit:cover;object-position:50% 50%;
        opacity:.52;filter:saturate(.35) brightness(1.18)"></div>` : ""}
  <div class="mark" style="color:${dark ? "rgba(250,250,250,.88)" : "rgba(26,26,26,.60)"}">Shaklek</div>
  <div class="pad" style="justify-content:center;gap:${Math.round(26 * k)}px;${centre ? "align-items:center;text-align:center" : ""}">
    ${eyebrow ? `<div class="eyebrow" style="color:${GOLD}">${eyebrow}</div>` : ""}
    <div class="d" style="${half ? `max-width:${Math.round(560 * k)}px;` : ""}color:${type};font-size:${Math.round(size * k)}px;line-height:1.04;text-wrap:pretty">${words}</div>
    ${sub ? `<div class="rule" style="margin-top:${Math.round(14 * k)}px"></div>
      <div class="${subSize ? "d" : "ui"}" style="color:${subSize ? (dark ? "#dde5ee" : "#3a352d") : dark ? "#bccadb" : colour === BURGUNDY ? "#7a5a63" : "#6b6b6b"};font-size:${Math.round((subSize ?? 42) * k)}px;line-height:${subSize ? 1.08 : 1.44};max-width:${Math.round(820 * k)}px;margin-top:${Math.round((subSize ? 14 : 6) * k)}px">${sub}</div>` : ""}
  </div>
  <div class="handle" style="color:${dark ? "rgba(250,250,250,.5)" : "rgba(26,26,26,.42)"}">SHAKLEK.COM</div>`;
};

/** The waitlist ask. Same place, same words, every time: that repetition IS
    the call to action, and it is the one thing Belumie never varies. */
const waitlist = (bg = CREAM, { line } = {}) => (k) => {
  const dark = bg !== CREAM && bg !== SAND && bg !== DEEP_SAND;
  const ink = dark ? PAPER : INK;
  return `
  <div class="f" style="background:${bg}"></div>
  <div class="pad" style="justify-content:center;align-items:center;text-align:center;gap:${Math.round(40 * k)}px">
    <div class="w" style="color:${ink};font-size:${Math.round(76 * k)}px;line-height:1">Shaklek</div>
    <div class="rule" style="width:${Math.round(76 * k)}px"></div>
    <div class="d" style="color:${ink};font-size:${Math.round(96 * k)}px;line-height:1.12">Join the waitlist.</div>
    ${line ? `<div class="ui" style="color:${dark ? "#bccadb" : "#6b6b6b"};font-size:${Math.round(38 * k)}px;line-height:1.44;max-width:${Math.round(720 * k)}px">${line}</div>` : ""}
    <div class="ui" style="color:${dark ? "#a6b4c2" : "#8a8378"};font-size:${Math.round(34 * k)}px;letter-spacing:.14em;margin-top:${Math.round(6 * k)}px">shaklek.com</div>
  </div>`;
};

/** The coming-soon card: a vellum panel laid over a detail, Belumie's move
    rebuilt in our type instead of theirs. */
const comingSoon = ({ src, year = "2026" }) => (k) => `
  <div class="f" style="background:#2a2320"></div>
  <img class="bg" src="${img(src)}" style="object-position:50% 50%">
  <div class="veil" style="background:rgba(26,26,26,.30)"></div>
  <div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%) rotate(-2.2deg);
    width:${Math.round(560 * k)}px;height:${Math.round(760 * k)}px;background:rgba(250,248,244,.80);
    backdrop-filter:blur(2px);box-shadow:0 30px 90px rgba(0,0,0,.34);
    display:flex;flex-direction:column;justify-content:space-between;align-items:center;
    padding:${Math.round(66 * k)}px ${Math.round(46 * k)}px;text-align:center">
    <div class="eyebrow" style="color:#3d3529">COMING SOON</div>
    <div class="w" style="color:#1f1a14;font-size:${Math.round(76 * k)}px;line-height:1">Shaklek</div>
    <div class="ui" style="color:#3d3529;font-size:${Math.round(30 * k)}px;letter-spacing:.22em">${year}</div>
  </div>
  <div class="handle" style="color:rgba(250,250,250,.62)">SHAKLEK.COM</div>`;

/** Six details, no garment. The caption carries the meaning. */
const grid = (names) => (k) => `
  <div class="f" style="background:${INK};display:grid;grid-template-columns:1fr 1fr 1fr;grid-template-rows:1fr 1fr">
    ${names.map((n) => `<div style="overflow:hidden"><img src="${img(n)}" style="width:100%;height:100%;object-fit:cover"></div>`).join("")}
  </div>
  <div class="handle" style="color:rgba(250,250,250,.8)">SHAKLEK.COM</div>`;

/** The name, in both languages. Nobody has ever said it out loud, and it is
    the entire proposition in one word. Neither reference brand has a name that
    means anything, which is the one place we start ahead. */
const nameCard = ({ bg = NAVY }) => (k) => `
  <div class="f" style="background:${bg}"></div>
  <div class="pad" style="justify-content:center;align-items:center;text-align:center;gap:${Math.round(40 * k)}px">
    <div class="ar" dir="rtl" lang="ar" style="color:${PAPER};font-size:${Math.round(178 * k)}px;line-height:1.18">شكلك</div>
    <div class="w" style="color:${PAPER};font-size:${Math.round(92 * k)}px;line-height:1">Shaklek</div>
    <div class="rule" style="margin-top:${Math.round(10 * k)}px"></div>
    <div class="d" style="color:#dde5ee;font-size:${Math.round(62 * k)}px;line-height:1.2">your shape</div>
  </div>
  <div class="handle" style="color:rgba(250,250,250,.5)">SHAKLEK.COM</div>`;

/** The wordmark lockup, exactly as the live site header sets it
    (website/src/components/Header.tsx:139): Latin first, gold hairline, Arabic
    beneath at about half the size. ⚠️ An earlier draft put شكلك on top at 178px
    and made it the hero. Founder: "You put the Arabic version on top of the
    Latin version, which is not our brand. You changed everything." The lockup
    is a brand asset. Do not redraw it here. */
const lockupSlide = ({ bg = CREAM }) => (k) => {
  const dark = bg !== CREAM && bg !== SAND && bg !== DEEP_SAND;
  const ink = dark ? PAPER : INK;
  return `
  <div class="f" style="background:${bg}"></div>
  <div class="pad" style="justify-content:center;align-items:center;text-align:center;gap:0">
    <div class="w" style="color:${ink};font-size:${Math.round(118 * k)}px;line-height:1">Shaklek</div>
    <div class="rule" style="width:${Math.round(88 * k)}px;margin:${Math.round(34 * k)}px 0"></div>
    <div class="ar" dir="rtl" lang="ar" style="color:${ink};font-size:${Math.round(58 * k)}px;line-height:1.4">شكلك</div>
  </div>`;
};

const POSTS = [
  {
    name: "01-the-name",
    caption: `Welcome to Shaklek.

شكلك is Arabic. It means your way: your look, your shape, the way you carry yourself.

We took the name because everything here starts with you. Made to fit your shape, not a chart. Made to let your skin breathe, not sweat in plastic. You don't fit fashion, fashion fits you.

Opening soon in the UAE.

shaklek.com

#shaklek #dubaifashion #linen #madeintheuae #madetomeasure
#دبي #كتان #تفصيل #شكلك`,
    slides: [
      lockupSlide({}),
      // ش is the brand's monogram and the first letter of شكلك (branding/voice.md),
      // so the slide that explains the name carries the letter behind it.
      field({ bg: CREAM, monogram: true, words: "Shaklek means your look, your way.", size: 112,
        sub: "In Arabic." }),
      // ONE photographic slide. Text lifted clear of the tape so the yellow is
      // the brightest thing in the frame, not something buried under a line.
      detail({ src: "craft/tape", words: "Made to fit your shape, not a chart.",
        sub: "100% tailored.", pos: "50% 46%", lift: 300, size: 106,
        veil: "linear-gradient(to bottom,rgba(30,26,20,.04) 0%,rgba(30,26,20,.26) 26%,rgba(26,22,17,.74) 56%,rgba(26,22,17,.60) 74%,rgba(26,22,17,.34) 100%)" }),
      // Same face, same size, same wash. The difference is that the cloth is
      // confined to one corner instead of running full bleed, which is what
      // stops this reading as slide 3 again. Founder: "keep the same font, the
      // same blurring effect but only quarter of the image."
      field({ bg: SAND, half: "craft/bolt", size: 100,
        words: "Made to let your skin breathe, not sweat in plastic.",
        sub: "100% linen." }),
      // Nude ground, burgundy type. The accent moved from the background into
      // the letters so the set stays light the whole way through.
      // ⚠️ The ask rides ON the payoff slide, it does not get its own. Founder,
      // 2026-09-13: "one sentence in slide 5 saying join the waitlist is better
      // than yet another slide people may never see." Carousel drop-off is
      // steep and a call to action on slide 6 is a call to action nobody reads.
      field({ bg: DEEP_SAND, colour: BURGUNDY, centre: true, size: 104,
        words: "You don't fit fashion.<br>Fashion fits you.",
        sub: "Join the waitlist at shaklek.com" }),
    ],
  },
  {
    name: "02-two-places-at-once",
    caption: `Remember the one pair of pants that fit the hip, the waist and the length? What if that was every pair?

When we asked women what does not fit, nobody said one thing. They said two at once.

The shirt fits, until the chest. The hips fit, the waist never does. Or the waist fits and the length is wrong.

That is what a size chart does: it takes one set of proportions and applies it to a whole country.

Which two never fit together for you? Tell us below.

shaklek.com

#dubaifashion #madetomeasure #shaklek
#دبي #تفصيل`,
    // ⚠️ THE OPENER IS HERS, WORD FOR WORD, and it replaces one that opened on
    // what is wrong with the reader. "The shirt fits. Until the chest." fails
    // her hook test: it starts with a body that disappoints. Hers starts with
    // the one garment that worked and then widens it, which is the formula in
    // planning/marketing/reference-brands.md:193.
    //
    // The grounds are light the whole way through for the same reason post 01
    // is: "it needs to stay light." INK and NAVY grounds are gone; burgundy
    // survives as TYPE on the closing slide.
    slides: [
      field({ bg: CREAM, words: "Remember the one pair of pants that fit the hip, the waist and the length?", size: 112 }),
      field({ bg: SAND, words: "What if that was every pair?", size: 128, centre: true }),
      field({ bg: CREAM, words: "A size chart takes one set of proportions", sub: "and applies it to a whole country.", size: 116, subSize: 108 }),
      detail({ src: "placket-ivory", words: "It is never one thing. It is always two at once.", pos: "50% 46%" }),
      field({ bg: DEEP_SAND, colour: BURGUNDY, centre: true, size: 120,
        words: "Which two never fit together?", sub: "Tell us below. We are listening before we open." }),
    ],
  },

  /* Founder's note, 2026-09-13: the first version of this post was unreadable
     to anybody who did not already know the brand. The fix she asked for was
     to make it a joke about herself rather than an argument about fabric, and
     to let the fact arrive last. */
  {
    name: "03-i-used-to-be-cool",
    caption: `I used to be cool. Now I check the label before I check the price.

Polyester is plastic. It is made from petroleum, it traps heat, and it holds on to smell. In a country that spends five months above forty degrees, you feel that by the afternoon.

Linen is a plant. It takes up moisture and gives it up again, and it lets the air through.

Coming soon. shaklek.com

#linen #dubaifashion #shaklek
#دبي #كتان`,
    slides: [
      // Copy untouched: it is her joke about herself and it passes the hook
      // test by putting the speaker, not the reader, in the wrong. Only the
      // grounds changed, INK and NAVY out.
      field({ bg: CREAM, words: "I used to be cool.", size: 148, centre: true }),
      field({ bg: SAND, words: "Now I check the label before I check the price.", size: 116 }),
      field({ bg: CREAM, colour: BURGUNDY, words: "Because polyester is plastic.", size: 120, sub: "Petroleum. It traps the heat and it keeps the smell." }),
      detail({ src: "cuff-burgundy", words: "Linen is a plant.", sub: "It lets the air through. That is the whole difference.", pos: "50% 50%" }),
      waitlist(),
    ],
  },

  /* Founder's note, same day: "I don't want this to be like accusing the
     customer of making them feel bad for wearing polyester." So the second
     slide puts us in it with them, the fact carries no blame, and the ask at
     the end is a question rather than an instruction. An earlier draft said
     "go and check the label", which she rejected outright: no brand tells a
     stranger to go and inspect themselves. */
  {
    name: "04-are-you-wearing-polyester",
    caption: `There is one shirt you reach for every hot day. There is usually a reason it is that one.

Linen takes up moisture and gives it back again, and it lets the air through. That is the whole difference by four in the afternoon.

Polyester is petroleum. It traps heat and it holds smell, which is a particular problem in this country between May and September.

What is your hot-day shirt made of? Tell us below.

shaklek.com

#linen #dubaifashion #shaklek
#دبي #كتان`,
    slides: [
      // ⚠️ REWRITTEN OPENER. "Are you wearing polyester right now?" is the
      // same move as "go and check the label", which she rejected outright: it
      // asks a stranger to inspect herself and find fault. This opens on the
      // shirt she already loves and explains WHY it is the one, so the fact
      // arrives as a reason rather than a verdict.
      field({ bg: CREAM, words: "There is one shirt you reach for every hot day.", size: 118 }),
      field({ bg: SAND, words: "There is usually a reason it is that one.", size: 126, centre: true }),
      field({ bg: CREAM, words: "Linen takes up moisture and gives it back.", sub: "It lets the air through.", size: 118 }),
      detail({ src: "fold-navy", words: "Polyester is petroleum.", sub: "It traps the heat, and it keeps the smell.", pos: "50% 50%" }),
      field({ bg: DEEP_SAND, colour: BURGUNDY, words: "What is your hot-day shirt made of?", size: 118, sub: "Tell us below.", centre: true }),
    ],
  },
/* The made-to-order argument told through the tools rather than asserted.
     Founder, 2026-09-13: Belumie runs scissors and sewing machines while
     selling stock that already exists. For them it is set dressing; for us it
     is literally the process. ⚠️ The images are generated (brand-assets/craft/
     gen.mjs) so the copy talks about WHAT HAPPENS, never about these hands or
     this room. Replace with real footage from the tailor when she visits. */
  {
    name: "05-nothing-here-exists-yet",
    caption: `Nothing in this shop exists yet.

There is cloth, and there is a tailor, and that is it. A piece is cut when somebody asks for it, in their measurements, and not before.

No warehouse. No stock room. No rail of things nobody wanted.

Opening soon. shaklek.com

#madetoorder #dubaifashion #linen #madeintheuae #shaklek
#دبي #كتان #تفصيل`,
    slides: [
      detail({ src: "craft/bolt", words: "Right now, this is all there is.", pos: "50% 50%" }),
      detail({ src: "craft/tape", words: "Until somebody asks for something.", pos: "50% 55%" }),
      detail({ src: "craft/scissors", words: "Then it gets cut.", sub: "In their measurements, and not before.", pos: "50% 50%" }),
      field({ bg: SAND, words: "No warehouse. No stock room.", size: 118, sub: "No rail of things nobody wanted." }),
      waitlist(),
    ],
  },
];

fs.mkdirSync(TMP, { recursive: true });
for (const post of POSTS) {
  lint(post.caption, `${post.name} caption`);
  for (const [key, S] of Object.entries(SIZES)) {
    const dir = `${HERE}/${S.out}/${post.name}`;
    fs.mkdirSync(dir, { recursive: true });
    post.slides.forEach((slide, i) => {
      const body = slide(S.scale);
      lint(body.replace(/<[^>]+>/g, " ").replace(/data:image\/[^"]+/g, ""), `${post.name} slide ${i + 1}`);
      const html = `<!doctype html><meta charset="utf-8"><style>${css(S.W, S.H, S.scale)}</style><div class="f">${body}</div>`;
      fs.writeFileSync(`${TMP}/t.html`, html);
      const png = `${dir}/${String(i + 1).padStart(2, "0")}.png`;
      execFileSync(CHROME, ["--headless", "--disable-gpu", "--hide-scrollbars",
        "--virtual-time-budget=3000", `--window-size=${S.W},${S.H}`, `--screenshot=${png}`, `file://${TMP}/t.html`], { stdio: "ignore" });
      if (!fs.existsSync(png)) throw new Error(`chrome produced nothing for ${post.name} ${i + 1}`);
    });
    fs.writeFileSync(`${dir}/caption.txt`, post.caption + "\n");
  }
  console.log(`${post.name}  ${post.slides.length} slides x ig+tt`);
}

/**
 * Generates planning/marketing/posting-calendar.md from the assets that
 * actually exist on disk.
 *
 *   npx tsx scripts/social/build-calendar.mjs
 *
 * WHY GENERATED AND NOT WRITTEN BY HAND: a calendar naming a file that was
 * renamed or never rendered is worse than no calendar, because it is found at
 * the moment someone is trying to post. This reads the directories, so every
 * path in the document is a path that resolves.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = "/Users/nadatlohi/Desktop/Shaklek";
const TT = `${ROOT}/brand-assets/TIKTOK`;
const IG = `${ROOT}/brand-assets/INSTA/carousels`;
const OUT = `${ROOT}/planning/marketing/posting-calendar.md`;

const videos = fs.existsSync(TT)
  ? fs.readdirSync(TT).filter((f) => f.endsWith(".mp4")).sort()
  : [];
const carousels = fs.existsSync(IG)
  ? fs.readdirSync(IG).filter((d) => fs.statSync(path.join(IG, d)).isDirectory()).sort()
  : [];

const caption = (file) => {
  const c = `${TT}/${file.replace(/\.mp4$/, ".caption.txt")}`;
  return fs.existsSync(c) ? fs.readFileSync(c, "utf8").trim() : "(no caption file)";
};
const carouselCaption = (name) => {
  const c = `${IG}/${name}/caption.txt`;
  return fs.existsSync(c) ? fs.readFileSync(c, "utf8").trim() : "(no caption file)";
};
const slideCount = (name) =>
  fs.readdirSync(`${IG}/${name}`).filter((f) => f.endsWith(".png")).length;

const HASH = "#dubaifashion #madetomeasure #madetoorder #linen #shaklek\n#دبي #تفصيل #خياطة";

// Alternating video / carousel, so neither format carries the whole month and
// the account reads as one niche rather than one gimmick. Days marked FILM are
// the founder's phone: they are the pillar that cannot be rendered, and the
// month is deliberately front-loaded with rendered assets so filming can start
// in week two without a gap.
const plan = [];
let vi = 0, ci = 0;
const FILM = [
  ["Founder to camera, 30 seconds, no script", "Why you started a made-to-order label in the UAE. Do not rehearse it and do not reshoot it five times. Lo-fi outperforms produced here."],
  ["Shears through linen, 10 seconds, sound on", "The single highest-value clip you can capture. Close. This is the one thing the catalogue imagery can never give you."],
  ["Chalk marking on fabric", "Hands only. No face needed."],
  ["The machine, 15 seconds", "Close enough to see the needle."],
  ["The hem being turned", "Slow. This is ASMR territory and it earns rewatches."],
  ["Wrapping a finished piece", "Tissue, then the gold seal going on."],
  ["An order being made, day 1", "Name the customer's city and their combination. This is the format that beats every stocked brand: they get one beat, the box. You get ten."],
  ["The same order, finished", "Part two. Post it as a reply to the first, so the pair reads as a series."],
];

for (let day = 1; day <= 30; day++) {
  const isFilm = day % 7 === 0 || (day > 12 && day % 3 === 0);
  if (isFilm && FILM.length) {
    const [what, note] = FILM.shift();
    plan.push({ day, kind: "FILM", what, note });
  } else if (day % 2 === 1 && vi < videos.length) {
    plan.push({ day, kind: "VIDEO", file: videos[vi], caption: caption(videos[vi]) });
    vi++;
  } else if (ci < carousels.length) {
    plan.push({ day, kind: "CAROUSEL", file: carousels[ci], caption: carouselCaption(carousels[ci]), slides: slideCount(carousels[ci]) });
    ci++;
  } else if (vi < videos.length) {
    plan.push({ day, kind: "VIDEO", file: videos[vi], caption: caption(videos[vi]) });
    vi++;
  } else {
    plan.push({ day, kind: "REPOST", what: "Best performer so far, recut or reframed", note: "Do not delete flops. Repost winners with a different opening line and see whether the hook or the video was the thing that worked." });
  }
}

let md = `# Posting calendar

**Generated from the assets on disk** by \`website/scripts/social/build-calendar.mjs\`,
so every path here resolves. Regenerate after building new assets.

Strategy, account setup and the legal item to settle first: \`tiktok-launch.md\`.
Grid, bio and Instagram captions: \`instagram-launch.md\`.

## Before day 1

- [ ] **Business account**, not personal. The bio link needs it, and TikTok Shop
      does not exist in the UAE so the link is the entire funnel.
- [ ] **Settle the Advertiser Permit question.** It is free. See \`tiktok-launch.md\`.
- [ ] Bio link to the size guide, not the home page. That is the page that
      captures measurements, and measurements are the thing that makes someone
      a customer twice.
- [ ] Display name carries the search words: **Shaklek | Made-to-order Dubai**.

## How to read this

- **VIDEO** and **CAROUSEL** are rendered and sitting in \`brand-assets/\`.
- **FILM** is your phone. Nothing else can produce these.
- Post the same asset to TikTok and to Instagram, uploading the **original file
  from \`brand-assets/\`** to each. Never use TikTok's share-to-Instagram button:
  the watermark is downranked on Reels and 2026 enforcement catches it in seconds.
- Every carousel is rendered twice, 1080x1920 for TikTok photo mode and
  1080x1350 for Instagram.

| Day | What | Asset |
|---|---|---|
`;

for (const p of plan) {
  if (p.kind === "FILM") md += `| ${p.day} | 📱 **FILM** | ${p.what} |\n`;
  else if (p.kind === "VIDEO") md += `| ${p.day} | 🎬 Video | \`TIKTOK/${p.file}\` |\n`;
  else if (p.kind === "CAROUSEL") md += `| ${p.day} | 🖼 Carousel, ${p.slides} slides | \`carousels/${p.file}/\` |\n`;
  else md += `| ${p.day} | ♻️ Repost | ${p.what} |\n`;
}

md += `\n---\n\n## The captions\n\nCopy these as they are. The first characters of a caption are weighted most in
TikTok search, so the target phrase leads.\n\n`;

for (const p of plan) {
  if (p.kind === "VIDEO") {
    md += `### Day ${p.day} · \`${p.file}\`\n\n> ${p.caption}\n\n\`\`\`\n${HASH}\n\`\`\`\n\n`;
  } else if (p.kind === "CAROUSEL") {
    const [cap, ...rest] = p.caption.split("\n\n");
    md += `### Day ${p.day} · \`${p.file}\` (${p.slides} slides)\n\n> ${cap}\n\n\`\`\`\n${rest.join("\n").trim() || HASH}\n\`\`\`\n\n`;
  } else if (p.kind === "FILM") {
    md += `### Day ${p.day} · 📱 ${p.what}\n\n${p.note}\n\n`;
  }
}

md += `---

## After 30 days, not before

Judge nothing until there are 30 videos of data. A new account is not
penalised: every post goes to a test audience of a few hundred non-followers
matched by interest, and follower count does not affect distribution. But the
analytics mean nothing until there is a month of them.

**Then read, in this order:** completion rate, rewatches, shares (a share by DM
is worth roughly double a feed share), saves. Likes last, and mostly ignore
them.

**Do not delete flops.** They do not poison the account.

⚠️ **A video that works is a capacity event.** One tailor is roughly 11 to 22
garments a month. The site promises ten days. Know who the second tailor is
before you push, because breaking that promise on the first fifty customers
costs more than growing slowly would have.
`;

fs.writeFileSync(OUT, md);
console.log(`wrote posting-calendar.md: ${videos.length} videos, ${carousels.length} carousels, ${plan.filter((p) => p.kind === "FILM").length} film days`);

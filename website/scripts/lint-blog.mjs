// Run the founder's copy rules over every journal article, and fail the build.
//
//   npx tsx scripts/lint-blog.mjs
//
// WHY THIS EXISTS. scripts/social/copy-rules.mjs has enforced these rules for
// social copy since 2026-08-27 and NOTHING ran it against the articles. A
// review on 2026-09-13 found three live violations that had been published for
// eight days: two "long sleeve" lines against a catalogue where no photograph
// shows a sleeve worn down, and one "most sustainable garment", a word the
// claim rules replace with the mechanism.
//
// It is wired into `npm run build` beside verify-catalog.mjs, for the same
// reason that one exists: a broken claim used to build green and deploy.
// An article is worse than a social post here, because a post scrolls away and
// an indexed article sits there being wrong.
import { lint } from "./social/copy-rules.mjs";
import { articles } from "../src/data/blog.ts";

let violations = 0;

// ⚠️ THE ONE EXEMPTION, AND IT IS NARROW. A block flagged `market: true`
// carries somebody else's price, so the stale-price rules -- which assume
// every number is a Shaklek offer -- would fire on a true sentence. Nothing
// else is suppressed, and every skip is printed, because an exemption nobody
// sees is how a real violation eventually hides behind a flag.
const STALE_PRICE = /stale price:/;
let skips = 0;

function check(value, where, market = false) {
  if (typeof value !== "string" || !value) return;
  try {
    lint(value, where);
  } catch (err) {
    const msg = String(err.message);
    if (market && STALE_PRICE.test(msg)) {
      console.log(`  skipped (market price, not ours): ${where}`);
      skips++;
      return;
    }
    console.error(msg);
    violations++;
  }
}

for (const a of articles) {
  check(a.title, `${a.slug} title`);
  check(a.description, `${a.slug} description`);
  check(a.intro, `${a.slug} intro`);
  a.blocks.forEach((b, i) => {
    const where = `${a.slug} block[${i}] (${b.type})`;
    check(b.text, where, b.market === true);
    check(b.caption, where);
    for (const item of b.items ?? []) check(item, `${where} item`);
    // Palette rows carry prose in `note`, which is exactly where an unsourced
    // claim hides: it sits next to a swatch and therefore reads as authority.
    for (const row of b.rows ?? []) {
      check(row.note, `${where} palette note`);
      check(row.outer?.name, `${where} palette outer`);
    }
  });
}

if (violations) {
  console.error(`\n${violations} claim-rule violation(s) in the journal. Nothing ships with these.`);
  process.exit(1);
}
console.log(`journal ok — ${articles.length} articles, no claim-rule violations${skips ? `, ${skips} market-price skip(s)` : ""}`);

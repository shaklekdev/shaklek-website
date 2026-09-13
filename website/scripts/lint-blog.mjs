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

// ⚠️ THE CROSS-LINK GRAPH IS CHECKED, NOT TRUSTED. Founder, 2026-09-13: "they
// all need link for each other's articles." Rule 5 of the journal brief has
// been in the file since the journal existed and TWO of the four articles
// still pointed at nothing eight days after publication, because a rule in a
// document only fires when somebody remembers to read it. This runs in
// `npm run build` whether or not anyone is paying attention, which is the
// whole argument in CLAUDE.md §7 for a check over a rule.
const SLUGS = new Set(articles.map((a) => a.slug));
const linksOut = new Map(articles.map((a) => [a.slug, new Set()]));
const linksIn = new Map(articles.map((a) => [a.slug, new Set()]));

function fail(msg) {
  console.error(msg);
  violations++;
}

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
  check(a.hero?.alt, `${a.slug} hero alt`);
  a.blocks.forEach((b, i) => {
    const where = `${a.slug} block[${i}] (${b.type})`;
    check(b.text, where, b.market === true);
    check(b.caption, where);
    check(b.alt, `${where} alt`);
    // ⚠️ ADDED 2026-09-13. `pair` alts and `looks` labels were the only
    // customer-visible strings in an article this script could not see, and a
    // `looks` label is exactly where a banned "long sleeve" would land, since
    // labelling these by sleeve is the mistake the block comment in blog.ts
    // warns about. Alt text is read aloud; it is copy.
    for (const side of [b.a, b.b]) {
      if (!side) continue;
      check(side.alt, `${where} image alt`);
      check(side.label, `${where} label`);
    }
    if (b.type === "link") {
      // A link whose reason is missing is a "related articles" box, which is
      // the thing rule 5 forbids. Treat an empty one as a violation, not a nit.
      if (!b.reason || !b.reason.trim()) {
        fail(`${where}: a link block needs a reason. Rule 5 is "a sentence that gives a reason to follow it".`);
      }
      check(b.reason, `${where} reason`);

      if (!SLUGS.has(b.slug)) {
        fail(`${where}: links to "${b.slug}", which is not an article slug. A renamed article left a dead link.`);
      } else if (b.slug === a.slug) {
        fail(`${where}: links to its own article.`);
      } else {
        linksOut.get(a.slug).add(b.slug);
        linksIn.get(b.slug).add(a.slug);
      }
    }
    for (const item of b.items ?? []) check(item, `${where} item`);
    // Palette rows carry prose in `note`, which is exactly where an unsourced
    // claim hides: it sits next to a swatch and therefore reads as authority.
    for (const row of b.rows ?? []) {
      check(row.note, `${where} palette note`);
      check(row.outer?.name, `${where} palette outer`);
    }
  });
}

// No dead ends, and nothing linked from nowhere. An article with no way in is
// invisible to every reader who did not arrive from a search result, and an
// article with no way out spends the attention it earned and returns nothing.
for (const a of articles) {
  if (linksOut.get(a.slug).size === 0) fail(`${a.slug}: dead end. It links to no other article.`);
  if (linksIn.get(a.slug).size === 0) fail(`${a.slug}: orphan. No other article links to it.`);
}

if (!violations) {
  console.log("\nlink map:");
  for (const a of articles) {
    console.log(`  ${a.slug}`);
    console.log(`    out -> ${[...linksOut.get(a.slug)].join(", ")}`);
    console.log(`    in  <- ${[...linksIn.get(a.slug)].join(", ")}`);
  }
}

if (violations) {
  console.error(`\n${violations} claim-rule violation(s) in the journal. Nothing ships with these.`);
  process.exit(1);
}
console.log(`journal ok — ${articles.length} articles, no claim-rule violations${skips ? `, ${skips} market-price skip(s)` : ""}`);

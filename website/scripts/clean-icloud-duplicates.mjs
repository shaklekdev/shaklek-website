#!/usr/bin/env node
/**
 * Removes iCloud's "<name> 2.<ext>" conflict copies before they break a build.
 *
 * WHY THIS EXISTS: this repo lives in ~/Desktop and Desktop is synced by
 * iCloud. When iCloud thinks a file changed in two places it keeps both and
 * renames the loser with a " 2" suffix. That has now bitten six times:
 *
 *   - `.git/index` — NINETEEN copies found 2026-08-31, of the file git
 *     rewrites on every `git add`. iCloud racing git's own writes.
 *   - `.git/refs/remotes/origin/main 2` — a null-sha1 ref that made every
 *     `git branch` print a warning and `git fsck` report an error.
 *   - `.next/types/*` — THIS is the one that stops work: it breaks `tsc` with
 *     phantom "Duplicate identifier" and "declarations conflict" errors in
 *     files nobody wrote. Costs ten minutes of confusion every time.
 *   - `public/catalog/`, `public/marketing/` — 143 resurrected .png twins.
 *   - `planning/marketing/` — five copies of files written minutes earlier.
 *
 * ⚠️ THIS SCRIPT IS A BANDAGE, NOT THE FIX. The fix is to move the repo out of
 * ~/Desktop, or turn off iCloud's Desktop & Documents sync. A git working tree
 * does not belong inside a file syncer: both write the same files and only one
 * of them understands git.
 *
 * DELETION POLICY, because CLAUDE.md is emphatic that `rm` has no undo and it
 * has already cost a paid regeneration on this project:
 *   - Inside `.next/` (generated, reproducible) a duplicate is deleted.
 *   - ANYWHERE ELSE it is only REPORTED, never touched, even when byte
 *     identical. Source and planning files are not this script's to delete.
 *
 * Always exits 0. A cosmetic sync artefact must never be the reason a deploy
 * fails — the build has real gates for real problems.
 */
import { readdirSync, statSync, unlinkSync, readFileSync, existsSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const WEBSITE = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/** "foo 2.ts", "index 19", "bar 3.png" — a space, digits, then end or extension. */
const DUPLICATE = /\s\d+(\.[^.]+)?$/;

/** Never walk into these: huge, and nothing in them is ours to clean. */
const SKIP = new Set(["node_modules", ".git"]);

function walk(dir, found = []) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return found; // unreadable directory is not this script's problem
  }
  for (const entry of entries) {
    if (SKIP.has(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, found);
    else if (DUPLICATE.test(entry.name)) found.push(full);
  }
  return found;
}

/** The file this is a copy of, if it exists — "foo 2.ts" -> "foo.ts". */
function twinOf(path) {
  const candidate = path.replace(/\s\d+(\.[^.]+)?$/, (_, ext) => ext ?? "");
  return candidate !== path && existsSync(candidate) ? candidate : null;
}

const found = walk(WEBSITE);
if (found.length === 0) process.exit(0);

const generated = found.filter((f) => f.includes("/.next/"));
const elsewhere = found.filter((f) => !f.includes("/.next/"));

let removed = 0;
for (const file of generated) {
  try {
    unlinkSync(file);
    removed++;
  } catch {
    /* already gone, or in use — either way not worth failing over */
  }
}

if (removed > 0) {
  console.log(`[icloud] removed ${removed} conflict cop${removed === 1 ? "y" : "ies"} from .next/ (generated, rebuilt below)`);
}

for (const file of elsewhere) {
  const twin = twinOf(file);
  let note = "no original found";
  if (twin) {
    try {
      note = readFileSync(file).equals(readFileSync(twin))
        ? `byte-identical to ${twin.replace(WEBSITE + "/", "")}`
        : `DIFFERS from ${twin.replace(WEBSITE + "/", "")} — check before deleting`;
    } catch {
      note = "could not compare";
    }
  }
  console.warn(`[icloud] ⚠️  ${file.replace(WEBSITE + "/", "")} — ${note}. Not deleted; yours to review.`);
}

if (elsewhere.length > 0) {
  console.warn(
    `[icloud] ${elsewhere.length} conflict cop${elsewhere.length === 1 ? "y" : "ies"} outside .next/. ` +
      `They are gitignored, so they will not be committed. The permanent fix is to move this repo out of ~/Desktop.`,
  );
}

process.exit(0);

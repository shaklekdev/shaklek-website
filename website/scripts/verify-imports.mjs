// Every "@/..." import in a TRACKED file must resolve to a TRACKED file.
//
// WHY THIS EXISTS: on 2026-08-26 production failed to build for two commits
// while `npm run build` passed locally every time. `src/data/fabrics.ts` was
// untracked, but two committed files imported it. The local build reads the
// WORKING TREE, where the file exists; Amplify builds a git CHECKOUT, where it
// does not. A green local build proves nothing about a file that was never
// added -- and the failure is silent, because Amplify keeps serving the old
// version.
//
// More than one Claude session shares this working tree, so a file appearing
// on disk without appearing in git is a normal state, not an unusual one.
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

const repoRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim();
const tracked = new Set(
  execFileSync("git", ["ls-files"], { cwd: repoRoot, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 })
    .split("\n")
    .filter(Boolean),
);

const sources = [...tracked].filter((f) => f.startsWith("website/src/") && /\.(ts|tsx)$/.test(f));
const EXT = ["", ".ts", ".tsx", ".js", ".jsx", "/index.ts", "/index.tsx"];

const missing = [];
for (const file of sources) {
  const body = execFileSync("git", ["show", `HEAD:${file}`], { cwd: repoRoot, encoding: "utf8" });
  for (const m of body.matchAll(/from\s+["'](@\/[^"']+)["']/g)) {
    const rel = "website/src/" + m[1].slice(2);
    if (EXT.some((e) => tracked.has(rel + e))) continue;
    const onDiskOnly = EXT.some((e) => existsSync(path.join(repoRoot, rel + e)));
    missing.push(`  ${file}\n      imports ${m[1]}  →  ${onDiskOnly ? "EXISTS ON DISK BUT IS NOT COMMITTED" : "does not exist at all"}`);
  }
}

if (missing.length) {
  console.error("Committed code imports files git does not have:\n" + missing.join("\n"));
  console.error("\nAmplify builds a git checkout, so this WILL fail the deploy.");
  process.exit(1);
}
console.log(`ok — every @/ import in ${sources.length} tracked files resolves to a tracked file`);


## 2026-08-30 — five in planning/marketing/

Byte-identical copies of the five files the marketing agent had just written,
appearing minutes later with " 2.md" names. Verified identical with `cmp` before
moving; nothing was lost.

**This is the fourth occurrence on this project and the third distinct location:**
`.next/types` (broke a typecheck with phantom duplicate-identifier errors),
`public/catalog` and `public/marketing` (143 resurrected .png twins), and now
`planning/`. The same night, `git branch -a` also warned
`ignoring ref with broken name refs/remotes/origin/main 2` — so it reaches
`.git/refs` too.

**Archived rather than deleted, per the project's standing rule.** They are
duplicates of committed files, so deleting would have been safe here, but `rm`
has no undo and the rule exists because it cost a paid regeneration once.

**Practical tell:** after any batch that writes several files, run
`git status --porcelain | grep ' 2\.'` before committing. A " 2" file is never
intentional in this repo.

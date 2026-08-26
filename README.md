# Shaklek

Made-to-order fashion, UAE. Live at **www.shaklek.com**, taking real card
payments.

**Working on the code? Read `CLAUDE.md` first** — it is the operating manual,
and §0 (security) and §7 (how to work here) matter more than the rest.

**Want to know what is deployed and how?** Open
**`planning/aws-architecture-diagram.html`** in a browser. That is the map: the
live component list, the purchase flow, where the images live, the deploy
traps, and what is still pending. Every change to the environment is recorded
there.

---

## What each folder is

| Folder | Contains | Served to customers? |
|---|---|---|
| **`website/`** | The Next.js application — every page, API route, and **every image the site serves** (`website/public/catalog/`, `website/public/marketing/`). Deployed to AWS Amplify on push to `main` | ✅ **Yes. This is the product.** |
| **`branding/`** | The brand handover: final logo artwork, fonts, packaging and voice. **Start at `branding/README.md`** — it says to send `send-to-supplier/`, which is the whole supplier package | ❌ No |
| **`planning/`** | Docs. The architecture map, pricing model, security RCAs, marketing playbooks, and `session-log.md` — read that before editing, more than one session works here at once | ❌ No |
| **`brand-assets/`** | Working folder for Instagram and TikTok production: stills, reels, avatars. ⚠️ **Gitignored — exists on disk only and cannot be recovered from git** | ❌ No |
| **`catalog-archive/`** | Every image generation ever paid for, kept by date. CLAUDE.md's rule: a generated image is never deleted, because a rejected shape is often the right answer for a different item | ❌ No |
| **`insparation/`** | Reference screenshots feeding social content. Gitignored (sic — the spelling is original) | ❌ No |
| **`_archive/`** | **Superseded work, kept rather than deleted.** Nothing here is used, referenced, or built. See `_archive/README.md` | ❌ No |

## The short version

- Anything a customer ever sees lives in **`website/`**, and nowhere else.
- Anything superseded lives in **`_archive/`**, and is never deleted.
- **`brand-assets/` and `insparation/` are not in git.** Back them up
  separately; a lost file there is lost for good.

## Everyday commands

```bash
cd website
npm run dev            # localhost:3000
npm run build          # must pass before pushing — also verifies every
                       # catalog image path and every import resolves
npx tsc --noEmit -p .  # the build does NOT catch every type error; this does
```

Deploy by pushing to `main`. A failed build is silent — the site keeps serving
the previous version — but it now emails `hello@shaklek.com`.

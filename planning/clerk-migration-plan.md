# Getting Clerk off the public routes

**Status: plan only. Nothing here is implemented.**

## The measurement

Clerk is **188.7 kb raw / 54.7 kb gzipped — 24% of homepage JS**. It is pulled
in by **`ClerkProvider` in `src/app/layout.tsx`**, not by `UserButton`:
lazily importing `UserButton` moved the number by 0.1 kb, because both land in
the same chunk.

Corroborating network measurement, on `/legal/terms` — a static page with no
auth UI beyond the header — Clerk costs **13 requests / 256 kb transfer**,
including `signup_ui` and `userbutton_ui`. On the homepage it is 20 requests,
with session calls to `clerk.accounts.dev` at 1798 / 1202 / 1183 ms.

The conclusion both point at: **a provider mounted at the root taxes every
route, so the fix has to change where the provider lives, not how components
are imported.**

## Why it isn't a one-line change

`ClerkProvider` can't simply move down the tree, because the thing that needs
it on every page is the header:

```
Header.tsx  ->  useUser()  +  <UserButton/>      // needs a provider ancestor
            ->  useCart()                        // needs "use client"
```

and `Header` is imported by eleven routes, **four of which are client
components** (`cart`, `checkout`, `upload`, `order-confirmed`). A server
component cannot be imported into a client component, so making `Header` a
server component is a prerequisite, not a detail.

## Step 1 — split the header (do this first, it is the actual blocker)

`Header` becomes a **server component** that calls `auth()` from
`@clerk/nextjs/server`. That works on any route, with or without a provider,
because `clerkMiddleware()` already runs for every request via `proxy.ts`
(Next 16's middleware filename). It ships **zero client JS**.

| Piece | Kind | Notes |
|---|---|---|
| Logo, nav links | server | static markup, no JS |
| `<CartCount/>` | client island | `useCart()` only — no Clerk |
| Auth slot | server, branches on `auth()` | see below |

**Move `<Header/>` out of the four client pages and into their route
layouts.** `cart`, `checkout`, `order-confirmed` and `upload` already have a
`layout.tsx` (added with the SEO work), so this is a relocation, not new
plumbing. `LegalPage.tsx` also imports `Header`, but it is already a server
component, so it needs no change.

## Step 2 — the signed-in avatar, without a provider

This is the part that decides the whole design. Two options:

**Option A — nest a provider around the avatar only.** Render
`<ClerkProvider><UserMenu/></ClerkProvider>` inside the header when `auth()`
reports a user. Anonymous visitors load no Clerk; signed-in ones do.
*Rejected:* on routes that already have a provider this nests one inside
another, and every public page still has two possible provider states to
reason about.

**Option B — server-render the avatar. Recommended.** `currentUser()` returns
`imageUrl` on the server, so the avatar is a plain `<img>` wrapped in a link
to `/account`. Pixel-identical to what `UserButton` renders, and **zero Clerk
client JS on public routes for signed-in and anonymous visitors alike.**

What `UserButton`'s dropdown currently offers is one link ("My orders" →
`/account`) and sign-out. Under Option B the avatar navigates straight to
`/account`, which lives in the authenticated group and can host a real
`<UserButton/>` — with sign-out — because a provider exists there.

So the answer to "how does a signed-in visitor keep their avatar on the
homepage" is: **they keep the avatar, they lose only the dropdown, and the
dropdown's contents move one click away to a page they can already reach.**

## Step 3 — route groups

Route groups don't change URLs, so no redirects and no SEO impact (the
canonical/sitemap work keys off `catalog`, not the folder layout).

```
app/
  layout.tsx                  <html>, <body>, CartProvider   -- NO ClerkProvider
  (public)/                   no provider
    page.tsx  how-it-works/  our-story/  legal/*  upload/  cart/  not-found
  (auth)/
    layout.tsx                <ClerkProvider>{children}</ClerkProvider>
    design/[slug]/  checkout/  order-confirmed/  account/  dashboard/
    sign-in/  sign-up/
```

Why each authenticated entry is there:

| Route | Reason it needs the provider |
|---|---|
| `design/[slug]` | `DesignCustomizer.tsx` calls `useUser()` |
| `checkout` | `CheckoutForm.tsx` calls `useUser()` |
| `order-confirmed` | page calls `useUser()` |
| `dashboard/*` | `SignOutButton` |
| `sign-in`, `sign-up` | `<SignIn/>`, `<SignUp/>` |
| `account` | server `currentUser()` only — but it should host the real `UserButton` (Step 2) |

`api/*` routes use `@clerk/nextjs/server` only. They are unaffected: server
helpers never needed the provider.

## Step 4 — the one that gets away

`/design/[slug]` is a **browse** page, not an account page. It is in the
authenticated group solely because `DesignCustomizer` calls `useUser()`, and
it is second only to the homepage in public traffic — so it keeps paying the
full 54.7 kb.

Worth investigating as a follow-up: if that `useUser()` only needs an id or a
signed-in boolean, the page (a server component) can read it with `auth()` and
pass it down as a prop, and `/design/[slug]` moves to `(public)`. That would
roughly double the reach of this migration. It requires editing
`DesignCustomizer.tsx`, so it is deliberately **not** part of the first pass.

## Expected result and how to verify it

Re-run the same two measurements rather than assuming:

1. **Per-route JS** — sum the byte sizes of `/_next/static/chunks/*.js`
   referenced by each prerendered HTML file in `.next/server/app`. Next 16
   prints no size columns and has no `app-build-manifest.json`, so this is the
   available method. Expect public routes to drop **~188.7 kb raw / 54.7 kb
   gzipped**.
2. **Third-party requests** — load `/legal/terms` and count requests to
   `*.clerk.accounts.dev` and `clerk-telemetry.com`. Expect **13 → 0**.

Note that cross-origin Clerk assets report `transferSize: 0` without a
`Timing-Allow-Origin` header, so the 256 kb figure is a floor, not a ceiling.

**Measure in headless Chrome, not the automation tab.** The automated browser
tab reports `visibilityState: "hidden"` from the first byte of every load,
which pauses `requestAnimationFrame` and suppresses lazy-loading entirely —
two measurements were invalidated by this before it was spotted. Headless
Chrome driven over CDP reports `visible` and behaves normally.

## Risk and rollback

Low risk, and it is reversible: putting `ClerkProvider` back in the root
layout restores today's behaviour regardless of the route-group layout.

The failure mode to watch for is a **client component calling a Clerk hook
from inside `(public)`** — it throws at runtime, not at build time, so it will
not be caught by `tsc` or `next build`. Before merging, grep for Clerk client
imports and confirm each one resolves to a route inside `(auth)`:

```bash
grep -rn 'from "@clerk/nextjs"' src/   # client APIs — every hit must be in (auth)
grep -rn 'from "@clerk/nextjs/server"' src/   # server APIs — fine anywhere
```

## Sequencing

The instruction that accompanied this task ended with "see sequencing below",
but no sequencing note followed — so the intended ordering relative to the
other in-flight work is **not captured here and should be confirmed before
anyone starts.** Nothing in this document has been implemented.

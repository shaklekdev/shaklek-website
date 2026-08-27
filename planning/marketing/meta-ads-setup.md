# Enabling Meta ads, what is built, and what only you can do

Written overnight 2026-08-25 by Session D. Everything in "Built and deployed"
is live and verified against production. Everything in "Your part" needs a
Meta Business Manager login and cannot be done from the repo.

---

## Built and deployed (inert until you set two variables)

| Piece | Where | State |
|---|---|---|
| Meta Pixel | `src/components/MetaPixel.tsx` | Renders **nothing** without a pixel id |
| Event helper | `src/lib/metaPixel.ts` | Never throws, never sends PII |
| Product feed | `https://www.shaklek.com/feed/meta.xml` | Live now, 32 entries |
| CSP allowances | `next.config.ts` | `connect.facebook.net`, `www.facebook.com` |
| Domain verification tag | `src/app/layout.tsx` | Renders only with a token |
| Privacy policy | `src/app/legal/privacy/page.tsx` | Text follows the pixel flag automatically |

**The pixel ships switched off on purpose.** Turning ads on tomorrow is an
environment variable in the Amplify console, not a code change on a live
storefront. Nothing about the site changes until you set it.

### Why the CSP work mattered

The site sends a strict Content-Security-Policy. Without the two hosts added,
the pixel would have loaded, fired nothing, and reported **zero conversions
with no visible error**, the most expensive kind of bug to find mid-campaign.
Verified in a real browser: pixel loads, `fbq` defined, **0 CSP violations**.

### Events wired, and what each carries

Verified end to end in a headless browser against a production build:

| Event | Fires when | Payload |
|---|---|---|
| `PageView` | every page, incl. client-side navigation |, |
| `ViewContent` | design page opens | item, category, value, AED |
| `AddToCart` | Add to cart succeeds (**not** on edit) | item, quantity, value |
| `InitiateCheckout` | Pay pressed, before the network call | items, num_items, value |
| `Purchase` | order confirmed as paid | items, order_id, value |

`Purchase` fires **once per order**, guarded in `localStorage` by order id, so
the polling on the confirmation page, a refresh, and a later return visit
cannot inflate it. A double-counted purchase corrupts both the number Meta
optimises against and the ROAS you read.

**No personal data is sent.** No email, name, address, phone or measurements.
Verified: an email typed into checkout appears nowhere in any event payload.
Advanced Matching is deliberately OFF, it would hash and send the customer's
email, which is your decision and a privacy-policy change, not a default.

---

## Promotion codes, as they stand (2026-08-26)

**There is no active promotion code in live mode.** Verified against the Stripe
API, not the Dashboard: `GET /v1/promotion_codes?active=true` returns an empty
list.

| code | state | terms |
|---|---|---|
| `WELCOME20` | **deactivated 2026-08-26** | was 20% off, first order only, 500 redemptions. **0 redemptions, ever.** |
| `TEST99` | **deactivated** | was 99% off, uncapped, no expiry, repeat use allowed |

**Why WELCOME20 went.** Founder decision, 2026-08-26: the welcome offer will be
**10% or nothing**, never 20%. On the real linen cost a 20%-off shirt earned
151 AED gross, **49 short** of a pessimistic 200 AED acquisition cost. It was
also a guessable code with 500 redemptions sitting active on a live account
that takes real cards, so it was withdrawn rather than left to expire in
November. See `planning/pricing-todo.md` for the numbers.

⚠️ **A code is enterable on Shaklek's own checkout page, not Stripe's**, the
site validates it against the API (`api/orders/route.ts`). An active code is
therefore reachable by anyone who guesses the word, whether or not it is
advertised anywhere.

TEST99 sold a 429 AED garment for 4.29 AED to anyone who typed it, unlimited
times, forever, on live cards. It was deactivated once the real payment test
had been run against it. **Do not reactivate it to test with**, create a
capped, expiring code instead, or use the sandbox account.

---

## Your part, in order

### 1. Create the Pixel (Events Manager)
Business Manager → Events Manager → Connect data source → Web → name it
`Shaklek Web`. Copy the 15-digit id.

### 2. Verify the domain (Business Settings → Brand Safety → Domains)
Add `shaklek.com`, choose the **meta-tag** method, copy the token.
Note: use `www.shaklek.com` in the ad links, the apex does not serve deep
links.

### 3. Set the variables in Amplify, then redeploy

Every switch on the site, in one place. All are read in the browser, so all
must start with `NEXT_PUBLIC_`, and **all require a redeploy**, they are baked
in at build time.

```
NEXT_PUBLIC_META_PIXEL_ID          = <the 15-digit id>
NEXT_PUBLIC_FB_DOMAIN_VERIFICATION = <the meta-tag token>
```

⚠️ **Do NOT set `NEXT_PUBLIC_LAUNCH_CODE = WELCOME20`.** This block used to say
exactly that, and it contradicted the section above it: WELCOME20 was
**deactivated on 2026-08-26** and no active promotion code exists. Setting it
would put a dead code in the popup and send every signup to "That code isn't
valid", the precise failure the inert-by-default design exists to prevent.

The launch popup stays off until a real code exists. When one does, founder's
decision is **10% or nothing**, never 20%, create it in Stripe first, capped
and expiring, then set both of:

```
NEXT_PUBLIC_LAUNCH_CODE            = <the new code>
NEXT_PUBLIC_LAUNCH_PERCENT         = <its percentage>
```

The popup renders only when **both** are set. It waits 18 seconds, never appears on cart, checkout, order-confirmed
or the dashboard, and never shows twice to the same person. They ship inert for
the same reason the pixel does: until the code existed, a popup promising a
discount would have sent people to "That code isn't valid".

**The pixel now also requires the visitor's consent.** Setting the id is
necessary but not sufficient, nothing is set and nothing reaches Meta until
someone accepts, Decline carries equal weight, and no answer means no. Declining
also deletes Meta's `_fbp` and `_fbc`, and "Cookie choices" in the footer lets
anyone change their mind later.

**Expect measured conversions to be lower than raw traffic. That gap is your
consent rate, not a broken pixel**, check it before concluding the pixel is
misconfigured, because the instinct will be to blame the setup.

### 4. Upload the catalog
Commerce Manager → Catalogue → Add products → **Scheduled feed** →
`https://www.shaklek.com/feed/meta.xml` → refresh **daily**.
32 entries, one per item and colour, grouped by `item_group_id` so a
navy browser is retargeted with navy rather than the ivory hero shot.

### 5. Check it before spending
- Meta Pixel Helper extension on `www.shaklek.com` → PageView
- Events Manager → Test Events → walk design → cart → checkout
- Commerce Manager → Catalogue → Diagnostics → expect 0 errors

---

## Ad policy, read before writing creative

Flagged by Session C, and it will cost you a rejection if ignored.

**Meta prohibits creative implying knowledge of a viewer's personal
attributes**, including body. Two of the strongest organic lines cannot run
as ads:

- `h01` "YOU'VE NEVER BEEN A MEDIUM", organic only
- `h03` "WE DON'T CHARGE FOR YOUR BODY", organic only

`social-playbook.md` holds ad-safe third-person rewrites as `h01ad` / `h03ad`.
The same rule applies to any "kinda chic" line addressed at the viewer's body.
**Rule of thumb: say what Shaklek does, never what the viewer is.**

Two more, from today's corrections:

- **Never describe the imagery as photographs.** The catalog images are
  generated. Ad copy is where a false claim about the product travels
  furthest, and it is the claim that makes a customer feel cheated on
  delivery.
- **No AI mentions, and no em dashes.** Both read as machine-written in
  fashion, and one reviewer flagged each independently.

---

## Deliberately NOT done

**Conversions API (server-side events).** Browser pixels lose 20 to 40% of events
to ad blockers and iOS. CAPI recovers them by sending `Purchase` from the
Stripe webhook, which is the only source that knows for certain that money
moved. It is the single biggest accuracy win available.

It was not done tonight because it means editing the payments webhook, the
same blast radius as the AED 5 bug, while you are asleep and cannot review
it. It needs an access token from Events Manager and a deduplication
`event_id` shared with the browser event. **Worth doing before you scale
spend, not before you start.**

**`deviceSizes` trimming**, reverted deliberately; it turns working image URLs
into 400s for no customer-visible gain.

---

## Still true, and it gates everything

**No one has bought anything through the current version of the site.** Nine
deploys went out on 2026-08-25 touching the design page, cart, checkout and
every catalog image. A ~AED 4 order with `TEST99` on a real phone is the only
thing that proves the money path, and it also produces the first real
`Purchase` event, which is how you confirm the pixel end to end.

**Do that before spending on traffic.**

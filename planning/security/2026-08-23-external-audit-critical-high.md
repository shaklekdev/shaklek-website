# Shaklek — Critical & High Findings

**Target:** https://www.shaklek.com/
**Date:** 23 August 2026
**Stack observed:** Next.js on CloudFront, Clerk auth, Stripe Checkout (live mode), Resend email

**Scope note:** black-box scan from outside — HTML, client bundles, HTTP headers, DNS, and API probes. No source access, so a few items are marked as needing confirmation against the server code.

**Test data to clean up:** verifying server-side price validation required real POSTs to `/api/orders`. This created **4–7 live Stripe Checkout sessions and order rows**:

- email: `security-scan-test@example.com`
- names: `SECURITY SCAN TEST - ignore` / `SCAN TEST ignore`
- totals: AED 390 (×3), AED 5 (×1)
- none were paid

Delete those rows and check whether any stylist notification emails were sent.

---

## Summary

| # | Severity | Finding |
|---|----------|---------|
| 1 | Critical | Order totals are client-controlled, in Stripe live mode |
| 2 | Critical | A failed order shows "Order confirmed" and empties the cart |
| 3 | Critical | `/api/orders/:id` has no authorization |
| 4 | High | No security headers on any response |
| 5 | High | Apex domain 404s on every path except `/` |
| 6 | High | Mobile visitors cannot sign in or reach any page |
| 7 | High | "Tailored" orders can be placed with no measurements |
| 8 | High | No size chart exists anywhere on the site |
| 9 | High | No delivery address is collected in the order flow |
| 10 | High | Order confirmation email may not be wired up |

---

## Critical

### 1. Order totals are client-controlled, in Stripe live mode

`/checkout` sends the price to the server, and the server appears to pass it straight through to Stripe:

```js
fetch("/api/orders", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ items: d, method: u, total: e, email: f })
})
```

**Evidence**

| Payload | Result |
|---------|--------|
| `price: 1`, `total: 1` | HTTP 500 (Stripe rejects amounts below its AED minimum) |
| `price: 5`, `total: 5` | HTTP 200, valid `cs_live_...` Checkout session |
| `price: 390`, `total: 390` | HTTP 200, valid `cs_live_...` Checkout session |

If the server recomputed the price from its own catalog, `price: 1` would have produced a normal AED 390 session instead of a Stripe minimum-amount error. The amount reaching Stripe is client-supplied.

**Impact:** anyone can buy an AED 390 piece for AED 2 by editing one number in devtools or in the `shaklek-cart` localStorage entry. Sessions are `cs_live_`, so this is real money.

**Fix:** ignore `items[].price` and `total` from the request body entirely. Look up each item's price server-side by `slug`, build the Stripe line items from those values, and use the client-supplied total only as a mismatch check that rejects the request.

---

### 2. A failed order shows the customer "Order confirmed" and empties the cart

```js
let s = await t.json();
if (s.checkoutUrl) { window.location.href = s.checkoutUrl; return; }
window.localStorage.setItem("shaklek-last-order", JSON.stringify({...}));
x();                        // clears the cart
r.push("/order-confirmed"); // shows the success page
```

There is no `response.ok` check. Two broken paths:

- **JSON error responses fall through to success.** A 400 such as `{"ok":false,"error":"No items in order"}` (reproduced) has no `checkoutUrl`, so execution continues: cart cleared, confirmation page rendered, no order created.
- **Empty-body 500s show nothing at all.** `.json()` throws, and `catch { g(!1) }` only re-enables the button. The user gets no error message and no explanation.

**Impact:** customers believe they have ordered and paid when nothing exists, and their configured cart is destroyed so they cannot retry.

**Fix:** check `res.ok` and the `ok` field before clearing anything. Surface a visible error state for both the non-2xx and network-failure branches. Do not clear the cart until a `checkoutUrl` has been obtained.

---

### 3. `/api/orders/:id` has no authorization

`/order-confirmed` polls this endpoint with no auth header and renders `items`, `total`, `status`, and `email` from the response.

```js
let i = await fetch(`/api/orders/${e}`);   // e = order_id from the query string
let a = await i.json();
d({ items: a.order.items, total: a.order.total, status: a.order.status, email: a.order.email });
```

**Evidence:** a guessed UUID returned a clean `{"ok":false,"error":"Order not found"}` 404 with no session — the route is reachable by anyone, and it returns the customer's email address on a hit.

**Impact:** UUIDs are not practically brute-forceable, so this is not an open dump. But there is no ownership check, so anyone who obtains an order ID — a shared confirmation link, browser history, CloudFront access logs, an analytics tool capturing query strings — can read that customer's email and full order. Compounded by finding #4: with no `Referrer-Policy` set you are relying entirely on browser defaults to keep the `order_id` out of outbound Referer headers.

**Fix:** require either a Clerk session that owns the order, or a short-lived signed token issued at checkout and passed instead of the raw ID.

---

## High

### 4. No security headers on any response

Confirmed absent on `/` and `/design/*`:

- `Strict-Transport-Security`
- `Content-Security-Policy`
- `X-Content-Type-Options`
- `X-Frame-Options` / `frame-ancestors`
- `Referrer-Policy`
- `Permissions-Policy`

Also present: `x-powered-by: Next.js` (framework disclosure).

`Referrer-Policy` matters specifically here because order IDs travel in the query string (#3). HSTS matters because the site takes card payments.

**Fix:** add a `headers()` block in `next.config.js`. Minimum viable set:

```js
async headers() {
  return [{
    source: '/(.*)',
    headers: [
      { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
      { key: 'X-Content-Type-Options',    value: 'nosniff' },
      { key: 'Referrer-Policy',           value: 'strict-origin-when-cross-origin' },
      { key: 'X-Frame-Options',           value: 'DENY' },
      { key: 'Permissions-Policy',        value: 'camera=(), microphone=(), geolocation=()' },
    ],
  }];
}
```

Set `poweredByHeader: false` in the same file. Add a CSP afterwards — it needs care because of Clerk (`clerk.shaklek.com`), Stripe, and Google Fonts.

---

### 5. Apex domain 404s on every path except `/`

| Request | Result |
|---------|--------|
| `https://shaklek.com/` | 301 → `https://www.shaklek.com` |
| `https://shaklek.com/design/oversized-shirt` | **404 `Not Found`** |

The redirect drops the path instead of preserving it.

**Impact:** every non-www link anyone types, prints, shares, or puts in a bio is broken. Also note the apex redirect leaks an internal hostname:

```
Server: ip-100-74-5-56.eu-west-2.compute.internal
```

**Fix:** make the apex redirect path-preserving (`https://www.shaklek.com$request_uri` equivalent) and suppress the internal `Server` header.

---

### 6. Mobile visitors cannot sign in or reach any page

Every header nav link carries `hidden ... sm:inline`:

```html
<a class="hidden hover:text-text transition-colors sm:inline" href="/">Catalog</a>
<a class="hidden hover:text-text transition-colors sm:inline" href="/how-it-works">How it works</a>
<a class="hidden hover:text-text transition-colors sm:inline" href="/our-story">Our story</a>
<a class="hidden hover:text-text transition-colors sm:inline" href="/sign-in">Sign in</a>
```

Below 640px all four are `display: none`, and no hamburger menu exists anywhere in the markup. The header collapses to the logo plus the cart icon. The footer carries only Terms / Returns / Privacy / email / WhatsApp — no Sign in.

Signed-in users get Clerk's `<UserButton>`, which has no `hidden` class, so it does render on mobile. The gap therefore hits exactly the visitors who have not converted yet.

**Impact:** on mobile — most traffic for a UAE fashion brand — How it works, Our story, and sign-in are unreachable. Given the product's core pitch needs explaining, losing How it works on mobile is a direct conversion loss.

**Fix:** add a mobile menu, or at minimum drop `hidden` from Sign in and add the key links to the footer.

---

### 7. "Tailored" orders can be placed with no measurements

The measurement inputs have no validation beyond `min="0"`:

```js
<input id={`measurement-${e.key}`} type="number" inputMode="decimal" min="0" ... />
```

- No required check. Switching to Tailored, entering nothing, and pressing Add to cart yields an order with size `"Tailored"` and an empty measurement string.
- No upper bound or sanity range — `height: 5` or `waist: 9999` are both accepted.
- `cm` is hardcoded in the serializer with no imperial toggle.
- Only four fields: bust/chest, waist, hip, height. No shoulder, sleeve length, or inseam — thin for made-to-order trousers.

`constraints.passed`, which gates the Add to cart button, only covers the fabric / single-layer / no-logo rules. It does not check measurements.

**Impact:** unmakeable orders reach production, each one costing a manual stylist round-trip.

**Fix:** require all four fields in Tailored mode, add plausible min/max ranges per field, and include measurements in the `constraints.passed` gate. Add inseam and shoulder for the relevant categories.

---

### 8. No size chart exists anywhere on the site

XS–XXL is offered with no body measurements behind it. Two places reference a chart that was never built:

- Returns policy: *"whether you used the standard size chart or entered your own measurements"*
- Our story: *"cut for your body, not a size chart"*

**Impact:** this is the single largest driver of the free alterations and remakes promised in the returns policy. Every avoidable size mistake costs a full remake against a fixed AED 390–450 price.

**Fix:** publish a measurement table per size and per garment, linked from the Step 3 size selector.

---

### 9. No delivery address is collected in the order flow

`/checkout` collects email and payment method only. No name, no address, no phone.

Nothing in the client bundle collects an address — the only `Address` reference in the checkout chunk is Clerk's `primaryEmailAddress`. Whether Stripe collects one depends on `shipping_address_collection` being enabled on the session, which is server-side and could not be verified externally.

Either way, your own order record — the object `/order-confirmed` renders and the stylist receives — contains no address, name, or phone.

Your privacy policy already claims you collect "delivery address," so the policy currently describes something the product does not do.

**Fix:** confirm `shipping_address_collection` is enabled on the Stripe session, and persist the resulting address, name, and phone onto your order record via the webhook so fulfillment has it.

---

### 10. Order confirmation email may not be wired up

This string ships in production and is shown to real customers on the confirmation page:

> "Order received — stylist notification is queued (email delivery isn't fully connected yet)."

Resend DKIM is configured on `send.shaklek.com` with a valid SPF record, so the infrastructure exists. The code path suggests the send is not reliably firing, and the fallback copy tells the customer so.

**Fix:** confirm the Resend send fires on `checkout.session.completed`, then remove the fallback copy. Until it does, a customer who pays gets no written record of their order.

---

## Verified working

Recorded so these are not re-tested:

- **Stripe webhook signature verification** — unsigned and bogus-signature POSTs to `/api/webhooks/stripe` both return `{"ok":false,"error":"Invalid signature"}` 400.
- **Route protection** — `/account` and `/dashboard` 307 to Clerk sign-in with a `redirect_url`; `/api/account/measurements` returns 401 unauthenticated.
- **No secret leakage** — bundles contain only `pk_live_` (Clerk publishable, public by design). No AWS keys, Stripe secrets, or webhook secrets.
- **Prompt injection resistance** — `/api/customize` is a rule engine, not an LLM. An injection attempt was captured into `freeformNotes` rather than acted on, and the constraint engine correctly refused logos, second materials, and linings.
- **TLS** — TLS 1.3, valid Amazon-issued wildcard cert, HTTP→HTTPS redirect in place.

---

## Suggested order of work

1. **#1** Server-side price recomputation — this is losing money right now.
2. **#2** `response.ok` check in the checkout handler — customers are being told orders succeeded when they did not.
3. **#3** Authorization on `/api/orders/:id`.
4. **#4** Security headers, **#5** apex path redirect — both are config-level, under an hour each.
5. **#6** Mobile nav — likely the largest conversion loss on the list.
6. **#9, #10** Address collection and confirmation email — without these you cannot fulfill an order end to end.
7. **#7, #8** Measurement validation and size chart — these reduce the alteration burden the returns policy commits you to.

Medium-severity findings, marketing-claim accuracy issues, and the design / accessibility / SEO set are tracked separately and are not included in this file.

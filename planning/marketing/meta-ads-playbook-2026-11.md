# Meta ads playbook: pre-launch 3–10 Nov, opening from 11 Nov 2026

Research done 2026-11-02. Most of the sources are practitioner and agency blogs. Where Meta has its own page, it is linked. Every figure below is a heuristic to check against our own numbers. None of them is Meta policy.

## Recommended setup for Shaklek, 3–11 Nov

- **Objective:** Leads campaign. Conversion location: **Website**. Performance goal: maximise conversions on the pixel **Lead** event. Do not optimise for Traffic or Landing page views. The last ad did exactly that and bought 13 landing page views with 0 signups, because LPV optimisation finds people who click, not people who sign up.
- **Accept "Learning limited".** AED 240 over 8 days cannot produce 50 leads a week (that would need a cost per lead of about AED 4). That is fine. Learning-limited ad sets still deliver. The mistake would be splitting the budget or editing every day.
- **Before launch:** check in Events Manager > Test events that Lead fires **on a successful submit only**, and that the cookie banner does not cover the form on mobile.
- **Structure:** 1 campaign, **1 ad set**, AED 30/day ad-set budget (CBO and ABO make no difference with one ad set). No A/B tests and no second ad set.
- **Audience:** Advantage+ audience. Location: the cities of Dubai and Abu Dhabi ("living in"). Age minimum 25, which is a hard control. Suggestions: women 25–55, with interests such as linen, sustainable fashion, luxury goods, modest fashion and wellness. These are suggestions, not limits. Language: none. Exclusion: a custom audience of people who already fired Lead. Placements: Advantage+, minus Audience Network.
- **Creatives:** 4–5 **genuinely different** concepts in that one ad set: (1) the 10s teaser in 9:16; (2) one 4:5 carousel (fabric / fit / made-to-order); (3) one 4:5 catalogue product still with "From AED 449"; (4) one text-led 4:5 static (the brand promise in Bodoni); optionally (5) a founder or hands-on-linen clip. CTA **Sign up**. Primary text under 125 characters, headline under 40.
- **Advantage+ creative enhancements:** turn off music, text improvements, image expansion / generative backgrounds, visual touch-ups and animation. Keep only placement-based cropping, after previewing it.
- **KPIs and rules.** Make no edits for the first 72 hours (an edit resets learning).
  - Link CTR below 0.7% after about 2,000 impressions means a creative problem. Swap the weakest concept.
  - Landing page views below 70% of link clicks means the page is too slow.
  - 0 leads after AED 120 spent and 40 or more landing page views means a **page/offer** problem. Fix the page, not the ads.
  - Cost per lead of AED 30 or less is good. Hold the budget, or raise it at most +20% at a time.
- **11 Nov:** email the waitlist first. Then start a new **Sales** campaign (Advantage+ sales). Upload the waitlist as a customer list (consent permitting) for "existing customers", plus site-visitor and IG/video engager audiences. Optimise for Purchase if the budget is at least AED 75/day. Otherwise optimise for Initiate Checkout for the first week.

## Hard rules (learned from our own campaigns; the shaklek-ads agent keeps this current)

Check every proposal against these. Breaking one needs the founder's explicit OK.

1. **Ask Meta for an event it can actually see.** Waitlist "Lead" was near-invisible (cookie consent + almost no sign-ups), so Meta optimised blind and paid ~AED 85 CPM. Pick the most frequent event that still means intent (Add to cart / Initiate checkout), move to Purchase after ~10 orders.
2. **The button must match the page.** "Shop now" to a closed shop = taps that bounce. Waitlist = "Sign up"; open shop = "Shop now".
3. **One campaign, one budget, few ads.** Splitting AED 30/day across 2 ad sets and 6 ads starves learning.
4. **One change batch, then 72 h hands off.** Every edit sent all ads back to review/learning (lost most of 9 Nov).
5. **Verify delivery, not status.** Campaign, ad set and ad toggles ON, Delivery "Active", impressions > 0 a few hours later. (7-8 Nov: ad set OFF overnight, nothing ran.)
6. **Exclude friends.** Every ad set excludes the two EXCLUDE follower audiences.
7. **All Advantage+ creative enhancements OFF**, incl. Highlight carousel card (reordered our carousel), Profile end card, Enhance CTA ("Tap to shop here 📍" sticker), site links/summaries (wrote false claims).
8. **Format per placement.** Feed 4:5, Stories/Reels 9:16. Carousels in Stories show slide 1 unless tapped ("Expand story").
9. **Truth = our records, not Meta's column.** Count sign-ups from the waitlist emails and orders from the dashboard. Billing from the transaction list (AED 12 threshold chunks).
10. **Before launch, test the conversion event** with a real submit (cookies accepted) and see it in Events Manager.

## Decision log (append one dated line per decision)

- 2026-11-07 Launched "waitlist test 1": Leads/Website, Lead event, Dubai + Abu Dhabi, 25+, AED 75/day (playbook said 30), CTA Shop now (founder), ads 1/3/4. Rules 2-5 broken.
- 2026-11-08 Ad set found OFF since publish; switched on.
- 2026-11-09 Excluded follower audiences; carousel reorder off; split into Feeds 4:5 (B) and Stories+Reels 9:16 (A); Enhance CTA off on all 6 ads.
- 2026-11-09 Numbers ~AED 89, ~1,080 impr, 34 clicks, 8 LPV, 0 waitlist emails. Decision: CTA -> Sign up, budget -> AED 30/day, hands off until 11-11.
- 2026-11-10 Numbers AED 141, 1,682 impr (1,393 reach), 37 link clicks, 8 LPV, 1 Lead (likely founder test), 0 real sign-ups, a few new followers. CPM ~AED 85. Founder advised: soft-open 11-11, replace with one opening campaign optimised on Add to cart/Initiate checkout; real launch push early Dec.

## 1. Objective and the learning phase

- Learning needs about **50 optimisation events per ad set within 7 days** of the last significant edit. Below that, the ad set shows "Learning limited", and budget, audience or optimisation-event edits reset it. ([Jon Loomer, 10 or 50 events](https://www.jonloomer.com/qvt/learning-phase-10-or-50-events/); [Jetfuel 2026](https://jetfuel.agency/what-is-the-meta-ads-learning-phase-how-to-exit-it-faster-in-2026/))
- Rule of thumb: minimum daily budget = (target CPA × 50) / 7. At our budget, that means a CPA of about AED 4, which is unrealistic. ([Aimerce](https://www.aimerce.ai/blogs/stuck-in-the-learning-phase-here-is-how-to-get-out))
- The "event ladder" (optimise for a higher-volume event when the real one is scarce) works for Add to Cart versus Purchase. ([Cometly](https://www.cometly.com/post/facebook-ads-learning-phase-optimization)) But LPV sits too far from a signup. Lead is the lowest rung that still means intent. On a tiny budget, the real risk is fragmentation, not optimising for a low-volume event.
- With only 8 days, switching LPV to Lead mid-flight wastes days on a learning reset. Pick Lead from day 1.

## 2. Structure and audience

- Advantage+ is now the default setup for sales and leads campaigns. Meta reported a 10% lower cost per qualified lead in early leads tests. ([Social Media Today](https://www.socialmediatoday.com/news/meta-advantage-plus-ad-updates-february-2025/739472/); [PPC Land](https://ppc.land/meta-launches-unified-api-structure-for-advantage-campaigns/))
- Consolidation: one ad set with many diverse ads beat several ad sets in a widely cited Meta test (17% more conversions at 16% lower cost). We could not trace that test to a Meta primary source. ([Segwise](https://segwise.ai/blog/meta-andromeda-update-creative-strategy-2026))
- Detailed-targeting **exclusions were removed** (2025). Custom-audience exclusions still work, including under Advantage+ audience. ([Meta developers](https://developers.facebook.com/blog/post/2025/01/21/removal-of-detailed-targeting-exclusions/); [Jon Loomer](https://www.jonloomer.com/qvt/detailed-targeting-exclusions/)) Many narrow interests were merged in 2025. ([PPC Land](https://ppc.land/meta-removes-detailed-targeting-exclusions-for-ad-accounts/))
- **Household-income targeting:** US-only, plus India since Sept 2025. Unconfirmed for the UAE, so check it under Demographics > Financial in Ads Manager. If it is absent, fall back on location plus interests. ([Vaizle](https://insights.vaizle.com/news/meta-launches-household-income-targeting-in-india))
- Followers: we have 193, mostly abroad, so the UAE location already excludes them. No action needed.

## 3. Creative (Andromeda era)

- Ad retrieval is now creative-led: **diversity of concept** matters, not variant count. Ten near-identical ads act as one. ([Chatterbuzz](https://www.chatterbuzzmedia.com/blog/meta-andromeda-creative-targeting/); [Segwise](https://segwise.ai/blog/meta-andromeda-update-creative-strategy-2026)) Agencies quote 6–12 ads per ad set at USD 50+/day. At USD 8/day, Meta will spend on 1–2 of them anyway, so 4–5 distinct concepts is the practical ceiling.
- Use 9:16 for Reels and Stories and 4:5 for feed. Put the product and the name in the first 3 seconds, and avoid long fades. Instagram outperforms Facebook for UAE lifestyle and fashion. ([Impulse Digital](https://www.theimpulsedigital.com/ae/blog/?p=11877))
- Advantage+ enhancements can crop logos, add music and rewrite text. For a luxury look, opt out of each feature individually (the "standard bundle" no longer exists), and recheck before every publish. ([Meta developers v22](https://developers.facebook.com/blog/post/2025/01/17/marketing-api-v22-impacts-to-advantage-plus-creative-enhancements/); [AdLibrary](https://adlibrary.com/posts/advantage-plus-creative-changes); [JumpFly](https://www.jumpfly.com/blog/metas-advantage-settings-why-they-keep-reappearing-and-how-to-stay-in-control/))
- Showing the price is an inference, not a sourced finding. It filters out people who will never pay AED 449, which makes a waitlist worth more at launch.

## 4. Policy

- Personal attributes: no "you/your" phrasing that asserts something about the viewer's body, health or traits ("your sensitive skin", "your body deserves"). Write "linen breathes" or "made to your measurements" instead. ([Meta Transparency](https://transparency.meta.com/policies/ad-standards/objectionable-content/privacy-violations-personal-attributes/); [Jon Loomer](https://www.jonloomer.com/can-we-use-the-words-you-and-your-in-facebook-ads-copy/))
- Health: avoid "non-toxic", "chemical-free", "hypoallergenic" and "detox". Describe the material, not a health outcome. ([LSEO](https://lseo.com/blog/social-media-marketing/meta-ads/ad-policy-compliance-ensuring-your-meta-ads-get-approved/))
- Special ad categories: do not tick any (fashion is not credit, housing, employment or politics).
- Review is "typically within 24 hours", and new accounts can take longer. **Submit tonight for 3 Nov.** ([Meta ad standards](https://transparency.meta.com/policies/ad-standards/))

## 5. Measurement

- The pixel only sees consented visitors, so Meta optimises on a fraction of the real signups. The Conversions API restores *technical* loss (ad blockers, ITP). It does not restore *consent* loss, and it needs `event_id` deduplication with the pixel. ([Piotr Litwa](https://piotrlitwa.com/articles/en/meta-conversions-api-setup-guide.html); [PPC Land](https://ppc.land/meta-upgrades-pixel-and-conversions-api-to-close-the-gap-for-small-advertisers/)) **Server-side Lead plus Purchase via CAPI is the top build item before the opening push.**
- Attribution: keep 7-day click / 1-day view. Count signups in **our own DB** per day and compare them with what Meta reports.
- Benchmarks: GCC CPM USD 3–8 ([Dotts Media](https://dottsmediahouse.com/dubai/meta-ads-vs-google-ads/)) against a UAE median of about USD 19 ([Superads](https://www.superads.ai/facebook-ads-costs/cpm-cost-per-mille/united-arab-emirates)). The sources conflict, so trust our own numbers: the last ad cost about AED 1.9 per landing page view. Cold paid traffic to a waitlist converts at 1–15% depending on the source ([LaunchList](https://getlaunchlist.com/glossary/waitlist-conversion-rate)). Plan on 5–10%, so AED 240 buys roughly 100–120 landing page views and 6–12 leads.

## 6. Sequencing and lead forms

- Pre-launch: the Lead campaign above. 10 Nov: post a "tomorrow" teaser organically. 11 Nov: email the waitlist, then the Sales campaign.
- **11.11 is a big sale day in the UAE**, and White Friday is late November. CPMs are likely to rise (this is an inference), and the Dubai Shopping Festival in mid-December raises them further.
- Instant forms bring cheaper and more leads. Jon Loomer found the share of good-quality leads similar to website leads ([Jon Loomer](https://www.jonloomer.com/?p=44632)), while others report lower quality ([Trio Media](https://trio-media.co.uk/meta-lead-forms-vs-website-conversions)). Instant forms also build no pixel audience for launch-day retargeting. Use one only as a fallback: if website cost per lead is above AED 40 by 7 Nov, test a **Higher intent** instant form (with a review screen) in brand styling.

## 7. UAE specifics

- English first: the affluent expat and Emirati audience reads English. Test an Arabic variant after launch, with its own copy rather than a translation. ([Impulse Digital](https://www.theimpulsedigital.com/ae/blog/?p=11877))
- Evening CPMs in Dubai are reportedly much higher than daytime ([Admiral Media](https://admiral.media/?p=281110)). Ad scheduling needs a lifetime budget, which is not worth it at this spend.

## 8. Waitlist page

- **One field (email).** Each added field costs conversion. ([Medium, Zamudio](https://medium.com/@soyzamudio/maximizing-waitlist-conversion-rates-data-driven-strategies-6856cb91f83b)) No navigation leaks. Put the form above the fold on mobile, and use the same image and words as the ad.
- Load fast on 4G. Mobile is where waitlists leak. ([LaunchList](https://blog.getlaunchlist.com/blog/why-is-my-waitlist-not-converting))
- Offer an incentive without a discount: first access to the opening collection, a priority place in the first production batch, and the free fitting already offered above AED 550. Add a thank-you state that confirms what happens on 11 Nov.

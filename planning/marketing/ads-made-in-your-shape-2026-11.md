# "Made in your shape" (شكلك): 5 ad creatives, Nov 2026

Platform: Shaklek = شكلك = "your shape". Every piece is cut after the order, to a
standard size or to her measurements, sleeve and length chosen, same price either
way (`src/lib/pricing.ts` prices by catalogue slug only). Campaign line:
**Made in your shape.**

Built backwards from what works in fashion on Meta/TikTok (practitioner
consensus, not Meta policy): product in frame one; motion in the first second;
works sound-off (text on screen); one idea per ad; native phone look beats studio
gloss; 4–5 genuinely different concepts in one ad set (Andromeda rewards concept
diversity, not variants); 9:16 for Reels/Stories, 4:5 for feed. See
meta-ads-playbook-2026-11.md for setup (Leads, 1 ad set, AED 30/day, no edits 72h).

Every end card: master lockup + "Opening 11·11" + "Sign up". ⚠️ The "first 50:
initials on the bag" line is held OFF the end cards until the DET question is
settled (OPEN det-permit), so a permit question can never pause the ads.

Reviewed 2026-11-07 (marketing agent). Rules applied to every customer-facing
line below, with the source that makes each true:
- Nothing says lead time, alteration, remake, visit or "free". Current site
  terms are up to 3 weeks (`legal/terms/page.tsx:109`) and ONE alteration within
  10 days (`:143`); the at-home visit is off the site. Ads stay silent on all of
  it, so a policy change cannot strand a live ad.
- No "photo" / "photograph" in anything the viewer reads. The catalogue imagery
  is generated and `scripts/social/kinda-chic.mjs` refuses copy that calls it a
  photograph. Say "what you see" or "the piece on screen".
- No dashes (em or en) in on-screen or caption text (same script).
- Meta personal attributes: no question or statement that asserts something
  about the VIEWER's body ("Fits the hips, never the waist?" addressed to her was
  the one risk; now stated about the trousers). "Made in your shape" and "to
  your measurements" describe the product and are in the playbook's allowed
  form; low risk, kept. ⚠️ The campaign line sits closest to the line when it
  follows a cut showing a plus-size or petite body, so the end card carries it
  alone, after a neutral last cut.
- Counts in brackets: primary visible limit ~125, headline ~40. All inside.

## 1. HERO — "One shirt. Five shapes." (all personas)
- Format: 9:16 video, 7s, five quick cuts (~1s each) + end card. 4:5 cut for feed.
- Frame 1 (0–0.6s): a petite woman in the navy Oversized Shirt, mid-turn. Text: **"One shirt."** Hard cut at 0.6s to the second woman, same shirt, so the idea lands inside the first second. Text: **"Five shapes."**
- Cuts: tall / curvy / plus-size / hijabi woman, same shirt, each fitting her. Text held on cut 3–4: **"Five shapes."** Last cut: **"Cut for each."**
- End card: **Made in your shape.**
- Primary (123): Same shirt, five women, five fits. Each piece is cut after the order, to a size or measurements. 100% linen. Opening 11·11.
- Headline (19): Made in your shape.
- Make: 5 stills of different bodies in the SAME catalogue shirt, edited from the approved catalogue image (Pro, ~$0.13 each, ~5–8 calls = $0.65–1.05), animated with subtle motion. Founder approves the 5 bodies before animation. ⚠️ Before casting a plus-size body: confirm with the tailor that made-to-measure has no upper limit (the size ladder stops at XXL, bust 101 / hip 108, `sizeChart.ts:64`). If there is a ceiling, the ad shows a body we cannot serve.

## 2. AISHA (has a tailor, fit pain) — "Fits the hips. Never the waist."
- Format: 9:16 phone video, 8s, UGC look.
- Frame 1: fingers pinch the gap at the back waistband of a store-bought trouser. Text: **"Fits the hips. Never the waist."**
- 1–4s: a pin goes in, then a tailor's WhatsApp "come back for a second fitting" (her own chat, names blurred; a real message, never a mock-up with a real tailor's name). Text: **"So: the tailor. Again."**
- 4–7s: the Shaklek trouser on screen, customizer Standard → Tailored, price unchanged. Text: **"Or cut to your shape from the start."**
- Primary (115): Fits the hips, never the waist. Ours are cut after the order, to a size or measurements. Same price. Opening 11·11.
- Headline (33): Size or measurements. Same price.
- Make: founder films 10 min with her phone + staging screen recording. Free. The size buttons now read plain "Tailored" / "Standard" (`SizePicker.tsx`, "(free)" removed 2026-11-05), so nothing to crop. ⚠️ Do not show a tailor message saying "ready next week": our own lead time is up to 3 weeks, and the contrast reads against us. The pain is the second trip, not the speed.

## 3. NOOR (exact sleeve and length, modest/AC) — "Your sleeve. Your length."
- Format: 9:16 screen recording, 8s.
- Frame 1: recording starts mid-tap, the shirt on screen changes sleeve. Text: **"Choose the sleeve."**
- 1–5s: length changes, colour flicks Ivory → Navy → Burgundy. Text: **"The length. The colour."**
- 5–7s: Text: **"What you see is what we cut."**
- Primary (111): Choose the sleeve and the length, see the exact piece, then we cut it in your shape. 100% linen. Opening 11·11.
- Headline (25): Your sleeve. Your length.
- Make: staging iPhone screen recording. Free, ~1 hour. ⚠️ Never caption "long sleeve": no catalogue image shows a sleeve worn down (personas-v2 §3).

## 4. REEM (label reader, fibre) — "Check the label."
- Format: 9:16 video or 4:5 carousel, 7s.
- Frame 1: macro of a real high-street care label, "55% linen / 45% viscose" (from the founder's own wardrobe, brand cropped). Text: **"A 'linen' shirt. 55% linen."**
- 1–3s: hard cut to Shaklek linen macro. Text: **"Ours: 100% linen."**
- 3–6s: catalogue shirt. Text: **"Cut to your shape."**
- Primary (120): A lot of "linen" on the rail is a blend. Ours is 100% linen, cut after the order. It creases. It's linen. Opening 11·11.
- Headline (24): 100% linen. Not a blend.
- Make: needs a REAL blend label photo from her wardrobe; never generate a fake one. Otherwise free. "A lot of", not "Most": we have three sourced examples (personas-v2 sources 3, 4), not market data, and a quantified claim about competitors is the kind UAE consumer protection asks you to prove.

## 5. ARABIC (Arabic-speaking audience) — the name itself
- Format: 4:5 static + 9:16 version. Ad set placement language: Arabic.
- Visual: the abaya (burgundy, Open Abaya catalogue image), large Arabic headline.
- Headline on image: **شكلك.** Line under: **مفصّلة على شكلك.** ("Your shape. Cut to your shape.")
- Primary text (AR): كل قطعة تُفصَّل بعد الطلب، على مقاسك أو حسب قياساتك. كتان 100%. الافتتاح 11·11.
- Headline (AR): مفصّلة على شكلك
- Make: free (catalogue image + master lockup). ⚠️ Founder must read every Arabic word before it runs. Notes for her:
  - **مفصّلة (feminine)** replaces مفصّل. The line sits under an abaya (عباية, feminine) and the brand's own disclosure uses feminine agreement for the piece (قطعة). Masculine مفصّل is defensible as an abstract slogan; her call, but it must match on the image and in the headline field.
  - **شكلك.** alone, in Gulf and Levantine speech, also reads as "you look..." / "seems like you..." (شكلك تعبانة). Fine as a name, but she should hear the double reading before it runs at display size.
  - **حسب قياساتك** added: "على مقاسك أو قياساتك" dropped the preposition and read as one phrase. "To your size or according to your measurements" is the natural split.
  - **كتان 100%** matches the site (`productDisclosure.ts:98`). ⚠️ That file records a text shaper rendering it as "%001": check the rendered image, not the source string.
  - "الافتتاح 11·11" is correct; "نفتح 11·11" (we open) is warmer if she prefers.
  - Hook: a static has no motion in the first second. For the 9:16 placement, use the Noor screen recording with these Arabic lines instead of a still; keep the still for 4:5 feed.
- Primary (79 chars, Arabic): under limit.

## Launch order
Ad set 1 (English): 1, 2, 3, 4. Ad set 2 (Arabic): 5. If budget stays AED 30/day,
start 1 + 3 + 5 (free or ~$1 to make), add 2 and 4 the day the footage exists.

## Still open after this review
- "Made in your shape" is the founder's line and stays. In English, "made to your shape" / "cut to your shape" is the idiom; "in your shape" reads as a translation. Secondary on-screen lines above now say "to your shape". If she wants the campaign line itself changed, it is one word.
- Ad 1 shows five generated women. Nothing in the copy calls them customers or real, and it must stay that way: no "our customers", no names, no quotes.

## Ad 3 — final copy (2026-11-07)
Runs with `brand-assets/ads-2026-11/ad3-customizer-FINAL.mp4` (8s, 9:16). On-screen
story is founder-approved and unchanged; the copy below only restates what the
video shows. Leads campaign, English ad set, UAE women 25–55.

Facts checked against the shipping product (marketing agent, 2026-11-07):
Peplum Blouse AED 549, category Shirt (`website/src/data/catalog.ts:217-220`);
100% linen is the only sellable fabric (`website/src/data/fabrics.ts:63,84`);
Tailored or Standard at the same price, cut after the order
(`website/src/app/legal/terms/page.tsx:109-120`, `src/lib/pricing.ts` prices by
slug only). Lead time (up to 3 weeks, `terms:109`), the alteration (one, within
10 days, `terms:143`) and the home visit (off the site) are deliberately NOT in
the copy: none of them is needed to sell the sign-up, and a silent ad cannot be
stranded by a policy change. No "first 50 / initials" (held, OPEN det-permit).
No "AI", no dashes, no "photo", no second-person body claims. "Your
measurements" and "made in your shape" are in the playbook's allowed form.

**Primary text, ranked (visible limit 125):**
1. (125) This shirt doesn't exist yet. Choose the sleeve, length and colour, and we cut it after you order. 100% linen. Opening 11·11.
   First line alone: "This shirt doesn't exist yet." Mirrors frame one of the
   video, so sound-off and text agree. Hook is curiosity about the shirt, never
   about the viewer.
2. (112) Decide how it's made, then we cut it. Standard size or your measurements, same price. 100% linen. Opening 11·11.
   Carries the same-price claim, which is the strongest true differentiator.
   Second because "Decide how it's made" is weaker alone above "...more".
3. (125) The Peplum Blouse, your way. Sleeve, length and colour are yours to decide, then we cut it. 100% linen, AED 549. Opens 11·11.
   Names the piece and the price. Third: a price in a first-touch sign-up ad
   asks for a buying decision before the shop is open.

**Headlines, ranked (limit 40):**
1. (25) You design it. We cut it.   ← same words as the end card
2. (19) Made in your shape.         ← campaign line
3. (36) Sleeve, length, colour. Then we cut.

**Description (limit 30):** (26) 100% linen. Opening 11·11.

**CTA button:** Sign up (Meta list; matches meta-ads-playbook §1).

**Chosen set:** Primary 1 · Headline 1 · Description · Sign up.

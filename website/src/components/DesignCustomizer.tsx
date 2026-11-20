"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import type { CatalogItem } from "@/data/catalog";
import { includedWith } from "@/data/catalog";
import IncludedInPrice from "@/components/IncludedInPrice";
import { AFTER_ORDER } from "@/data/included";

// The line under the colour circles on every abaya. Cleared by shaklek-marketing
// 2026-10-11 against catalog.ts, fabrics.ts and margins.mjs. "the price", never
// a number: 949 lives in catalog.ts. ⏳ An Arabic version exists in that review
// but every Arabic string is founder-read before it ships (productDisclosure.ts).
const INCLUDED_COPY = {
  heading: "Matching shayla included",
  line: "In your colour. 68 x 180 cm.", // founder 2026-11-14: linen already in the badge and Product information
};
import { createSpecFromCatalog, type DesignSpec } from "@/data/designSpec";
import {
  changesFromLabels,
  comboKeyForCategory,
  paramKeyFor,
  defaultChangesForCategory,
  renderParamsForCategory,
} from "@/data/parameterSliders";
import { useCart } from "@/lib/CartContext";
import { money, track } from "@/lib/metaPixel";
import CustomizeParameters from "@/components/CustomizeParameters";
import { SHADE_NOTE } from "@/components/FabricColorPicker";
import { resolveFitNotes } from "@/data/fitNotes";
import SizePicker, { parseMeasurements } from "@/components/SizePicker";
import DetailField from "@/components/DetailField";
import ProductDisclosure from "@/components/ProductDisclosure";
import DetailsSheet from "@/components/DetailsSheet";
import ShaklekPlusSignup, { SHAKLEK_PLUS_ON } from "@/components/ShaklekPlusSignup";

// One string, two places: under the first-screen Add to cart on phones, under
// the Total on desktop. Exactly one of them is displayed at any width.
// "About", not "Up to" (founder 2026-11-20): the checkout line already said
// "Ready in about 3 weeks" and the two disagreed a page apart.
const LEAD_TIME = "Made for you. About 3 weeks.";

type SavedMeasurements = { bust: string; waist: string; hip: string; height: string; notes: string };

// `item.colorImages?.[name]` was used as the colour gate, and a plain property
// lookup walks the prototype chain: "constructor", "toString", "valueOf" and
// "__proto__" all come back truthy. So /design/<slug>?color=constructor set
// spec.color = "constructor", the preview quietly fell back to the base photo,
// and if the customer went on to pay, "constructor" was written to the cart
// line and then to order_items.color -- straight onto the tailor's sheet, with
// no allowlist anywhere downstream to catch it.
//
// Own-property check only. Found by the pre-deploy security review,
// 2026-08-25; pre-existing on the ?color= path and on cart restore, not
// introduced by the URL work, but carried by it.
function isKnownColor(item: CatalogItem, name: string | null | undefined) {
  return Boolean(name) && Object.hasOwn(item.colorImages ?? {}, name as string);
}

export default function DesignCustomizer({ item }: { item: CatalogItem }) {
  const [spec, setSpec] = useState<DesignSpec>(() => createSpecFromCatalog(item));
  // FABRIC STOCK (founder 2026-11-12: the linen is limited). Colours whose
  // remaining linen no longer fits this piece. Display only -- /api/orders
  // refuses a sold-out colour on its own. See src/lib/fabricStock.ts.
  const [soldOutColors, setSoldOutColors] = useState<string[]>([]);
  useEffect(() => {
    let live = true;
    fetch("/api/stock")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { soldOut?: Record<string, string[]> } | null) => {
        if (!live || !d?.soldOut) return;
        setSoldOutColors(
          Object.entries(d.soldOut)
            .filter(([, cats]) => cats.includes(item.category))
            .map(([color]) => color),
        );
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [item.category]);
  const colorSoldOut = soldOutColors.includes(spec.color);
  const [savedMeasurements, setSavedMeasurements] = useState<SavedMeasurements | undefined>();
  // Set when the customer arrived from a cart line's Edit link. Saving then
  // overwrites that line instead of appending a second one.
  const [editingId, setEditingId] = useState<string | null>(null);
  // Captured once, when a cart line is restored. This must be state rather
  // than a value derived during render: SizePicker seeds its fields from an
  // effect keyed on this object's identity, so handing it a freshly parsed
  // object every render re-fires that effect, which calls back up into
  // setSpec here and renders again -- an infinite loop that wedges the page
  // (and silently swallowed the redirect to /cart).
  const [restoredMeasurements, setRestoredMeasurements] = useState<SavedMeasurements | undefined>();
  // Tailored orders used to be placeable with no measurements at all -- the
  // constraints gate only covered the fabric/layer/logo rules and never looked
  // at the numbers. Each unmakeable order costs a manual stylist round-trip.
  const [measurementsValid, setMeasurementsValid] = useState(true);

  // ── THE DETAILS SHEET (PHONES) ────────────────────────────────────────────
  // Founder 2026-11-20, on a mockup, about the page ads land on: "there are
  // still too many things… overwhelming for the customer… maybe a tab that
  // opens with all the info on the side." Below lg, Size, "Any special
  // request?", All included, Product information and the footnote no longer
  // stack under Add to cart. ONE row replaces them and opens a bottom sheet
  // (DetailsSheet) holding all of it. Three things open it: that row, the
  // "All included" link under the price, and the size line's link, which
  // lands on the Size section. null = closed.
  // Everything inside writes to the same `spec`, so the size line on the
  // first screen is already right when she closes it.
  const [sheet, setSheet] = useState<null | "top" | "size">(null);
  const closeSheet = useCallback(() => setSheet(null), []);

  // STICKY BUY BAR. The reviewer's requirement was that the customer can reach
  // Add to cart "sans avoir besoin de défiler et peu importe les dimensions de
  // son écran" -- without scrolling, whatever their screen size. Reordering
  // could not deliver that: colour, two sliders, size, the size chart and Make
  // it your way are all decisions that belong ABOVE the button, and on a laptop
  // that puts it past 1200px however it is arranged.
  //
  // So the real button keeps its place at the end of the column, and a bar
  // appears only while it is off screen. An IntersectionObserver, not a scroll
  // listener: no work on the main thread between intersections, and it is
  // correct at any viewport without hardcoding a breakpoint.
  const buyRef = useRef<HTMLDivElement | null>(null);
  const [buyVisible, setBuyVisible] = useState(true);
  useEffect(() => {
    const el = buyRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setBuyVisible(e.isIntersecting), {
      rootMargin: "0px 0px -80px 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  // PHONES: a second Add to cart sits on the first screen, right under the
  // option chips (founder ok 2026-11-18). While THAT one is on screen the
  // sticky bar would be a duplicate a few pixels below it, so the bar waits
  // until both buttons are off screen -- which is the stretch between them,
  // while she is in Size and the notes. The -60px top margin stops counting
  // the button once it has slid under the sticky header.
  // From lg up the first-screen button is display:none, an observer reports
  // it as not intersecting, and the bar behaves exactly as it did.
  // Below lg the lower button is hidden, so only the first-screen button
  // decides whether the sticky bar shows. SSR default false = phone rules.
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const on = () => {
      setIsDesktop(mq.matches);
      // A phone turned to a desktop width with the sheet open: from lg the
      // sheet is an ordinary block, so it must not stay a "dialog".
      if (mq.matches) setSheet(null);
    };
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  // ⚠️ NO GAP IN THE HANDOFF (founder 2026-11-20: "the Add to cart briefly
  // disappears while scrolling"). The bar used to wait until the whole block
  // (size line + button) had left a fixed 60px line, while the real header is
  // taller than that: for a stretch of scroll the button was already under
  // the header and the bar had not arrived, so there was no Add to cart on
  // screen at all. Now:
  //   - the BUTTON itself is observed, not the block around it;
  //   - the top margin is the header's measured height, not a guess;
  //   - "visible" means WHOLLY visible (ratio >= 0.98, i.e. within 1px), so
  //     the bar arrives when the first pixel of the button slips under the
  //     header, while the rest of it is still on screen. Overlap, never a gap.
  // From lg the button is display:none, ratio 0, same result as before.
  const stageBuyRef = useRef<HTMLButtonElement | null>(null);
  const [stageBuyVisible, setStageBuyVisible] = useState(true);
  useEffect(() => {
    const el = stageBuyRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const header = document.querySelector("header");
    let io: IntersectionObserver | null = null;
    let top = -1;
    const observe = () => {
      const h = Math.round(header?.getBoundingClientRect().height ?? 60);
      if (h === top) return;
      top = h;
      io?.disconnect();
      io = new IntersectionObserver(
        ([e]) => setStageBuyVisible(e.isIntersecting && e.intersectionRatio >= 0.98),
        { rootMargin: `-${h}px 0px 0px 0px`, threshold: [0, 0.98, 1] },
      );
      io.observe(el);
    };
    observe();
    // The header changes height (slim on cart pages, fonts landing).
    const ro = header && typeof ResizeObserver !== "undefined" ? new ResizeObserver(observe) : null;
    if (header) ro?.observe(header);
    return () => {
      io?.disconnect();
      ro?.disconnect();
    };
  }, []);
  const { items, addItem, updateItem } = useCart();
  const { isSignedIn } = useUser();
  const router = useRouter();
  // Restoring a cart line must happen exactly once. The effect below depends
  // on `items`, which changes on every later edit -- without this the restore
  // would re-run and throw away whatever the customer had just changed.
  const restored = useRef(false);

  useEffect(() => {
    if (!isSignedIn) return;
    fetch("/api/account/measurements")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && data.measurements) setSavedMeasurements(data.measurements);
      })
      .catch(() => {});
  }, [isSignedIn]);

  // Two entry points, both read on the client instead of via the page's
  // searchParams: adding searchParams to the server component would opt all
  // eight design pages out of static prerendering, which would cost more than
  // this is worth.
  //
  // ?color=Navy  -- deep link from a catalog card's colour swatch.
  // ?edit=<id>   -- reopening a line already in the cart. Adding to the cart
  //                 used to be a one-way door: the only way to change a colour
  //                 you'd just picked was to build the whole garment again.
  useEffect(() => {
    if (restored.current) return;
    const params = new URLSearchParams(window.location.search);
    const editId = params.get("edit");

    if (editId) {
      // The cart hydrates from localStorage in an effect, so on the first
      // pass `items` is still empty. Bail without latching and this runs
      // again when the cart arrives. A stale id (cart cleared, line removed)
      // simply never matches, and the page stays a normal new design.
      const line = items.find((i) => i.id === editId);
      if (!line) return;
      restored.current = true;
      setEditingId(editId);
      setRestoredMeasurements(parseMeasurements(line.measurements));
      setSpec((prev) => ({
        ...prev,
        fabric: line.fabric,
        color: isKnownColor(item, line.color) ? line.color : prev.color,
        sizeMode: line.size === "Tailored" ? "tailored" : "standard",
        size: line.size === "Tailored" ? prev.size : line.size,
        measurements: line.measurements,
        fitNotes: resolveFitNotes(item.category, line.fitNotes),
        // Only offered sliders come back: changesFromLabels also refills the
        // premium tier at its defaults, which then rode into the order.
        changes: changesFromLabels(paramKeyFor(item), line.changes, item.defaultChanges).filter((c) =>
          renderParamsForCategory(paramKeyFor(item)).some((p) => p.type === c.type),
        ),
        freeformNotes: line.freeformNotes,
      }));
      return;
    }

    restored.current = true;
    const color = params.get("color");

    // Render-slider values can also arrive in the URL, so a choice made on the
    // home-page demo is still made when the visitor lands here. Added
    // 2026-08-25: previously the demo could only hand over a colour, so
    // picking short sleeves and pressing the button produced a long-sleeved
    // shirt, which is a worse first impression than not offering the choice.
    //
    // Nothing here trusts the URL. Values are matched against each slider's
    // own option list by defaultChangesForCategory, which falls back to the
    // slider default for anything it does not recognise, so a hand-typed
    // ?sleeve_length=banana is simply the default rather than an error state.
    // Premium sliders are excluded: they are not customer-editable yet, and a
    // URL must not be a way around that.
    const sliderOverrides: Record<string, string> = {};
    for (const param of renderParamsForCategory(paramKeyFor(item))) {
      const raw = params.get(param.type);
      if (raw && param.options.some((o) => o.value === raw)) {
        sliderOverrides[param.type] = raw;
      }
    }
    const hasSliderOverride = Object.keys(sliderOverrides).length > 0;

    if (color || hasSliderOverride) {
      setSpec((prev) => ({
        ...prev,
        color: color && isKnownColor(item, color) ? color : prev.color,
        changes: hasSliderOverride
          ? defaultChangesForCategory(paramKeyFor(item), {
              ...item.defaultChanges,
              ...sliderOverrides,
            })
          : prev.changes,
      }));
    }
  }, [item, items]);

  // ViewContent: the customer is looking at a specific garment. This is what
  // Meta's catalog retargeting keys off, so a browser who leaves without
  // adding to cart can still be shown the piece they were configuring.
  // Fires once per item, not on every slider change.
  useEffect(() => {
    track("ViewContent", {
      content_type: "product",
      content_ids: [item.slug],
      content_name: item.name,
      content_category: item.category,
      ...money(item.price),
    });
  }, [item.slug, item.name, item.category, item.price]);

  const price = item.price;
  const colorVariant = item.colorImages?.[spec.color];
  // paramKeyFor, not item.category: an item may declare its own slider set,
  // and the combo key must be built from THAT set or two products in one
  // category would look up each other's photographs.
  const comboKey = comboKeyForCategory(paramKeyFor(item), spec.changes);
  const comboVariant = comboKey ? item.comboImages?.[spec.color]?.[comboKey] : undefined;
  const previewImage = comboVariant?.front ?? colorVariant?.front ?? item.image;
  const previewBackImage = comboVariant?.back ?? colorVariant?.back ?? item.backImage;


  // Every color/view the customer could switch to for this item, so
  // CustomizeParameters can preload all of them up front -- switching color
  // or flipping front/back should hit the browser cache instantly instead
  // of triggering a fresh fetch each time (the actual source of the
  // "bugging when I switch photos" complaint, not a logic bug). For combo
  // items this would balloon (up to 9 combos x 4 colors), so combo variants
  // only preload for the currently selected color -- switching sliders
  // within a color is instant, switching color falls back to that color's
  // default combo photo until its own combos preload in behind it.
  const currentColorCombos = Object.values(item.comboImages?.[spec.color] ?? {}).flatMap((v) => [
    v?.front,
    v?.back,
  ]);
  // Split into two tiers, because they are not equally urgent.
  //
  // EAGER: what the customer can reach without changing colour -- the current
  // colourway's front and back, and its combo photos. Flipping front/back or
  // moving a slider stays instant, which is what the original preload was for.
  //
  // DEFERRED: the OTHER colourways' base photos. A performance review measured
  // these at 71-125KB per design page, fetched with `priority`, which tells the
  // browser they matter MORE than the preview photo the customer is actually
  // looking at -- and that preview is the LCP element. Six speculative images
  // were being loaded ahead of the one on screen, for colours most visitors
  // never tap. They still load, just without jumping the queue.
  const currentColor = item.colorImages?.[spec.color];
  const eagerPreloads = Array.from(
    new Set(
      [currentColor?.front, currentColor?.back, ...currentColorCombos].filter(
        (src): src is string => Boolean(src),
      ),
    ),
  );
  const deferredPreloads = Array.from(
    new Set(
      Object.entries(item.colorImages ?? {})
        .filter(([name]) => name !== spec.color)
        .flatMap(([, v]) => [v?.front, v?.back])
        .filter((src): src is string => Boolean(src)),
    ),
  ).filter((src) => !eagerPreloads.includes(src));

  // A reopened line's own measurements win over the ones saved on the
  // account: the /account fetch resolves later and would otherwise overwrite
  // what the customer actually ordered. Both sides are state, so the identity
  // handed to SizePicker stays stable across renders.
  const measurementSeed = restoredMeasurements ?? savedMeasurements;

  function handleSave() {
    const line = {
      slug: item.slug,
      // Editing a line must not silently reset how many were ordered -- the
      // customer came back to change a colour, not the count.
      quantity: (editingId && items.find((i) => i.id === editingId)?.quantity) || 1,
      name: item.name,
      category: item.category,
      gradient: item.gradient,
      price,
      fabric: spec.fabric,
      color: spec.color,
      size: spec.sizeMode === "tailored" ? "Tailored" : spec.size,
      measurements: spec.sizeMode === "tailored" ? spec.measurements : "",
      // Standard only. On a tailored order the garment is cut to the
      // customer's own numbers, so "my usual M is tight" describes a garment
      // nobody is making -- carrying it would just be noise on the tech pack.
      // Kept for BOTH size modes. They used to be dropped on a tailored
      // order, on the reasoning that a garment cut to the customer's own
      // numbers cannot be "wrong in this size". Founder, 2026-08-27: they
      // belong on both -- and she is right, because these stopped being
      // complaints about a size chart when the labels were rewritten. "A
      // closer fit overall" is a preference about how the garment should hang,
      // which measurements do not express: they say what the body is, not how
      // she likes it to sit on her.
      fitNotes: spec.fitNotes,
      changes: spec.changes.map((c) => c.label),
      freeformNotes: spec.freeformNotes,
    };
    if (editingId) updateItem(editingId, line);
    else addItem(line);
    // Analytics only, and only on a genuine add -- an edit is not a new
    // intent to buy and would double-count the funnel. track() never throws
    // (see lib/metaPixel), so this cannot come between the customer and the
    // cart. No PII: item id, category, value, currency.
    if (!editingId) {
      track("AddToCart", {
        content_ids: [item.slug],
        content_name: item.name,
        content_type: "product",
        contents: [{ id: item.slug, quantity: line.quantity }],
        ...money(price * line.quantity),
      });
    }
    router.push("/cart");
  }
  // The first-screen button on phones. The two older buttons below keep their
  // own inline copies of these on purpose: this change does not touch them.
  const buyDisabled = !spec.constraints.passed || colorSoldOut;
  const buyLabel = colorSoldOut ? `${spec.color} sold out` : editingId ? "Save changes" : "Add to cart";

  return (
    // max-w-xl here is the real cap on the customizer -- the page wrapper has
    // one too, but this inner one is narrower and wins. Widened from lg up so
    // the two-column layout in CustomizeParameters actually has room; below lg
    // the original single-column width is unchanged.
    /* Below lg there is NO space above the photo: the 48px that stood between
       the header and the garment is what the option chips needed to fit on
       the first screen. From lg the padding is what it was (py-10, mt-4). */
    <div className="mx-auto w-full max-w-xl px-4 pb-8 sm:px-6 sm:pb-10 lg:max-w-5xl lg:pt-10">
      {editingId && (
        <p className="mt-2 mb-2 rounded-shaklek-xs lg:mt-0 lg:mb-4 border border-border-strong bg-surface-2 px-4 py-3 text-xs text-text-2">
          Editing a piece already in your cart. Your changes replace it.
        </p>
      )}

      {/* No step tabs, no "Step 2 of 3". Founder's brief: customisation and
          the fit belong on ONE page. Splitting them added a layer to cross
          without adding anything the customer needed, and every layer between
          a decision and a cart is somewhere to lose them. Order is now
          options, then size, then the optional detail, then add to cart. */}

      <div className="lg:mt-4">
          <CustomizeParameters
            stageAction={
              /* lg:hidden -- desktop has the buy block in view in its own
                 column already. min-h-12: a 48px target. Same handler, same
                 disabled rule and same label as the button below Size, and
                 the default is Tailored (we measure her after the order), so
                 adding from here is a complete, makeable order. */
              <div className="mt-3 lg:hidden">
                {/* Founder 2026-11-18: "size should be before add to cart?" The
                    default is Tailored, so the order is complete from here; this
                    line says so, and the link is for whoever wants a standard
                    size. Wording reuses SizePicker's approved line. */}
                <p className="mb-2 text-center text-[12px] text-text-2">
                  {spec.sizeMode === "tailored" ? (
                    <>Size: <span className="font-medium text-text">Tailored</span>, free fitting after payment</>
                  ) : (
                    <>Size: <span className="font-medium text-text">{spec.size}</span></>
                  )}
                  {" · "}
                  {/* A button, not a link to #size: Size lives in the details
                      sheet on phones now (2026-11-20) and this opens it at
                      that section. ::before grows the 18px line to a 38px
                      target, the most the 12px above and 8px below allow
                      without covering the chips or the button. */}
                  <button
                    type="button"
                    data-sheet-trigger="size"
                    aria-haspopup="dialog"
                    aria-controls="size"
                    onClick={() => setSheet("size")}
                    className="relative underline underline-offset-2 before:absolute before:-inset-x-3 before:-top-3 before:-bottom-2 before:content-['']"
                  >
                    {spec.sizeMode === "tailored" ? "or choose XS–XXL" : "change"}
                  </button>
                </p>
                <button
                  ref={stageBuyRef}
                  onClick={handleSave}
                  disabled={buyDisabled}
                  className="min-h-12 w-full rounded-full bg-accent px-8 py-3 text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                >
                  {buyLabel}
                </button>
              </div>
            }
            /* PHONES: the lead time sits here, once, right under the first-screen
               Add to cart (founder 2026-11-20: "we see the total twice"). The
               Total block that carried it is desktop-only now, so this is the
               one place a phone says it before checkout. Still quiet: 11px,
               no pill. Hidden from lg, where the Total block keeps its copy. */
            stageNote={
              <p className="mt-2 text-center text-[11px] text-text-3 lg:hidden">{LEAD_TIME}</p>
            }
            /* PHONES: "All included ⓘ", right-aligned under the price, as in
               the mockup (founder ok 2026-11-20). Ads promise "all included";
               this is where the landing page says it on the first screen
               without spending a line of it. Opens the sheet at the top,
               where the five lines are. The ::before reaches UP over the
               name row (nothing to press there) to make a 44px target, and
               only 8px down, so it never covers a colour swatch. */
            stageInfo={
              /* Later the same day (founder ok): the line now leads with "Made
                 to your measurements", which is what the ad promised and what
                 the first screen never said. ONE line: nowrap, 12px, 259px
                 wide against 328px available at 360. Only "All included" is
                 the link. */
              <p className="flex items-center justify-end gap-1.5 whitespace-nowrap text-[12px] leading-4 text-text-2 lg:hidden">
                <span>{spec.sizeMode === "tailored" ? "Made to your measurements" : "Made to order"}</span>
                <span aria-hidden="true">&middot;</span>
                <button
                  type="button"
                  data-sheet-trigger="included"
                  aria-haspopup="dialog"
                  aria-controls="size"
                  onClick={() => setSheet("top")}
                  className="relative inline-flex items-center gap-1 underline underline-offset-2 before:absolute before:-inset-x-3 before:-top-5 before:-bottom-2 before:content-['']"
                >
                  All included
                  <svg aria-hidden="true" viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.2">
                    <circle cx="8" cy="8" r="6.4" />
                    <path d="M8 7.2v4" strokeLinecap="round" />
                    <circle cx="8" cy="4.9" r="0.5" fill="currentColor" />
                  </svg>
                </button>
              </p>
            }
            spec={spec}
            onSpecChange={setSpec}
            itemName={item.name}
            price={price}
            /* paramKeyFor, not item.category: this prop selects which SLIDERS
               to render, and an item may declare its own set. DetailField
               below still takes the real category, because its note examples
               are per garment type. */
            category={paramKeyFor(item)}
            availableColors={Object.keys(item.colorImages ?? {})}
            soldOutColors={soldOutColors}
            included={includedWith(item.category)}
            includedCopy={INCLUDED_COPY}
            previewImage={previewImage}
            previewBackImage={previewBackImage}
            previewGradient={item.gradient}
            preloadImages={eagerPreloads}
            deferredPreloads={deferredPreloads}
            primaryAction={
              <>
        {/* No "Next" button and no way back to the catalogue. Both are removed
            deliberately: the customer is one decision from buying, and offering
            a return to the catalogue at that moment is an invitation to leave.
            Adding a second piece is offered AFTER the cart instead. */}
        {/* Below lg the gaps are halved (founder 2026-11-20, on her phone: "the
            space between Add to cart and Size is too far"): it was 81px of
            margin and padding around one hairline. From lg nothing changed. */}
        {/* PHONES: the ONE row that replaced the stack (founder 2026-11-20).
            Hairline above and below, 48px tall. Hidden from lg, where
            everything it opens is on the page. */}
        <button
          type="button"
          data-sheet-trigger="details"
          aria-haspopup="dialog"
          aria-controls="size"
          onClick={() => setSheet("top")}
          className="mt-4 flex min-h-12 w-full items-center justify-between gap-3 border-y border-border py-3 text-left text-sm text-text lg:hidden"
        >
          Details, size &amp; special request
          <span aria-hidden="true" className="text-lg leading-none text-text-3">&rsaquo;</span>
        </button>

        {/* Below lg this whole block is the bottom sheet; from lg it is the
            same block in the page it always was (the wrapper carries the old
            id="size" and lg:mt-8). See DetailsSheet. */}
        <DetailsSheet open={sheet !== null} section={sheet === "size" ? "size" : null} onClose={closeSheet}>
            {/* PHONES: first thing in the sheet, always open. Desktop keeps
                the folded card further down. Same five lines, one source. */}
            <div className="lg:hidden">
              {/* The piece in one line, from catalog.ts (founder 2026-11-20).
                  `descriptor` is the only description field the catalogue
                  has; nothing is drawn for an item without one. */}
              {item.descriptor?.trim() ? (
                <p data-sheet-description className="pb-3 text-[13px] leading-relaxed text-text-2">
                  <span className="text-text">{item.name}.</span> {item.descriptor.trim()}.
                </p>
              ) : null}
              <IncludedInPrice variant="sheet" category={item.category} />
              {/* "After you order": how she gets measured, in three steps.
                  Copy lives in data/included.ts (AFTER_ORDER), one constant,
                  pending a marketing check. */}
              <section data-sheet-section="after" className="border-t border-border pb-4 pt-4">
                <p className="text-[13px] font-medium text-text">{AFTER_ORDER.heading}</p>
                <ol className="mt-2 space-y-1.5">
                  {(spec.sizeMode === "tailored" ? AFTER_ORDER.steps : AFTER_ORDER.standardSteps).map((step, i) => (
                    <li key={step} className="flex gap-2.5 text-[13px] leading-relaxed text-text-2">
                      <span aria-hidden="true" className="w-3 shrink-0 text-text-3">{i + 1}</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </section>
            </div>

            <div data-sheet-section="size">
            <SizePicker
              sizeMode={spec.sizeMode}
              size={spec.size}
              category={spec.garmentType}
              fitNotes={spec.fitNotes}
              onFitNotesChange={(fitNotes) => setSpec((s) => ({ ...s, fitNotes }))}
              measurements={spec.measurements}
              initialMeasurements={measurementSeed}
              onSizeModeChange={(sizeMode) => setSpec((s) => ({ ...s, sizeMode }))}
              onSizeChange={(size) => setSpec((s) => ({ ...s, size }))}
              onMeasurementsChange={(measurements) => setSpec((s) => ({ ...s, measurements }))}
              onMeasurementsValidChange={setMeasurementsValid}
              /* Inside "Make it your way" rather than after it: the chips are
                 the easy path and this is the same question for someone who
                 knows exactly what they want. Two separate blocks asking the
                 same thing made it a second decision. */
              detailSlot={
                <DetailField
                  spec={spec}
                  category={item.category}
                  onSpecChange={setSpec}
                />
              }
              /* PHONES: Product information sits between Size and the special
                 request in the sheet (founder's order, 2026-11-20). Desktop
                 keeps its own copy after All included, below. Exactly one of
                 the two is displayed at any width. */
              afterSizeSlot={
                <div className="lg:hidden">
                  <ProductDisclosure garmentName={item.name} />
                </div>
              }
            />
            </div>

            {/* ⚠️ SAVE-MEASUREMENTS IS GONE, and it had to be. It offered to
                store the numbers she had just typed, at the highest-intent
                moment there is. Since 2026-09-14 there are no numbers: Tailored
                means we come and measure her, so the only thing this could have
                saved is an empty string. Founder: "same thing for saved
                measurements, it doesn't have to be there anymore."

                The ACCOUNT page still reads and writes measurements, and
                /api/account/measurements is untouched, so a returning customer
                whose numbers we took at a fitting still has them. What has gone
                is asking her to type them at checkout. */}

            {/* ⚠️ DESKTOP ONLY (hidden below lg), AND DO NOT SHOW IT ON PHONES
                AGAIN. Founder, 2026-11-20, testing on her phone: "we see the
                total twice even though it's the same". Below lg the price is
                already beside the name under the photo and in the sticky bar,
                and the button in this block was hidden there on 2026-11-18,
                so what was left was a second price with nothing to press.
                The lead time moved up under the first-screen Add to cart
                (stageNote above). From lg this renders exactly as before:
                the sm: classes became lg: ones, same computed layout. */}
            <div
              ref={buyRef}
              className="mt-5 hidden gap-3 border-t border-border pt-4 lg:flex lg:flex-row lg:items-center lg:justify-between"
            >
              <div>
                <p className="text-xs text-text-3">Total</p>
                <p className="font-display text-2xl text-text">AED {price}</p>
                {/* ⚠️ NO VISIT LINE HERE, AND DO NOT PUT ONE BACK. One lived
                    here from 2026-09-14 -- "We come to you and measure you.
                    Free, in Dubai." -- on the reasoning that the size section
                    above is the one place somebody who has already chosen a
                    size never reads. Founder, 2026-09-16, reading the page:
                    "i feel a repetition".

                    She is right, and the reasoning had gone stale under it:
                    SizePicker now says it in BOTH modes, not just Tailored.
                    Tailored gets the full offer, Standard gets "Or choose
                    Tailored and we come and measure you, free on your first
                    order, in Dubai" -- so there is no longer a state in which
                    a customer reaches this price block without having just
                    passed the offer a few centimetres above it.

                    Two near-identical sentences that close together do not
                    reinforce the offer, they make the page read as generated.
                    The lead time below stays because it is the only line here
                    that says something new. */}
                {/* ⚠️ THE LEAD TIME, AND THIS IS THE ONLY PLACE IT APPEARS
                    ABOVE CHECKOUT. Founder, 2026-09-16, after asking where
                    delivery time was said: "we can put it in the question or
                    under each item for delivery information."

                    It was in seven places -- both FAQs, /shipping, the terms,
                    the checkout form, /order-confirmed and the order email --
                    and NOT on a single product page, so a customer chose
                    options, added to cart and first learned the wait at
                    checkout. That is the one moment it is least welcome.

                    ⚠️ "MADE AFTER YOU ORDER" COMES FIRST ON PURPOSE. The wait
                    is a consequence of made-to-order, not a shipping delay,
                    and the two read completely differently. Stating the reason
                    before the number is the difference between "they are slow"
                    and "of course it takes that long".

                    (Phones: the same line is under the first-screen Add to
                    cart instead, see stageNote. Still once per width.)

                    ⚠️ QUIET, NOT A BADGE. The home page still says it nowhere
                    above its FAQ, and that stays true: speed is the wrong
                    headline for a made-to-order garment, it reads as carelessly
                    made. Here it is a fact somebody needs before paying, so it
                    sits at 11px under the price with the visit line, not in a
                    pill next to the button. */}
                <p className="mt-0.5 text-[11px] text-text-3">
                  {LEAD_TIME}
                </p>
              </div>
              <button
                onClick={handleSave}
                disabled={!spec.constraints.passed || colorSoldOut}
                // Phones: hidden (founder 2026-11-18, "why 2 add to cart?").
                // The first-screen button and the sticky bar cover it there.
                className="hidden w-full rounded-full bg-accent px-8 py-3.5 lg:inline-block lg:w-auto text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                // ⚠️ THE MEASUREMENTS GATE IS GONE, and so is its tooltip.
                // SizePicker.tsx:88 now sets measurementsValid to a literal
                // true, because Tailored means WE take the measurements and
                // there are no fields left to be wrong. The message told the
                // customer to "add your measurements above" in a panel that no
                // longer exists, and the disabled state could never fire.
                title={
                  !spec.constraints.passed
                    ? "Resolve the flagged request above before continuing"
                    : undefined
                }
              >
                {colorSoldOut ? `${spec.color} sold out` : editingId ? "Save changes" : "Add to cart"}
              </button>
            </div>

            {/* ⚠️ WHAT THE PRICE INCLUDES, DIRECTLY UNDER THE PRICE AND THE
                BUTTON. Founder priority 2026-11-12: it must be obvious that
                AED {price} is the whole price -- fitting, every option, linen,
                delivery, one alteration. One card (IncludedInPrice), copy from
                data/included.ts so checkout and the home page agree. On a phone
                this WAS the next thing after Add to cart; since 2026-11-20 a
                phone reaches it from the "All included" link under the price
                and reads it at the top of the details sheet. It is NOT in the
                sticky bar, which stays name + price + button. The shayla line appears here for abayas; the
                IncludedPieces photo block under the colour swatches stays
                because it shows the shayla IN HER COLOUR, which a line of text
                cannot. They are a full screen apart on every breakpoint. */}
            {/* DESKTOP ONLY since 2026-11-20: on phones the same lines are the
                first section of the details sheet (variant="sheet" above). */}
            <div className="hidden lg:block">
              <IncludedInPrice variant="card" category={item.category} />
            </div>

            {/* The consumer information UAE law requires with a product:
                fibre composition, origin, care and return terms, in Arabic
                alongside English. Placed AFTER Add to cart on purpose -- it is
                reference the customer must be able to find, not another
                decision in front of the button. See
                data/productDisclosure.ts for the law it satisfies and for
                which Arabic strings are founder-verified. */}
            {/* DESKTOP ONLY since 2026-11-20: the phone copy is inside the
                sheet, handed to SizePicker as afterSizeSlot. */}
            <div className="hidden lg:block">
              <ProductDisclosure garmentName={item.name} />
            </div>

            {/* PHONES: the one footnote, last line of the sheet. Both
                sentences verbatim, as they were at the end of the page. */}
            <p className="mt-4 text-[11px] leading-relaxed text-text-3 lg:hidden">
              * Images are illustrative. Shade and fall vary slightly. {SHADE_NOTE}
            </p>
        </DetailsSheet>
              </>
            }
          />

      {/* Only while the real button is off screen, so it never doubles up. */}
      {(isDesktop ? !buyVisible : true) && !stageBuyVisible && (
        // bottom follows the cookie bar's height while it is open (CookieConsent
        // publishes --consent-h), so the button is never underneath it.
        <div
          className="fixed inset-x-0 z-40 border-t border-border bg-white"
          style={{ bottom: "var(--consent-h, 0px)" }}
        >
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-2 sm:gap-4 sm:px-6 sm:py-3">
            {/* Founder 2026-11-13 (preview): the photo scrolls away while she
                picks Length or Closures, so the bar carries a live thumbnail
                that changes with every tap. */}
            {previewImage ? (
              <div className="relative h-14 w-10 shrink-0 overflow-hidden bg-white">
                <Image src={previewImage} alt="" fill sizes="40px" className="object-contain" />
              </div>
            ) : null}
            <div className="mr-auto min-w-0">
              <p className="truncate text-[13px] text-text">{item.name}</p>
              <p className="font-display text-lg leading-tight text-text">
                AED {price}
              </p>
            </div>
            <button
              onClick={handleSave}
              disabled={!spec.constraints.passed || colorSoldOut}
              className="shrink-0 rounded-full bg-accent px-7 py-3 text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-40"
              title={
                !spec.constraints.passed
                  ? "Resolve the flagged request above before continuing"
                  : undefined
              }
            >
              {colorSoldOut ? `${spec.color} sold out` : editingId ? "Save changes" : "Add to cart"}
            </button>
          </div>
        </div>
      )}

      {/* The illustrative-images note, moved down here from directly under the
          preview. It was pushing the parameters further from the photo on a
          phone for a line nobody reads before choosing a colour. It still
          sits above the fold of the decision, just not in the way of it. */}
      {/* Below lg the shade line joins it, so the two notes about what a
          screen can and cannot show are ONE footnote instead of two scattered
          lines (founder 2026-11-20). Both sentences are verbatim. From lg the
          shade line is still under the swatches (FabricColorPicker). */}
      {/* 2026-11-20, later: DESKTOP ONLY. On phones this footnote is the last
          line of the details sheet (same two sentences), not in the page. */}
      <p className="hidden px-1 text-[11px] leading-relaxed text-text-3 lg:mt-8 lg:block">
        * Images are illustrative. Shade and fall vary slightly.
      </p>

      {/* Shaklek+ sits AFTER the decision. It advertises features nobody can
          buy yet, so it must never stand between the customer and the cart --
          it used to render between the sliders and the fit. */}
      {SHAKLEK_PLUS_ON ? (
        <div className="mt-10 border-t border-border pt-8">
          <ShaklekPlusSignup source="customizer" />
        </div>
      ) : null}
      </div>
    </div>
  );
}

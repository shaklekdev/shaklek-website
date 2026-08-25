"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import type { CatalogItem } from "@/data/catalog";
import { createSpecFromCatalog, type DesignSpec } from "@/data/designSpec";
import {
  changesFromLabels,
  comboKeyForCategory,
  defaultChangesForCategory,
  renderParamsForCategory,
} from "@/data/parameterSliders";
import { useCart } from "@/lib/CartContext";
import { money, track } from "@/lib/metaPixel";
import CustomizeParameters from "@/components/CustomizeParameters";
import SizePicker, { parseMeasurements } from "@/components/SizePicker";
import DetailField from "@/components/DetailField";
import SaveMeasurements from "@/components/SaveMeasurements";
import ShaklekPlusSignup from "@/components/ShaklekPlusSignup";

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
        changes: changesFromLabels(item.category, line.changes, item.defaultChanges),
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
    for (const param of renderParamsForCategory(item.category)) {
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
          ? defaultChangesForCategory(item.category, {
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
  const comboKey = comboKeyForCategory(item.category, spec.changes);
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

  return (
    // max-w-xl here is the real cap on the customizer -- the page wrapper has
    // one too, but this inner one is narrower and wins. Widened from lg up so
    // the two-column layout in CustomizeParameters actually has room; below lg
    // the original single-column width is unchanged.
    <div className="mx-auto w-full max-w-xl px-4 py-8 sm:px-6 sm:py-10 lg:max-w-5xl">
      {editingId && (
        <p className="mb-4 rounded-shaklek-xs border border-border-strong bg-surface-2 px-4 py-3 text-xs text-text-2">
          Editing a piece already in your cart. Your changes replace it — you won&apos;t
          end up with two.
        </p>
      )}

      {/* No step tabs, no "Step 2 of 3". Founder's brief: customisation and
          the fit belong on ONE page. Splitting them added a layer to cross
          without adding anything the customer needed, and every layer between
          a decision and a cart is somewhere to lose them. Order is now
          options, then size, then the optional detail, then add to cart. */}

      <div className="mt-4">
          <CustomizeParameters
            spec={spec}
            onSpecChange={setSpec}
            itemName={item.name}
            price={price}
            category={item.category}
            previewImage={previewImage}
            previewBackImage={previewBackImage}
            previewGradient={item.gradient}
            preloadImages={eagerPreloads}
            deferredPreloads={deferredPreloads}
          />
      </div>

      {/* No "Next" button and no way back to the catalogue. Both are removed
          deliberately: the customer is one decision from buying, and offering
          a return to the catalogue at that moment is an invitation to leave.
          Adding a second piece is offered AFTER the cart instead. */}
      <div className="mt-10 border-t border-border pt-8">
          <h2 className="text-lg text-text">Your size</h2>

          <SizePicker
            sizeMode={spec.sizeMode}
            size={spec.size}
            measurements={spec.measurements}
            initialMeasurements={measurementSeed}
            onSizeModeChange={(sizeMode) => setSpec((s) => ({ ...s, sizeMode }))}
            onSizeChange={(size) => setSpec((s) => ({ ...s, size }))}
            onMeasurementsChange={(measurements) => setSpec((s) => ({ ...s, measurements }))}
            onMeasurementsValidChange={setMeasurementsValid}
          />

          {/* The highest-intent moment there is: they have just typed their
              numbers and are about to buy. Renders only when the measurements
              are valid, and cannot block anything below it. */}
          {spec.sizeMode === "tailored" && (
            <SaveMeasurements
              measurements={spec.measurements}
              valid={measurementsValid}
              className="mt-4"
            />
          )}

          <DetailField
            spec={spec}
            category={item.category}
            onSpecChange={setSpec}
          />

          <div className="mt-10 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs text-text-3">Total</p>
              <p className="font-display text-2xl text-text">AED {price}</p>
            </div>
            <button
              onClick={handleSave}
              disabled={!spec.constraints.passed || !measurementsValid}
              className="w-full rounded-full bg-accent px-8 py-3.5 text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-40 sm:w-auto"
              title={
                !spec.constraints.passed
                  ? "Resolve the flagged request above before continuing"
                  : !measurementsValid
                    ? "Add your measurements above before continuing"
                    : undefined
              }
            >
              {editingId ? "Save changes" : "Add to cart"}
            </button>
          </div>

      {/* Shaklek+ sits AFTER the decision. It advertises features nobody can
          buy yet, so it must never stand between the customer and the cart --
          it used to render between the sliders and the fit. */}
      <div className="mt-10 border-t border-border pt-8">
        <ShaklekPlusSignup source="customizer" />
      </div>
      </div>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { colors } from "@/data/colors";
import type { DesignSpec, Fabric, SilhouetteChangeType } from "@/data/designSpec";
import { renderParamsForCategory, premiumParamsForCategory } from "@/data/parameterSliders";
import FabricColorPicker from "@/components/FabricColorPicker";
import { CONSENT_EVENT, readConsent } from "@/lib/consent";

// useLayoutEffect warns during server rendering; this component is rendered on
// the server too, where there is nothing to measure.
const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;
import IncludedPieces from "@/components/IncludedPieces";
import type { IncludedPiece } from "@/data/catalog";
import { SELLABLE_FABRICS } from "@/data/fabrics";

const PREVIEW_SIZES = "(min-width: 640px) 576px, 100vw";

// Sits on the photograph. One fabric today, so this is a statement rather than
// a choice; if a second becomes sellable the picker below carries the choice
// and this stays the label of whatever is selected.
const FABRIC_BADGE = SELLABLE_FABRICS.map((f) => f.label).join(" / ");

// Examples have to match the garment in front of you -- "no chest pocket" on a
// pair of trousers reads as a page that isn't paying attention. Anything not
// listed gets an empty placeholder rather than a wrong one.
const NOTE_EXAMPLES: Record<string, string> = {
  Shirt: "e.g. a wider collar, no chest pocket, sleeves a little shorter",
  Pants: "e.g. deeper pockets, a higher waist, no turn-up on the hem",
  Skirt: "e.g. a longer hem, a side slit, a flatter waistband",
  Dress: "e.g. a higher neckline, a looser waist, longer sleeves",
};

export default function CustomizeParameters({
  spec,
  onSpecChange,
  itemName,
  price,
  category,
  previewImage,
  previewBackImage,
  previewGradient,
  preloadImages = [],
  deferredPreloads = [],
  primaryAction,
  stageAction,
  stageNote,
  availableColors,
  soldOutColors = [],
  included = [],
  includedCopy,
}: {
  spec: DesignSpec;
  availableColors: string[];
  /** Colours whose linen has run out for this piece (src/lib/fabricStock.ts). */
  soldOutColors?: string[];
  included?: IncludedPiece[];
  includedCopy?: { heading: string; line: string };
  onSpecChange: (spec: DesignSpec) => void;
  itemName: string;
  price: number;
  category: string;
  previewImage?: string | null;
  previewBackImage?: string | null;
  previewGradient: [string, string];
  preloadImages?: string[];
  // Other colourways. Warmed AFTER the visible preview rather than in front of
  // it -- see the tiering note in DesignCustomizer.
  deferredPreloads?: string[];
  // Rendered directly beneath the choices, above the Shaklek+ note. The CTA
  // used to sit after everything, so getting to checkout meant scrolling past
  // an upsell for features that are not purchasable yet.
  primaryAction?: React.ReactNode;
  // PHONES ONLY (the caller hides it from lg up): the Add to cart that sits
  // directly under the option chips, on the first screen. The full buy block
  // with the total stays where it is, inside primaryAction, after Size.
  stageAction?: React.ReactNode;
  // PHONES ONLY (the caller hides it from lg up): one quiet line directly
  // under that button. Outside the measured stage, so it never costs the
  // photo any height.
  stageNote?: React.ReactNode;
}) {
  function handleFabricChange(fabric: Fabric) {
    onSpecChange({ ...spec, fabric });
  }
  function handleColorChange(color: string) {
    onSpecChange({ ...spec, color });
  }
  function setChange(type: SilhouetteChangeType, value: string, label: string) {
    const changes = spec.changes.filter((c) => c.type !== type);
    changes.push({ type, value, label });
    onSpecChange({ ...spec, changes });
  }

  const [view, setView] = useState<"front" | "back">("front");
  const activeImage = view === "back" && previewBackImage ? previewBackImage : previewImage;
  const canSlide = Boolean(previewBackImage);
  const touchStartX = useRef(0);

  // Other colourways wait until the VISIBLE photo has finished loading.
  //
  // Marking them fetchPriority="low" stopped them jumping the queue but did
  // not stop them competing: on a throttled phone the four slowest requests on
  // this page were burgundy and navy, none of which the customer had asked
  // for, at 1.2-1.3s each while the ivory they were looking at waited behind
  // them. Founder: "it's lagging a lot, it takes a lot of time for the image
  // to load."
  //
  // Now nothing speculative is fetched until the preview is on screen, and
  // then only when the browser is idle. Switching colour stays instant for
  // anyone who waited a second before touching a swatch, which is everyone.
  const [warm, setWarm] = useState(false);
  function warmOnIdle() {
    const w = window as typeof window & {
      requestIdleCallback?: (cb: () => void) => number;
    };
    if (w.requestIdleCallback) w.requestIdleCallback(() => setWarm(true));
    else setTimeout(() => setWarm(true), 400);
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }
  function handleTouchEnd(e: React.TouchEvent) {
    if (!canSlide) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) < 40) return;
    setView(delta < 0 ? "back" : "front");
  }

  // ── THE FIRST SCREEN ON PHONES ────────────────────────────────────────────
  // Founder ok 2026-11-18 on a mockup. Before this the photo took the first
  // screen on its own and every option sat below it: she tapped "Short",
  // scrolled up to see it, scrolled down for the next one. Ads land here.
  //
  // Now, below lg, the photo is exactly as tall as the screen has left after
  // the header above and the name, colours, chips and Add to cart below. The
  // CSS is `.design-stage-photo` in globals.css; this effect only feeds it two
  // measured distances so a wrapped label or a taller header cannot push the
  // button off the screen:
  //   --stage-top    where the photo starts on the page
  //   --stage-below  from the photo's bottom edge to the end of the button
  // Neither depends on the photo's own height, so setting them cannot loop.
  //
  // ⚠️ STILL NOT STICKY. Everything is in normal flow and scrolls away
  // together; nothing slides under anything. Read the history further down
  // before reaching for position: sticky here.
  const rootRef = useRef<HTMLDivElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const stageEndRef = useRef<HTMLDivElement>(null);
  // Reads only refs and the DOM, so one stable function serves every caller.
  const measureStage = useCallback(() => {
    const root = rootRef.current;
    const photo = photoRef.current;
    const end = stageEndRef.current;
    if (!root || !photo || !end) return;
    // From lg up (or with no first-screen button) the CSS does not apply.
    if (window.matchMedia("(min-width: 64rem)").matches || end.getClientRects().length === 0) {
      root.style.removeProperty("--stage-top");
      root.style.removeProperty("--stage-below");
      return;
    }
    const p = photo.getBoundingClientRect();
    const set = (name: string, px: number) => {
      const v = `${Math.ceil(px)}px`;
      if (root.style.getPropertyValue(name) !== v) root.style.setProperty(name, v);
    };
    set("--stage-top", p.top + window.scrollY);
    // +10: breathing room under the button, above the fold or the cookie bar.
    set("--stage-below", end.getBoundingClientRect().bottom - p.bottom + 10);
  }, []);
  // After every render: a colour change can wrap the colour line.
  useIsoLayoutEffect(() => measureStage());
  useEffect(() => {
    const run = measureStage;
    const ro = new ResizeObserver(run);
    // The things above the photo and beside it whose height can change with
    // no render here: the header, the offer bar before it, web fonts landing.
    const header = document.querySelector("header");
    for (const el of [header, header?.previousElementSibling, nameRef.current, controlsRef.current]) {
      if (el) ro.observe(el);
    }
    window.addEventListener("resize", run);
    document.fonts?.ready.then(run).catch(() => {});
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", run);
    };
  }, [measureStage]);
  // The cookie bar's 61px is held back from the first paint on a first visit
  // (CSS default), so the page does not jump when the bar arrives 4s later.
  // Once she has answered, give the room back to the photo.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const sync = () => {
      if (readConsent() === "unset") root.style.removeProperty("--stage-reserve");
      else root.style.setProperty("--stage-reserve", "0px");
    };
    sync();
    window.addEventListener(CONSENT_EVENT, sync);
    return () => window.removeEventListener(CONSENT_EVENT, sync);
  }, []);

  const colorHex = colors.find((c) => c.name === spec.color)?.hex ?? previewGradient[0];
  // ⚠️ `category` here is a PARAM-SET KEY, not necessarily a category. Callers
  // pass paramKeyFor(item) so two products in one category can offer different
  // sliders -- the Open Abaya and the Jacket Abaya both sit in "Abaya".
  const params = renderParamsForCategory(category);
  const premiumParams = premiumParamsForCategory(category);

  return (
    // Ten out of ten people shown this read the old layout as a bug, and they
    // were right: the preview was sticky and the controls sat in the SAME
    // single column, so on scroll every option slid underneath the photo and
    // got sliced in half. A black pill button clipped by the image edge does
    // not read as "pinned preview", it reads as broken rendering.
    //
    // The width was also derived from the viewport HEIGHT (w-[40.5vh]), so the
    // control column got narrower on short windows and wider on tall ones, and
    // anything that would not fit overflowed sideways out of the column.
    //
    // Now: one column on phones, two from lg up -- preview sticky in its own
    // column, controls scrolling in theirs. Nothing can pass behind anything,
    // and the desktop layout stops wasting ~60% of the viewport.
    //
    // 2026-11-18: on phones the photo is now sized so the options fit on the
    // same screen (see THE FIRST SCREEN ON PHONES above). Still one column,
    // still nothing sticky in it.
    <div
      ref={rootRef}
      className="mx-auto grid w-full max-w-md min-w-0 grid-cols-1 gap-0 lg:max-w-none lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:items-start lg:gap-12"
    >
      <div className="min-w-0 lg:sticky lg:top-[98px]">
      {/* Preview.
          NOT STICKY ON PHONES. It was, and it was the "ten out of ten people
          read this as a bug" complaint all over again in a smaller form: the
          photo pinned under the header while everything below scrolled
          UNDERNEATH it, so the footnote rendered as "* Images" ... photo ...
          "is hand-cu", and the missing-combination notice was sliced into
          fragments around the image. Screenshots from the founder's phone,
          2026-08-25.
          The earlier fix only split the layout into two columns at `lg`, which
          cured the desktop overlap and left the phone exactly as it was --
          one column with a sticky element painting over its own siblings.
          A pinned preview is worth having on a wide screen, where it lives in
          its OWN column and cannot cover anything. On a phone there is only
          one column, so nothing may be sticky in it. object-contain because
          the box is not 3:4. */}
      {/* Below lg: edge to edge on a phone (-mx-4 cancels the page padding),
          height from .design-stage-photo, the 2:3 photo contained and centred
          on the same pale ground as the offer bar. From lg: the 2:3 box in its
          own sticky column, exactly as before. */}
      <div
        ref={photoRef}
        className="design-stage-photo relative -mx-4 touch-pan-y select-none overflow-hidden bg-surface-2 sm:mx-0 lg:mx-auto lg:aspect-[2/3] lg:w-full lg:bg-white"
        style={
          activeImage
            ? undefined
            : { background: `linear-gradient(135deg, ${colorHex}, ${previewGradient[1]})` }
        }
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* ON THE PHOTOGRAPH, not in the column beside it.
            "100% linen is a big asset but it gets lost in the information,
            up in the top right" -- reviewer, 2026-08-27. It was a bordered box
            competing with the colour dots for the same corner, which is where
            information goes to be ignored. On the image it is the first thing
            read, and it is the single strongest claim on the page. */}
        <span className="pointer-events-none absolute top-3 right-3 z-10 border border-border-strong bg-white/90 px-2.5 py-1 text-[11px] tracking-wide text-text backdrop-blur-sm">
          {FABRIC_BADGE}
        </span>
        {activeImage && (
          <Image
            src={activeImage}
            alt={view === "back" ? "Back view" : "Front view"}
            fill
            sizes={PREVIEW_SIZES}
            className="object-contain"
            priority
            draggable={false}
            onLoad={warmOnIdle}
          />
        )}
        {canSlide && (
          <>
            <button
              aria-label="Show front"
              onClick={() => setView("front")}
              /* before:-inset-1: 36px arrow, 44px tap target -- founder review 2026-11-11. */
              className={`absolute top-1/2 left-3 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-text shadow-[var(--shadow)] backdrop-blur-sm transition-opacity before:absolute before:-inset-1 before:content-[''] hover:bg-white ${
                view === "front" ? "pointer-events-none opacity-0" : "opacity-100"
              }`}
            >
              ‹
            </button>
            <button
              aria-label="Show back"
              onClick={() => setView("back")}
              className={`absolute top-1/2 right-3 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-text shadow-[var(--shadow)] backdrop-blur-sm transition-opacity before:absolute before:-inset-1 before:content-[''] hover:bg-white ${
                view === "back" ? "pointer-events-none opacity-0" : "opacity-100"
              }`}
            >
              ›
            </button>
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
              <span
                className={`h-1.5 w-1.5 rounded-full transition-colors ${
                  view === "front" ? "bg-white" : "bg-white/40"
                }`}
              />
              <span
                className={`h-1.5 w-1.5 rounded-full transition-colors ${
                  view === "back" ? "bg-white" : "bg-white/40"
                }`}
              />
            </div>
          </>
        )}
      </div>

      {/* What the picture is, and is not.

          Added 2026-08-25, because /how-it-works had been telling customers
          every combination was "a real photograph ... the actual piece you
          will receive". The images are generated, so that was a false claim,
          sitting where a customer decides to spend AED 389.

          DELIBERATELY SHORT, and deliberately carries NO remedy. A first
          version ended with "we remake or refund it" and the founder cut it:
          this is a made-to-order business where a returned piece cannot be
          resold, and advertising a refund at the moment of purchase invites
          the claim it describes. The remedy ladder belongs in /legal/terms,
          which is where it is, and where it is properly qualified. Say what
          the image is; do not make promises about what happens if it is
          wrong. */}
      {/* Name and price sit UNDER the photograph, in the catalog's own type,
          rather than as a pill floating on top of the garment. A label laid
          over the picture covers the thing the customer came to look at, and
          the price was only visible two steps later on the fit tab. */}
      {/* Below lg: ONE line, name left and price right, both in the display
          face (mockup, founder ok 2026-11-18). From lg: centred and stacked,
          as before. */}
      <div ref={nameRef} className="mt-2 flex items-baseline justify-between gap-3 lg:mt-3 lg:block lg:text-center">
        {/* The page h1 (it had none) -- founder review 2026-11-11. leading/tracking
            reset the global h1 rule so it looks exactly as the <p> did. */}
        {/* ⚠️ .design-name (globals.css, UNLAYERED) ON PURPOSE, not text-[15px].
            globals.css sets h1 { font-size: 32px } unlayered, and unlayered CSS
            beats Tailwind v4's layered utilities, so text-[15px] here was
            ignored and the name rendered at 32px (founder 2026-11-13: "too
            big"). It was an inline style until the size had to differ by
            breakpoint: 17px below lg, 15px from lg. */}
        <h1 className="design-name min-w-0 font-display leading-normal text-text">{itemName}</h1>
        <p className="shrink-0 font-display text-[17px] text-text lg:mt-1 lg:font-body lg:text-xs lg:text-text-2">AED {price}</p>
      </div>


      </div>

      {/* Controls column. min-w-0 so a wide control shrinks instead of
          overflowing the grid track -- the old layout had no such guard, which
          is how a button ended up rendering outside the column. */}
      {/* Below lg it is a flex column ONLY so `order` can move one block: the
          "Matching shayla included" card sits between the colours and the
          chips on desktop, and on a phone that pushed the chips off the first
          screen on both abayas. There it drops below Add to cart. From lg the
          column is a plain block again and `order` does nothing. */}
      <div ref={controlsRef} className="flex min-w-0 flex-col lg:block">
      {/* Preloads every other color/view so switching hits the browser
          cache instead of a fresh fetch -- same `sizes` as the visible
          image above so next/image resolves to the same cached URL.
          `priority` is what actually matters here: it skips next/image's
          IntersectionObserver-based lazy loading, which would otherwise
          never fire for an always-invisible 0x0 element. */}
      <div aria-hidden="true" className="pointer-events-none h-0 w-0 overflow-hidden opacity-0">
        {/* ⚠️ NOT `priority` ANY MORE (2026-11-17). `priority` puts every one of
            these in <head> as a high-priority preload, so a phone downloaded
            eight 1200px photos (all sleeve x length x front/back) BEFORE the
            one it was showing. Ads land here; the founder and her friends saw
            the page crawl on mobile and ~60% of ad clicks never arrived.
            They now start once the visible photo has loaded (`warm`), at low
            priority, ahead of the other colourways. */}
        {(warm ? preloadImages : [])
          .filter((src) => src !== activeImage)
          .map((src) => (
            <div key={src} className="relative h-1 w-1">
              <Image src={src} alt="" fill sizes={PREVIEW_SIZES} loading="eager" fetchPriority="low" />
            </div>
          ))}
        {/* Other colourways: no `priority`, and fetchPriority="low", so they
            queue behind the preview the customer is looking at instead of
            ahead of it. They still arrive well before anyone taps a swatch.
            `loading="eager"` is kept because next/image's lazy path uses an
            IntersectionObserver that never fires for a 0x0 element. */}
        {(warm ? deferredPreloads : [])
          .filter((src) => src !== activeImage && !preloadImages.includes(src))
          .map((src) => (
            <div key={src} className="relative h-1 w-1">
              <Image
                src={src}
                alt=""
                fill
                sizes={PREVIEW_SIZES}
                loading="eager"
                fetchPriority="low"
              />
            </div>
          ))}
      </div>

      <FabricColorPicker
        fabric={spec.fabric}
        color={spec.color}
        onFabricChange={handleFabricChange}
        onColorChange={handleColorChange}
        available={availableColors}
        soldOut={soldOutColors}
      />

      {includedCopy ? (
        <div className="order-4">
          <IncludedPieces pieces={included} color={spec.color} heading={includedCopy.heading} line={includedCopy.line} />
        </div>
      ) : null}

      {/* THE PRODUCT CHARACTERISTICS ARE ONE STEP, so they sit SIDE BY SIDE.
          Founder, 2026-08-27: "aligner les caractéristiques du produit car
          c'est la même étape" -- align them, because it is the same step.
          Sleeve and Length (or Leg width and Length) are two facets of one
          decision about the garment's shape; stacking them with a rule between
          each made two halves of one choice look like two separate steps.

          The separation she asked for goes AFTER this group, before Size,
          which is where the customer really does move on to something else.
          An earlier pass put a rule between every slider, which is the thing
          she was correcting. */}
      {params.length > 0 && (
        /* Side by side at EVERY width now. Below sm the two groups used to
           stack, which is what put Length a full scroll under the photo. Two
           groups of two chips fit a 360px phone at 44px tall each. */
        <div className="order-1 mt-2 grid grid-cols-2 gap-x-3 gap-y-3 lg:mt-5 lg:gap-x-5 lg:gap-y-4">
          {params.map((param) => {
            const current = spec.changes.find((c) => c.type === param.type);
            const activeIndex = Math.max(
              0,
              param.options.findIndex((o) => o.value === current?.value),
            );
            return (
              <div key={param.type}>
                {/* Native radios behind styled labels, not buttons with
                    role="radio". ARIA radiogroup semantics tell a screen
                    reader to press arrow keys; buttons do not implement them,
                    so the page was promising an interaction it did not honour.
                    The browser supplies arrow keys, roving focus, grouping and
                    the accessibility tree here for free, and none of it can
                    drift. Each label is a 44px-tall full-width target. */}
                <fieldset>
                  {/* Display face at full strength, matching Size and Make
                      it your way. These were text-text-3 uppercase 11px --
                      identical to the helper lines beneath them -- so a title
                      and its own explanation carried the same visual weight
                      and nothing announced a new step. */}
                  <legend className="font-display text-[15px] text-text">{param.name}</legend>
                  {/* max-w stops a two-option row stretching across the whole
                      control column on desktop. Full-width slabs read as
                      utilitarian; the brand wants restraint, and a option that
                      is 500px wide to say "Long" is neither. Phones keep the
                      full width, where it is the only way to hold a 44px
                      target. */}
                  <div
                    className="mt-1.5 grid gap-1.5"
                    style={{ gridTemplateColumns: `repeat(${param.options.length}, minmax(0, 1fr))` }}
                  >
                    {param.options.map((option, i) => {
                      const selected = i === activeIndex;
                      return (
                        <label
                          key={option.value}
                          className={`flex min-h-11 cursor-pointer items-center justify-center border px-1 py-2 text-center lg:px-2 text-xs transition-colors focus-within:ring-2 focus-within:ring-accent focus-within:ring-offset-1 lg:min-h-0 lg:py-1.5 lg:text-[11px] ${
                            selected
                              ? "border-text bg-text text-white"
                              : "border-border bg-white text-text-2 hover:border-border-strong hover:text-text"
                          }`}
                        >
                          <input
                            type="radio"
                            name={param.type}
                            value={option.value}
                            checked={selected}
                            onChange={() => setChange(param.type, option.value, param.labelFor(option.text))}
                            className="sr-only"
                          />
                          {option.text}
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              </div>
            );
          })}
        </div>
      )}

      {/* Everything below the sliders renders HERE, inside the controls
          column. The fit, the detail and the cart used to sit outside this
          grid, so on a desktop they fell underneath the PHOTOGRAPH while the
          sliders stayed in the right-hand column -- two halves of one decision
          in two different places. */}
      {stageAction ? (
        <div ref={stageEndRef} className="order-2">
          {stageAction}
        </div>
      ) : null}
      {/* The shade line used to sit here below lg. It now shares the footnote
          at the end of the page with the illustrative-images line (founder
          2026-11-20), and the lead time takes this place. */}
      {stageNote ? <div className="order-3">{stageNote}</div> : null}
      <div className="order-5">{primaryAction}</div>

      </div>
    </div>
  );
}

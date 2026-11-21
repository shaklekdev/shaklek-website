import { STEPS, STEPS_NOTE } from "@/data/homeContent";

/**
 * The concept: two steps -- what she does, then what we do.
 *
 * ⚠️ IT WAS THREE STEPS UNTIL 2026-09-16. "Add a detail" was folded away (it
 * is an optional field on the design page, not a stage of the process) and
 * step 02 absorbed the handover. If you are adding a step back, read the
 * comment above STEPS in homeContent.ts first -- the split into "hers" and
 * "ours" is the idea, and a third step breaks it whatever it says.
 *
 * ⚠️ AND THERE IS NO LEAD-TIME BLOCK UNDER THE STEPS ANY MORE. It said "Ready
 * in about 10 working days" and she took it off the homepage the same day --
 * her reasoning is in homeContent.ts where the block used to be. Do not
 * reinstate it here as a caption, a badge or a line under the note.
 *
 * The tailor's photograph has now been tried FOUR ways, and three were wrong:
 *
 *   1. A tall column beside the steps. On a phone it was 428px of image ahead
 *      of the words, so step one did not appear until y=854.
 *   2. A full-bleed background behind the whole section. It read as a second
 *      banner competing with the hero, which is not what this block is for.
 *   3. Beside the lead-time block, which was right until that block was
 *      removed and took the photo's other half with it.
 *
 * It now sits beside the STEPS, which is where it belonged once there were
 * only two of them: the list is short enough to share a row, and the making is
 * literally what step 02 describes. The phone failure in (1) is avoided by
 * ORDER, not by dropping it -- `order-last` puts the words first on a phone
 * and the photo underneath, short. Contained, half the width, never
 * full-bleed.
 */
export default function Concept() {
  return (
    // 2026-11-21 (founder): the words now sit ON the sewing-machine loop, in
    // black and white. CONTAINED in the page column (max-w-6xl), not
    // full-bleed, so it does not read as a second hero (see failure 2 above).
    <section id="how-it-works" className="mx-auto w-full max-w-6xl scroll-mt-24 px-6 pt-12 sm:pt-16">
      {/* Title OUTSIDE the video, like every other section title (founder). */}
      <h2 className="text-center">How it works</h2>
      <div className="relative mt-6 flex min-h-[460px] items-center justify-center overflow-hidden sm:mt-8 sm:min-h-[460px]">
        {/* Generated clip from the 2026-11-07 ad (ad1-sew-1.mp4, no text),
            re-encoded H.264 1.4 Mbps, 724x1268, ~0.9 MB. Black and white by
            CSS (grayscale), so the colour file stays usable elsewhere. Muted
            + playsInline so iOS autoplays; the poster shows while it loads. */}
        {/* WHOLE FRAME, hands included (a crop to the machine was tried and
            she preferred the hands, 2026-11-21). FILM LOOK instead of plain
            B&W ("enlever l'effet trop AI"): grayscale + contrast + a grain
            layer (SVG noise, no extra file). */}
        <video
          className="absolute inset-x-0 top-0 h-full w-full object-cover"
          style={{ filter: "grayscale(1) contrast(1.18) brightness(0.92)" }}
          src="/marketing/how-it-works-sewing.mp4"
          poster="/marketing/how-it-works-sewing-poster.jpg"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.22] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
          }}
        />
        <div className="absolute inset-0 bg-black/62" />
        <div className="relative w-full max-w-md px-6 py-12 text-white [text-shadow:0_1px_12px_rgba(0,0,0,0.6)]">
          <ol className="space-y-9">
            {STEPS.map((s) => (
              <li key={s.n}>
                {/* Number at the START of the line (founder 2026-11-21). */}
                <h3 className="flex items-baseline gap-3 text-white">
                  <span className="font-display text-[22px] text-gold">{s.n}</span>
                  <span className="font-display text-[22px] leading-snug sm:text-[26px]">{s.title}</span>
                </h3>
                <p className="mt-2 pl-10 text-[15px] leading-relaxed text-white">{s.body}</p>
              </li>
            ))}
          </ol>
          {/* STEPS_NOTE: see the history above; kept, same place. */}
          {STEPS_NOTE ? <p className="mt-8 pl-10 text-[13px] leading-relaxed text-white/85">{STEPS_NOTE}</p> : null}
        </div>
      </div>
    </section>
  );
}

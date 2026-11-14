import Image from "next/image";
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
    <section id="how-it-works" className="mx-auto w-full max-w-6xl scroll-mt-24 px-6 pt-12 sm:pt-16">
      {/* HOME RHYTHM (founder, 2026-11-13: uneven gaps "look amateur"): every
          home section opens with pt-12 / sm:pt-16 and nothing else adds bottom
          padding, so the gap between any two sections is identical; title to
          content is always 24px (mt-6 / mb-6 / pb-6). Keep it that way. */}

      <h2 className="text-lg text-text">How it works</h2>

      <div className="mt-6 grid items-center gap-8 sm:grid-cols-2 sm:gap-10">
        <div className="min-w-0">
          <ol className="space-y-6">
            {STEPS.map((s) => (
              <li key={s.n} className="flex gap-4">
                <span className="font-display shrink-0 text-lg text-gold">
                  {s.n}
                </span>
                <div className="min-w-0">
                  <h3
                    className={
                      s.emphasis
                        ? "font-display text-[18px] leading-snug text-text"
                        : "text-[15px] font-medium text-text"
                    }
                  >
                    {s.title}
                  </h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-text-2">
                    {s.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          {/* ⚠️ NO LONGER A FOOTNOTE, 2026-11-05. It was the asterisk's
              footnote for step 02's "we come to you", naming Dubai as the
              visit's scope. The founder pulled the at-home visit site-wide
              until she defines appointment slots (OPEN.md measuring-slots),
              step 02 lost its marker, and STEPS_NOTE is now just the delivery
              line. When the visit returns with slots, the marker and the
              city come back together, never one without the other. */}
          {STEPS_NOTE ? (
            <p className="mt-5 text-[12px] leading-relaxed text-text-3">
              {STEPS_NOTE}
            </p>
          ) : null}
        </div>

        {/* Words first on a phone, photo after and short. */}
        <div className="relative order-last h-[200px] w-full sm:h-full sm:min-h-[260px]">
          <Image
            src="/marketing/story-tailoring-v2.jpg"
            alt="Tailoring at Shaklek."
            fill
            sizes="(min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}

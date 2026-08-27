// The tailor's tech pack.
//
// Kept out of the route handler so it can be rendered and reviewed without a
// database and without touching production -- see scripts/render-techpack.mjs.
// CLAUDE.md forbids creating test orders against the live DB, and this is the
// document most in need of being looked at before it ships.
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import {
  comboKeyFromLabels,
  changesFromLabels,
  renderParamsForCategory,
} from "@/data/parameterSliders";
import { catalog } from "@/data/catalog";
import { colors } from "@/data/colors";
import { nearestSize, rowForSize, sizeLabel } from "@/data/sizeChart";
import { constructionFor, noteForOption } from "@/data/construction";
import { flatPath } from "@/data/flats";
import { parseMeasurements, FIELD_LABELS } from "@/lib/measurements";
import { fitNoteLabel } from "@/data/fitNotes";

export type SpecItem = {
  name: string;
  category: string | null;
  fabric: string | null;
  color: string | null;
  size: string | null;
  measurements: string | null;
  fitNotes: string[] | null;
  changes: string[] | null;
  freeformNotes: string | null;
};

// A4. The tech pack is read on a phone over WhatsApp far more often than it is
// printed, so type is set larger than a print document would carry and nothing
// depends on colour to be legible.
const PAGE = { size: "A4" as const, margin: 40 };
const INK = "#111";
const MUTED = "#777";
const RULE = "#ddd";

// Order items are one row per garment and store the catalog display name plus
// colour as plain text, not a slug reference. This re-derives the matching
// photos the same way the design page does: the per-combination photo first,
// then the plain colour photo, then the item's default pair.
//
// Resolving the combination matters -- without it a customer who ordered wide
// cropped trousers got a spec sheet showing the straight full-length photo,
// contradicting the cut printed right below it.
function catalogItemFor(item: SpecItem) {
  return catalog.find((c) => c.name === item.name) ?? null;
}

function imagesFor(item: SpecItem): { front?: string; back?: string; comboKey: string | null } {
  const catalogItem = catalogItemFor(item);
  if (!catalogItem) return { comboKey: null };
  const comboKey = comboKeyFromLabels(catalogItem.category, item.changes);
  const byCombo =
    item.color && comboKey ? catalogItem.comboImages?.[item.color]?.[comboKey] : undefined;
  const byColor = item.color ? catalogItem.colorImages?.[item.color] : undefined;
  return {
    front: byCombo?.front ?? byColor?.front ?? catalogItem.image,
    back: byCombo?.back ?? byColor?.back ?? catalogItem.backImage,
    comboKey,
  };
}

// The flat is looked up with the SAME comboKey as the photograph, so the
// drawing and the photo on one page cannot disagree about what was ordered.
// Flats carry no colourway -- one drawing serves all four colours.
function flatsFor(item: SpecItem, comboKey: string | null) {
  const catalogItem = catalogItemFor(item);
  if (!catalogItem || !comboKey) return {};
  return {
    front: flatPath(catalogItem.slug, comboKey, "front"),
    back: flatPath(catalogItem.slug, comboKey, "back"),
  };
}

function readPublicImage(publicPath: string | undefined): Buffer | null {
  if (!publicPath) return null;
  try {
    return fs.readFileSync(path.join(process.cwd(), "public", publicPath));
  } catch {
    return null;
  }
}

// One row per garment is how order_items is written (see the quantity note in
// planning/session-log.md), which is right for the database and wrong for the
// tailor: three identical shirts should be one instruction saying "cut 3", not
// the same page printed three times.
type Grouped = { item: SpecItem; qty: number; sig: string };

function groupIdentical(items: SpecItem[]): Grouped[] {
  const out: Grouped[] = [];
  for (const item of items) {
    const sig = JSON.stringify([
      item.name,
      item.category,
      item.fabric,
      item.color,
      item.size,
      item.measurements,
      item.changes,
      item.freeformNotes,
    ]);
    const hit = out.find((g) => g.sig === sig);
    if (hit) hit.qty += 1;
    else out.push({ item, qty: 1, sig });
  }
  return out;
}

export function buildPdf(
  order: {
    id: string;
    createdAt: Date;
    items: SpecItem[];
  },
  // Uncompressed output exists so scripts/test-techpack.mjs can read the text
  // back and assert on it. A tech pack that renders without error but prints
  // the wrong size numbers is the failure that costs a remake, and "it
  // produced bytes" does not catch it.
  opts: { compress?: boolean } = {},
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      ...PAGE,
      compress: opts.compress ?? true,
      // Metadata travels with the file and nobody sees it on screen, which is
      // exactly how a brand name gets reintroduced by accident. Pinned blank.
      info: { Title: `Technical pack ${order.id.slice(0, 8).toUpperCase()}`, Author: "", Subject: "", Keywords: "", Creator: "", Producer: "" },
    });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const left = doc.page.margins.left;
    const right = doc.page.width - doc.page.margins.right;
    const width = right - left;
    const bottom = doc.page.height - doc.page.margins.bottom;

    // The tailor gets what to make and which order it belongs to. Nothing else.
    //
    // No customer identity: no name, no email, no address. And, founder
    // decision 2026-08-24, no BRAND identity either -- no wordmark, no company
    // name, no "SHK-" on the reference, nothing naming who commissioned this.
    // The workshop makes the pieces; it is not being handed the label they
    // carry. A pack that is forwarded, subcontracted or simply left on a bench
    // cannot then be traced back, or used to advertise whose line it is.
    // scripts/test-techpack.mjs fails if any brand string reappears.
    //
    // The reference stays, because the tailor still has to be able to say
    // which order they mean. It is the order id's first 8 characters and
    // identifies the order to us without naming us.
    const ref = order.id.slice(0, 8).toUpperCase();
    const groups = groupIdentical(order.items);
    const totalGarments = order.items.length;

    // ---------------------------------------------------------- primitives

    const space = (h: number) => {
      if (doc.y + h > bottom) doc.addPage();
    };

    const rule = (color = RULE) => {
      doc.moveTo(left, doc.y).lineTo(right, doc.y).strokeColor(color).lineWidth(0.5).stroke();
      doc.y += 1;
    };

    // `needs` is the height of the block that will follow. Without it the
    // heading gets drawn at the bottom of a page and whatever follows is pushed
    // to the next one -- which stranded "CUSTOMER REQUEST" on one page and the
    // customer's actual words, alone, on the next.
    const section = (title: string, needs = 46) => {
      space(needs);
      doc.moveDown(0.7);
      doc
        .fontSize(8)
        .fillColor(MUTED)
        .font("Helvetica-Bold")
        .text(title.toUpperCase(), left, doc.y, { characterSpacing: 1.4 });
      doc.moveDown(0.25);
      rule();
      doc.moveDown(0.45);
      doc.font("Helvetica").fillColor(INK);
    };

    // Full-width small print. It ALWAYS draws from the left margin.
    //
    // Passing only `{ width }` uses whatever doc.x happens to be, and the
    // positioned draws above (measurement rows write at left + 118) leave it
    // there. The measurement caveat rendered at x=158 with width=515 on a
    // 595pt page, so ~78pt of every line was clipped off the right edge and it
    // read as "Apply the ho" / "where they disag". The text was correct in the
    // PDF the whole time -- only its origin was wrong.
    const para = (text: string, color = MUTED, size = 8.5) => {
      doc.font("Helvetica").fontSize(size).fillColor(color).text(text, left, doc.y, { width });
      doc.fillColor(INK);
    };

    const row = (label: string, value: string, emphasis = false) => {
      const labelW = 118;
      const valueW = width - labelW;
      doc.font("Helvetica").fontSize(emphasis ? 12 : 10.5);
      const h = Math.max(doc.heightOfString(value, { width: valueW }), 14);
      space(h + 6);
      const y = doc.y;
      doc.fontSize(8).fillColor(MUTED).font("Helvetica-Bold").text(label.toUpperCase(), left, y + 2, {
        width: labelW - 8,
      });
      doc
        .font(emphasis ? "Helvetica-Bold" : "Helvetica")
        .fontSize(emphasis ? 12 : 10.5)
        .fillColor(INK)
        .text(value, left + labelW, y, { width: valueW });
      doc.y = y + h + 5;
    };

    const bullets = (lines: string[]) => {
      doc.font("Helvetica").fontSize(10.5).fillColor(INK);
      for (const line of lines) {
        const h = Math.max(doc.heightOfString(line, { width: width - 14 }), 13);
        space(h + 4);
        const y = doc.y;
        doc.circle(left + 3, y + 5, 1.6).fillColor(INK).fill();
        doc.fillColor(INK).text(line, left + 14, y, { width: width - 14 });
        doc.y = Math.max(doc.y, y + h) + 3;
      }
    };

    // -------------------------------------------------------------- cover
    //
    // Skipped entirely for a single-spec order. Its index would list one item
    // and then that same item's page would repeat every word of it -- a whole
    // sheet the tailor has to turn past to reach the garment. The reference and
    // the no-identity note still have to reach them, so for a one-spec order
    // they move to the foot of the spec page instead. Multi-item orders keep
    // the cover, where an index of what to make actually earns its page.
    const singleSpec = groups.length === 1;

    if (!singleSpec) {
    doc
      .fontSize(8)
      .fillColor(MUTED)
      .font("Helvetica-Bold")
      .text("TECHNICAL PACK", { characterSpacing: 2.5 });
    doc.moveDown(0.15);
    doc.fontSize(9).fillColor(MUTED).font("Helvetica").text("ORDER REFERENCE", { characterSpacing: 2 });
    doc.moveDown(0.5);
    doc.fontSize(30).fillColor(INK).font("Helvetica-Bold").text(ref);
    doc.moveDown(0.2);
    doc
      .fontSize(10.5)
      .fillColor(MUTED)
      .font("Helvetica")
      .text(
        `${totalGarments} garment${totalGarments === 1 ? "" : "s"} · ${groups.length} spec${groups.length === 1 ? "" : "s"} · placed ${order.createdAt.toLocaleDateString("en-AE", { dateStyle: "medium" })}`,
      );
    doc.moveDown(0.5);
    doc.fontSize(9).fillColor("#999").text("Quote this reference on every message about this order.");
    doc.moveDown(0.6);
    rule("#ccc");

    section("What to make");
    for (const [i, g] of groups.entries()) {
      const { item, qty } = g;
      space(30);
      const y = doc.y;
      doc.font("Helvetica-Bold").fontSize(11).fillColor(INK).text(`${i + 1}.`, left, y, { width: 20 });
      doc.font("Helvetica-Bold").fontSize(11).text(item.name, left + 20, y, { width: width - 150 });
      doc
        .font("Helvetica-Bold")
        .fontSize(11)
        .fillColor(qty > 1 ? INK : MUTED)
        .text(qty > 1 ? `CUT ${qty}` : "CUT 1", right - 60, y, { width: 60, align: "right" });
      doc.font("Helvetica").fontSize(9.5).fillColor(MUTED);
      const line = [
        item.color,
        item.fabric,
        item.measurements ? "Tailored to measure" : item.size ? `Standard ${item.size}` : null,
        ...(item.changes ?? []),
      ]
        .filter(Boolean)
        .join(" · ");
      doc.text(line, left + 20, doc.y + 2, { width: width - 80 });
      doc.moveDown(0.6);
    }

    doc.moveDown(0.8);
    rule();
    doc.moveDown(0.4);
    para(
      "This document carries no customer name, contact or address by design. Send every question about this order back to whoever gave you this document, quoting the reference above.",
      "#999",
    );
    }

    // ------------------------------------------------------- per garment

    for (const [gi, { item, qty }] of groups.entries()) {
      // A single-spec pack starts on the document's own first page; there is
      // no cover to move past.
      if (!singleSpec || gi > 0) doc.addPage();
      const catalogItem = catalogItemFor(item);
      const category = item.category ?? catalogItem?.category ?? "";

      // Header
      const hy = doc.y;
      doc
        .fontSize(8)
        .fillColor(MUTED)
        .font("Helvetica-Bold")
        .text(singleSpec ? "TECHNICAL PACK" : `SPEC ${gi + 1} OF ${groups.length}`, left, hy, {
          characterSpacing: 1.4,
        });
      doc.fontSize(8).fillColor(MUTED).text(ref, left, hy, { width, align: "right" });
      doc.moveDown(0.35);
      doc.fontSize(19).fillColor(INK).font("Helvetica-Bold").text(item.name, left, doc.y, {
        width: width - 90,
      });
      const titleY = doc.y;
      doc
        .fontSize(19)
        .fillColor(INK)
        .text(`CUT ${qty}`, left, titleY - 24, { width, align: "right" });
      doc.y = titleY;
      doc.moveDown(0.15);
      doc.fontSize(9.5).fillColor(MUTED).font("Helvetica").text(category);
      doc.moveDown(0.5);
      rule("#ccc");
      doc.moveDown(0.5);

      // -- drawings ------------------------------------------------------
      const { front, back, comboKey } = imagesFor(item);
      const flats = flatsFor(item, comboKey);
      const cells = [
        { label: "Front — photograph", buf: readPublicImage(front) },
        { label: "Front — technical flat", buf: readPublicImage(flats.front) },
        { label: "Back — photograph", buf: readPublicImage(back) },
        { label: "Back — technical flat", buf: readPublicImage(flats.back) },
      ].filter((c) => c.buf);

      if (cells.length) {
        const gap = 10;
        const cw = (width - gap * (cells.length - 1)) / cells.length;
        // pdfkit scales by width alone, so the rendered height depends on each
        // image's aspect ratio -- openImage() (untyped in @types/pdfkit, real
        // at runtime) reads it before drawing so captions land under the image
        // instead of at a guessed offset.
        const openImage = doc as unknown as {
          openImage: (buf: Buffer) => { width: number; height: number };
        };
        const heights = cells.map((c) => (cw / openImage.openImage(c.buf!).width) * openImage.openImage(c.buf!).height);
        const tallest = Math.max(...heights);
        space(tallest + 26);
        const top = doc.y;
        cells.forEach((c, i) => {
          const x = left + i * (cw + gap);
          doc.image(c.buf!, x, top, { width: cw });
          doc
            .fontSize(7.5)
            .fillColor(MUTED)
            .font("Helvetica")
            .text(c.label, x, top + heights[i] + 4, { width: cw, align: "center" });
        });
        doc.y = top + tallest + 20;
        doc.fillColor(INK);
      } else {
        doc.fontSize(9).fillColor("#999").text("No reference photograph or flat available for this item.");
        doc.fillColor(INK);
      }

      // A flat that has not been generated yet would silently vanish from the
      // row above, and the tailor would never know a drawing was meant to be
      // there. Say so instead.
      // Checked per view, not just the front. Checking only the front meant a
      // missing BACK flat dropped out of the row above in silence -- the whole
      // point of this warning is that the tailor is never left guessing whether
      // a drawing was meant to be there.
      const missingViews = comboKey
        ? (["front", "back"] as const).filter((v) => !readPublicImage(flats[v]))
        : [];
      if (missingViews.length) {
        para(
          `No ${missingViews.join(" or ")} technical flat exists yet for this combination (${comboKey}). Cut from the photograph and the written cut below.`,
          "#a33",
        );
        doc.moveDown(0.3);
      }

      // -- bill of materials --------------------------------------------
      section("Bill of materials");
      // Fabric is stored lowercase ("linen") because designSpec's Fabric type
      // is a lowercase union. Printed raw it sat next to "Ivory" and read as a
      // typo on a document the workshop is meant to take seriously.
      if (item.fabric)
        row("Fabric", item.fabric.charAt(0).toUpperCase() + item.fabric.slice(1));
      if (item.color) {
        const hex = colors.find((c) => c.name === item.color)?.hex;
        const y = doc.y;
        doc.fontSize(8).fillColor(MUTED).font("Helvetica-Bold").text("COLOURWAY", left, y + 2, { width: 110 });
        if (hex) {
          doc.rect(left + 118, y, 26, 14).fillColor(hex).fill();
          doc.rect(left + 118, y, 26, 14).strokeColor("#999").lineWidth(0.5).stroke();
        }
        doc
          .font("Helvetica")
          .fontSize(10.5)
          .fillColor(INK)
          .text(`${item.color}${hex ? `   ${hex}` : ""}`, left + 152, y + 1, { width: width - 152 });
        doc.y = y + 20;
      }

      // -- measurements --------------------------------------------------
      section("Measurements");
      const fields = item.measurements ? parseMeasurements(item.measurements) : undefined;
      // rowForSize, not a direct match on the letter: trousers are ordered as
      // "38" and tops as "M", and orders placed before trousers were numbered
      // still carry letters. All three have to resolve to the same row, or the
      // tailor gets a size with no body measurements under it.
      const chartRow = rowForSize(item.size);

      if (fields) {
        doc.font("Helvetica-Bold").fontSize(11).fillColor(INK).text("TAILORED TO MEASURE");
        doc.moveDown(0.3);
        const labelW = 118;
        for (const f of FIELD_LABELS) {
          const v = fields[f.key];
          if (!v) continue;
          const y = doc.y;
          doc.font("Helvetica").fontSize(10).fillColor(MUTED).text(f.label, left, y, { width: labelW });
          doc.font("Helvetica-Bold").fontSize(12).fillColor(INK).text(`${v} cm`, left + labelW, y - 1);
          doc.y = y + 17;
        }
        const bust = Number(fields.bust);
        if (Number.isFinite(bust) && bust > 0) {
          const near = nearestSize(bust);
          doc.moveDown(0.2);
          doc
            .font("Helvetica")
            .fontSize(9)
            .fillColor(MUTED)
            .text(
              `Closest standard size, for cross-check only: ${sizeLabel(category, near)} (bust ${near.bust}cm). Cut to the numbers above, not to this size.`,
              left,
              doc.y,
              { width },
            );
        }
        if (fields.notes) {
          doc.moveDown(0.35);
          doc
            .font("Helvetica")
            .fontSize(10.5)
            .fillColor(INK)
            .text(`Customer's fit note: ${fields.notes}`, left, doc.y, { width });
        }
      } else if (chartRow) {
        // The label the customer actually chose -- "38" on a trouser, "M" on a
        // shirt. The letter is kept alongside for a numbered size so the
        // workshop can tie it back to the alpha ladder it may already work in;
        // the EU/UK/US row below carries the rest.
        doc
          .font("Helvetica-Bold")
          .fontSize(11)
          .fillColor(INK)
          .text(
            `STANDARD SIZE ${sizeLabel(category, chartRow)}` +
              (sizeLabel(category, chartRow) !== chartRow.size ? ` (${chartRow.size})` : ""),
          );
        doc.moveDown(0.3);
        // Printing the letter alone was the weakest line on the old spec sheet:
        // it assumed the tailor already knows what Shaklek's M is. The numbers
        // have existed in sizeChart.ts all along.
        const cols: [string, string][] = [
          ["Bust", `${chartRow.bust} cm`],
          ["Waist", `${chartRow.waist} cm`],
          ["Hip", `${chartRow.hip} cm`],
          ["EU / UK / US", `${chartRow.eu} / ${chartRow.uk} / ${chartRow.us}`],
        ];
        for (const [k, v] of cols) {
          const y = doc.y;
          doc.font("Helvetica").fontSize(10).fillColor(MUTED).text(k, left, y, { width: 118 });
          doc.font("Helvetica-Bold").fontSize(12).fillColor(INK).text(v, left + 118, y - 1);
          doc.y = y + 17;
        }
      } else {
        doc.font("Helvetica").fontSize(10.5).fillColor("#a33").text("No size or measurements recorded on this order — do not cut until this has been confirmed with whoever sent it.");
        doc.fillColor(INK);
      }

      // The customer's own answer to "anything usually wrong with this size?".
      //
      // PRINTED AS A REPORT, NOT AN INSTRUCTION, and the wording of the
      // heading is the load-bearing part. She is describing a habit across
      // clothes she already owns; she has not measured anything. Turning that
      // into "+2cm on the sleeve" here would invent a tolerance Shaklek has no
      // house standard for -- the same thing this document already refuses to
      // do for seam allowance and stitch density. The workshop decides the
      // amount; we only say what she told us.
      const fitLabels = (item.fitNotes ?? [])
        .map((id) => fitNoteLabel(category, id))
        .filter((label): label is string => Boolean(label));
      if (fitLabels.length > 0) {
        // EVERY draw here passes `left` explicitly. The block above this one
        // writes its values at left + 118, and pdfkit keeps doc.x there -- so
        // `{ width }` alone would set a 515pt column starting at x=158 on a
        // 595pt page and clip ~78pt off the right of every line. That is the
        // exact bug documented on `para` below, and it caught this block too:
        // the caveat rendered as "Adjust from the standard block by" with the
        // rest of the sentence off the page. Use para(), or pass left.
        doc.moveDown(0.45);
        doc
          .font("Helvetica-Bold")
          .fontSize(10)
          .fillColor(INK)
          .text("HOW SHE LIKES IT TO FIT", left, doc.y, { width });
        doc.moveDown(0.15);
        para(
          "The customer's own preference, not a measurement. Adjust by your own judgement -- no amount is specified because Shaklek has no house tolerance for these.",
          MUTED,
          9,
        );
        doc.moveDown(0.25);
        for (const label of fitLabels) {
          doc
            .font("Helvetica-Bold")
            .fontSize(11)
            .fillColor(INK)
            .text(`•  ${label}`, left, doc.y, { width });
        }
      }

      doc.moveDown(0.3);
      // The provenance half only applies when a standard size was ordered. On a
      // tailored order the numbers came off the customer's own body, so a
      // caveat about published market charts is small print about something
      // that is not on the page.
      para(
        fields
          ? "These are BODY measurements, taken from the customer — the body the garment must fit, not finished garment measurements. Apply the house block and ease."
          : "These are BODY measurements — the body the garment must fit, not finished garment measurements. Apply the house block and ease. The figures are consolidated from published UAE market charts, not measured from these patterns; where they disagree with the workshop's own block, the block wins — please say so when you return this page.",
      );

      // -- cut and construction ------------------------------------------
      const typed = catalogItem
        ? changesFromLabels(category, item.changes, catalogItem.defaultChanges)
        : [];
      const renderTypes = new Set(renderParamsForCategory(category).map((p) => p.type));
      const cutNotes = typed
        .filter((c) => renderTypes.has(c.type))
        .map((c) => noteForOption(category, c.type, c.value))
        .filter((n): n is string => !!n);
      const premiumNotes = typed
        .filter((c) => !renderTypes.has(c.type))
        .map((c) => noteForOption(category, c.type, c.value))
        .filter((n): n is string => !!n);

      if (cutNotes.length) {
        section("Cut as ordered");
        bullets(cutNotes);
      }

      const construction = catalogItem ? constructionFor(catalogItem.slug) : null;
      if (construction || premiumNotes.length) {
        section("Construction");
        if (construction) {
          doc
            .font("Helvetica-Bold")
            .fontSize(10.5)
            .fillColor(INK)
            .text(construction.silhouette, left, doc.y, { width });
          doc.moveDown(0.35);
          bullets(construction.details.map((d) => (d.view ? `${d.text} (${d.view})` : d.text)));
        }
        if (premiumNotes.length) {
          doc.moveDown(0.25);
          bullets(premiumNotes);
        }
      }

      // Always shown, even with nothing in it. The field is optional, so an
      // empty one used to render as no section at all -- and then there is no
      // way to tell "the customer asked for nothing" from "the pack dropped
      // it". Founder hit exactly that ambiguity on 2026-08-24. This is not the
      // same as the ruled blanks that were removed: those asked the workshop
      // for data Shaklek does not hold, where this reports a fact about the
      // order.
      {
        const note = item.freeformNotes?.trim();
        const noteHeight = note
          ? doc.font("Helvetica").fontSize(11).heightOfString(note, { width: width - 20 }) + 16
          : 26;
        section("Customer request", noteHeight + 60);
        const y = doc.y;
        if (note) {
          doc.rect(left, y, width, noteHeight).fillColor("#f6f3ee").fill();
          doc.font("Helvetica").fontSize(11).fillColor(INK).text(note, left + 10, y + 8, {
            width: width - 20,
          });
        } else {
          doc
            .font("Helvetica")
            .fontSize(10.5)
            .fillColor(MUTED)
            .text("None — the customer added no special request to this piece.", left, y, { width });
          doc.fillColor(INK);
        }
        doc.y = y + noteHeight + 4;
      }

    }

    // The two lines the cover used to carry. Without a cover the tailor would
    // otherwise have no instruction about what to quote or where to send a
    // question, and no statement that the missing customer details are missing
    // on purpose rather than by mistake.
    if (singleSpec) {
      doc.moveDown(1);
      space(46);
      rule();
      doc.moveDown(0.4);
      para(
        `Quote reference ${ref} on every message about this order. This document carries no customer name, contact or address by design. Send every question back to whoever gave it to you.`,
        "#999",
      );
    }

    doc.end();
  });
}


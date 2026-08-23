import { NextRequest, NextResponse } from "next/server";
import { getVerifiedEmailLower } from "@/lib/authEmail";
import { isUuid } from "@/lib/requestGuards";
import { eq } from "drizzle-orm";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { getDb, schema } from "@/db/client";
import { comboKeyFromLabels } from "@/data/parameterSliders";
import { catalog } from "@/data/catalog";

const STAFF_EMAILS = (process.env.STAFF_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

type SpecItem = {
  name: string;
  category: string | null;
  fabric: string | null;
  color: string | null;
  size: string | null;
  measurements: string | null;
  changes: string[] | null;
  freeformNotes: string | null;
};

// Order items store the catalog display name + color as plain text, not a
// slug reference, so this re-derives the matching front/back photos the
// same way the design page does: the per-combination photo first, then the
// plain colour photo, then the item's default pair.
//
// Resolving the combination matters -- without it a customer who ordered
// wide cropped trousers got a spec sheet showing the straight full-length
// photo, contradicting the "Customization:" line printed right below it.
function imagesFor(item: SpecItem): { front?: string; back?: string } {
  const catalogItem = catalog.find((c) => c.name === item.name);
  if (!catalogItem) return {};
  const comboKey = comboKeyFromLabels(catalogItem.category, item.changes);
  const byCombo =
    item.color && comboKey ? catalogItem.comboImages?.[item.color]?.[comboKey] : undefined;
  const byColor = item.color ? catalogItem.colorImages?.[item.color] : undefined;
  return {
    front: byCombo?.front ?? byColor?.front ?? catalogItem.image,
    back: byCombo?.back ?? byColor?.back ?? catalogItem.backImage,
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

function buildPdf(order: {
  id: string;
  createdAt: Date;
  items: SpecItem[];
}): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // The tailor gets what to make and which order it belongs to. Nothing
    // else. No name, no email, no address -- the customer's identity is
    // Shaklek's, and this PDF leaves the building over WhatsApp.
    const ref = `SHK-${order.id.slice(0, 8).toUpperCase()}`;

    doc.fontSize(9).fillColor("#888").text("SHAKLEK", { characterSpacing: 2 });
    doc.moveDown(0.2);
    doc.fontSize(22).fillColor("#000").text(ref);
    doc.moveDown(0.15);
    doc
      .fontSize(10)
      .fillColor("#666")
      .text(
        `${order.items.length} item${order.items.length === 1 ? "" : "s"} · placed ${order.createdAt.toLocaleDateString("en-AE", { dateStyle: "medium" })}`,
      );
    doc.moveDown(0.6);
    doc
      .fontSize(9)
      .fillColor("#999")
      .text("Quote this reference on every message about this order.");
    doc.fillColor("#000");
    doc.moveDown(0.5);
    doc
      .moveTo(doc.page.margins.left, doc.y)
      .lineTo(doc.page.width - doc.page.margins.right, doc.y)
      .strokeColor("#ddd")
      .stroke();

    order.items.forEach((item, i) => {
      if (i > 0) doc.addPage();
      else doc.moveDown(1.2);

      doc.moveDown(0.8);
      doc.fontSize(9).fillColor("#888").text(`ITEM ${i + 1} OF ${order.items.length}`, { characterSpacing: 1 });
      doc.fontSize(16).fillColor("#000").text(item.name);
      doc.moveDown(0.5);

      const { front, back } = imagesFor(item);
      const frontBuf = readPublicImage(front);
      const backBuf = readPublicImage(back);
      const imageTop = doc.y;
      const imageWidth = 220;

      // pdfkit scales by width alone, so the real rendered height depends
      // on each photo's aspect ratio -- openImage() (untyped in
      // @types/pdfkit, but real at runtime) reads that before drawing, so
      // the "Front"/"Back" captions land right under the actual image
      // instead of at a guessed fixed offset.
      const openImage = doc as unknown as {
        openImage: (buf: Buffer) => { width: number; height: number };
      };
      const scaledHeight = (buf: Buffer) => {
        const { width, height } = openImage.openImage(buf);
        return (imageWidth / width) * height;
      };

      let tallest = 0;
      if (frontBuf) {
        const h = scaledHeight(frontBuf);
        tallest = Math.max(tallest, h);
        doc.image(frontBuf, doc.page.margins.left, imageTop, { width: imageWidth });
        doc
          .fontSize(9)
          .fillColor("#666")
          .text("Front", doc.page.margins.left, imageTop + h + 4, { width: imageWidth, align: "center" });
        doc.fillColor("#000");
      }
      if (backBuf) {
        const h = scaledHeight(backBuf);
        tallest = Math.max(tallest, h);
        const x = doc.page.margins.left + imageWidth + 30;
        doc.image(backBuf, x, imageTop, { width: imageWidth });
        doc
          .fontSize(9)
          .fillColor("#666")
          .text("Back", x, imageTop + h + 4, { width: imageWidth, align: "center" });
        doc.fillColor("#000");
      }
      if (frontBuf || backBuf) {
        doc.y = imageTop + tallest + 24;
      }

      // Label/value rows rather than a run of "Key: value" lines -- the
      // tailor is reading this on a phone, and the cut and the measurements
      // are the two things that must not be skimmed past.
      const row = (label: string, value: string, emphasis = false) => {
        const left = doc.page.margins.left;
        const labelW = 110;
        const y = doc.y;
        doc.fontSize(9).fillColor("#888").text(label.toUpperCase(), left, y + 2, { width: labelW });
        doc
          .fontSize(emphasis ? 13 : 11)
          .fillColor("#000")
          .text(value, left + labelW, y, {
            width: doc.page.width - doc.page.margins.right - left - labelW,
          });
        doc.moveDown(0.45);
      };

      if (item.fabric) row("Fabric", item.fabric);
      if (item.color) row("Colour", item.color);
      if (item.changes && item.changes.length > 0) row("Cut", item.changes.join(" · "), true);
      if (item.measurements) {
        row("Measurements", item.measurements, true);
      } else if (item.size) {
        row("Size", `Standard ${item.size}`, true);
      }
      if (item.size && item.measurements) row("Nearest size", item.size);
      if (item.freeformNotes) row("Customer request", item.freeformNotes, true);
      if (item.category) row("Category", item.category);
      if (!frontBuf && !backBuf) {
        doc.moveDown(0.5).fontSize(9).fillColor("#999").text("No reference photo available for this item.");
        doc.fillColor("#000");
      }
    });

    doc.end();
  });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const email = await getVerifiedEmailLower();
  if (!email || !STAFF_EMAILS.includes(email)) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }

  const { id } = await params;
  // A non-uuid id makes Postgres throw a cast error, surfacing as a 500.
  if (!isUuid(id)) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const rows = await db
    .select()
    .from(schema.orders)
    .innerJoin(schema.customers, eq(schema.orders.customerId, schema.customers.id))
    .where(eq(schema.orders.id, id));

  const row = rows[0];
  if (!row) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const items = await db
    .select()
    .from(schema.orderItems)
    .where(eq(schema.orderItems.orderId, id));

  const pdf = await buildPdf({
    id: row.orders.id,
    createdAt: row.orders.createdAt,
    items,
  });

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="shaklek-spec-${id.slice(0, 8)}.pdf"`,
    },
  });
}

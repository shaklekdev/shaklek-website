import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
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
  customerEmail: string;
  items: SpecItem[];
}): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(18).text("Shaklek — Tailor Spec Sheet", { align: "left" });
    doc.moveDown(0.3);
    doc
      .fontSize(10)
      .fillColor("#666")
      .text(`Order ${order.id}`)
      .text(`Placed ${order.createdAt.toLocaleDateString("en-AE", { dateStyle: "medium" })}`)
      .text(`Customer ${order.customerEmail}`);
    doc.fillColor("#000");

    order.items.forEach((item, i) => {
      if (i > 0) doc.addPage();
      else doc.moveDown(1.2);

      doc.fontSize(16).text(`${i + 1}. ${item.name}`);
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

      doc.fontSize(11);
      if (item.category) doc.text(`Category: ${item.category}`);
      if (item.fabric) doc.text(`Fabric: ${item.fabric}`);
      if (item.color) doc.text(`Color: ${item.color}`);
      if (item.size) doc.text(`Size: ${item.size}`);
      if (item.measurements) doc.text(`Measurements: ${item.measurements}`);
      if (item.changes && item.changes.length > 0) {
        doc.text(`Customization: ${item.changes.join(", ")}`);
      }
      if (item.freeformNotes) doc.text(`Notes: ${item.freeformNotes}`);
      if (!frontBuf && !backBuf) {
        doc.moveDown(0.5).fontSize(9).fillColor("#999").text("No reference photo available for this item.");
        doc.fillColor("#000");
      }
    });

    doc.end();
  });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase();
  if (!email || !STAFF_EMAILS.includes(email)) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }

  const { id } = await params;

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
    customerEmail: row.customers.email,
    items,
  });

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="shaklek-spec-${id.slice(0, 8)}.pdf"`,
    },
  });
}

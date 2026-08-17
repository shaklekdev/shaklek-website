import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import PDFDocument from "pdfkit";
import { getDb, schema } from "@/db/client";

const STAFF_EMAILS = (process.env.STAFF_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

function buildPdf(order: {
  id: string;
  createdAt: Date;
  customerEmail: string;
  items: {
    name: string;
    category: string | null;
    fabric: string | null;
    color: string | null;
    size: string | null;
    measurements: string | null;
    changes: string[] | null;
    freeformNotes: string | null;
  }[];
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
      doc.moveDown(1.2);
      doc.fontSize(14).text(`${i + 1}. ${item.name}`);
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
      doc.moveTo(doc.x, doc.y + 8).lineTo(545, doc.y + 8).strokeColor("#ddd").stroke();
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
      "Content-Disposition": `inline; filename="shaklek-spec-${id.slice(0, 8)}.pdf"`,
    },
  });
}

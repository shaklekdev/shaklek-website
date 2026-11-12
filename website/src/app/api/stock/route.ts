import { NextResponse } from "next/server";
import { getDb } from "@/db/client";
import { availableMetresByColor } from "@/lib/fabricStock";
import { METRES_PER_GARMENT } from "@/data/fabricStock";

export const dynamic = "force-dynamic";

// Public, read-only: for each colour, the garment categories that no longer
// fit in the linen left. Booleans only -- the metre counts stay private.
// The product page greys those colours out; /api/orders enforces the same
// rule on its own, so this is a courtesy, not the control. Cached 20s at the
// CDN so anonymous traffic cannot queue on the checkout's DB connection.
export async function GET() {
  const db = getDb();
  if (!db) return NextResponse.json({ soldOut: {} });
  try {
    const available = await availableMetresByColor(db);
    const soldOut: Record<string, string[]> = {};
    for (const [color, metres] of Object.entries(available)) {
      const cats = Object.entries(METRES_PER_GARMENT)
        .filter(([, need]) => need > metres + 1e-9)
        .map(([cat]) => cat);
      if (cats.length) soldOut[color] = cats;
    }
    return NextResponse.json({ soldOut }, { headers: { "Cache-Control": "public, s-maxage=20, stale-while-revalidate=20" } });
  } catch (err) {
    console.error("[stock] failed to compute stock:", err);
    // Fail open on DISPLAY only; checkout still refuses on its own.
    return NextResponse.json({ soldOut: {} });
  }
}

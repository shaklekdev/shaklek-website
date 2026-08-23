import { NextRequest, NextResponse } from "next/server";
import { parseCustomizeMessage } from "@/lib/customizeParser";
import type { DesignSpec } from "@/data/designSpec";
import { rateLimit } from "@/lib/rateLimit";
import { rejectCrossOrigin, rejectOversizedBody } from "@/lib/requestGuards";

// Rule-based stand-in for real NLP (see customizeParser.ts). Same route
// shape either way — a real Claude/Bedrock-backed parser drops in here
// without the CustomizeChat component or its callers needing to change.
// Public and unauthenticated by design (the customizer chat is pre-signup),
// so it needs its own limits: the parser runs many substring scans over the
// message, and nothing capped the message length.
const MAX_MESSAGE = 2000;

export async function POST(req: NextRequest) {
  const crossOrigin = rejectCrossOrigin(req);
  if (crossOrigin) return crossOrigin;
  const oversized = rejectOversizedBody(req, 64_000);
  if (oversized) return oversized;

  const limited = rateLimit(req, "customize", 60, 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSeconds) } },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Malformed request" }, { status: 400 });
  }
  const { message, spec } = (body ?? {}) as { message: unknown; spec: DesignSpec };

  if (typeof message !== "string" || !message || !spec || typeof spec !== "object") {
    return NextResponse.json({ error: "message and spec are required" }, { status: 400 });
  }
  if (message.length > MAX_MESSAGE) {
    return NextResponse.json({ error: "Message too long" }, { status: 413 });
  }

  const result = parseCustomizeMessage(message, spec);
  return NextResponse.json(result);
}

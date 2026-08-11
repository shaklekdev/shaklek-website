import { NextRequest, NextResponse } from "next/server";
import { parseCustomizeMessage } from "@/lib/customizeParser";
import type { DesignSpec } from "@/data/designSpec";

// Rule-based stand-in for real NLP (see customizeParser.ts). Same route
// shape either way — a real Claude/Bedrock-backed parser drops in here
// without the CustomizeChat component or its callers needing to change.
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { message, spec } = body as { message: string; spec: DesignSpec };

  if (!message || !spec) {
    return NextResponse.json({ error: "message and spec are required" }, { status: 400 });
  }

  const result = parseCustomizeMessage(message, spec);
  return NextResponse.json(result);
}

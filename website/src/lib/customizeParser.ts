import { colors } from "@/data/colors";
import type { DesignSpec, SilhouetteChange } from "@/data/designSpec";

// Rule-based stand-in for the real thing. ai-integration-todo.md calls for
// actual NLP here (Phase 2, evaluated against real Phase 1 request data) —
// this exists so the customize flow is real and usable today, with an
// obvious seam to swap in a Claude/Bedrock call later without changing
// anything that calls parseCustomizeMessage().

const OTHER_MATERIALS = [
  "silk",
  "leather",
  "denim",
  "wool",
  "velvet",
  "satin",
  "suede",
  "chiffon",
  "polyester",
  "nylon",
];

const LOGO_TERMS = ["logo", "brand name", "monogram", "embroidered logo", "branded"];
const LINING_TERMS = ["lining", "lined", "double layer", "two layers", "double-layer"];

export type ParseResult = {
  spec: DesignSpec;
  reply: string;
};

function detectChange(lower: string): SilhouetteChange | null {
  if (lower.includes("slit")) {
    return { type: "hem_slit", value: "added", label: "Side slits" };
  }
  if (lower.includes("pocket")) {
    return { type: "pocket", value: "added", label: "Patch pocket" };
  }
  if (lower.includes("button") || lower.includes("cuff")) {
    return { type: "cuff_detail", value: "added", label: "Cuff buttons" };
  }
  if (lower.includes("short") && lower.includes("sleeve")) {
    return { type: "sleeve_length", value: "short", label: "Short sleeve" };
  }
  if (lower.includes("long") && lower.includes("sleeve")) {
    return { type: "sleeve_length", value: "long", label: "Long sleeve" };
  }
  if (lower.includes("loose") || lower.includes("relaxed") || lower.includes("oversized")) {
    return { type: "fit", value: "relaxed", label: "Relaxed fit" };
  }
  if (lower.includes("fitted") || lower.includes("tailored") || lower.includes("slim")) {
    return { type: "fit", value: "fitted", label: "Fitted through the waist" };
  }
  if (lower.includes("neckline") || lower.includes("collar")) {
    return { type: "neckline", value: "adjusted", label: "Adjusted neckline" };
  }
  return null;
}

function detectColor(lower: string): string | null {
  const match = colors.find((c) => lower.includes(c.name.toLowerCase()));
  return match ? match.name : null;
}

export function parseCustomizeMessage(message: string, spec: DesignSpec): ParseResult {
  const lower = message.toLowerCase();
  const nextSpec: DesignSpec = {
    ...spec,
    changes: [...spec.changes],
    constraints: { ...spec.constraints, flagNotes: [...spec.constraints.flagNotes] },
  };

  const replies: string[] = [];

  // Constraint checks first — these can veto a change regardless of what it is.
  const mentionedMaterial = OTHER_MATERIALS.find((m) => lower.includes(m));
  if (mentionedMaterial) {
    nextSpec.constraints.singleFabric = false;
    const note = `"${mentionedMaterial}" would be a second material alongside ${spec.fabric} — one fabric only.`;
    nextSpec.constraints.flagNotes.push(note);
    replies.push(
      `I can't add ${mentionedMaterial} on top of the ${spec.fabric} — Shaklek pieces are single-material so a tailor can actually produce them. Want to swap the whole piece to ${mentionedMaterial === "linen" ? "linen" : "a different single fabric"} instead, or keep ${spec.fabric} and adjust something else?`,
    );
  }
  if (LOGO_TERMS.some((t) => lower.includes(t))) {
    nextSpec.constraints.noLogo = false;
    nextSpec.constraints.flagNotes.push("Request mentions a logo or brand marking — not producible.");
    replies.push("No logos or branded elements, sorry — that's a hard rule here, not a style choice.");
  }
  if (LINING_TERMS.some((t) => lower.includes(t))) {
    nextSpec.constraints.singleLayer = false;
    nextSpec.constraints.flagNotes.push("Request implies a lining or second layer — single layer only.");
    replies.push("Can't add a lining or second layer — every piece is single-layer construction. I can still adjust drape or fit within that.");
  }

  nextSpec.constraints.passed =
    nextSpec.constraints.singleFabric && nextSpec.constraints.singleLayer && nextSpec.constraints.noLogo;

  // Structural change + color detection only applies cleanly when nothing was vetoed above.
  const change = detectChange(lower);
  if (change && !nextSpec.changes.some((c) => c.type === change.type)) {
    nextSpec.changes.push(change);
    replies.push(`${change.label} — noted, added to the spec.`);
  }

  const color = detectColor(lower);
  if (color && color !== spec.color) {
    nextSpec.color = color;
    replies.push(`Switched to ${color}.`);
  }

  if (replies.length === 0) {
    replies.push(
      "Got it — I've kept that as a note for the stylist reviewing this order, since it's outside what I can automatically apply yet.",
    );
    nextSpec.freeformNotes = nextSpec.freeformNotes
      ? `${nextSpec.freeformNotes}\n${message}`
      : message;
  }

  return { spec: nextSpec, reply: replies.join(" ") };
}

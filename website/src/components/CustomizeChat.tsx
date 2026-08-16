"use client";

import { useRef, useState } from "react";
import { colors } from "@/data/colors";
import { PASSING_CONSTRAINTS, type DesignSpec, type Fabric } from "@/data/designSpec";
import FabricColorPicker from "@/components/FabricColorPicker";

type ChatMessage = { role: "ai" | "user"; text: string };

const DEFAULT_SUGGESTIONS = [
  "Add side slits",
  "Add a front pocket",
  "Shorter sleeves",
  "Looser through the waist",
];

function greetingFor(spec: DesignSpec): string {
  const subject =
    spec.base.kind === "catalog"
      ? `your ${spec.color.toLowerCase()} ${spec.fabric} ${spec.garmentType.toLowerCase()}`
      : "what you uploaded";
  return `Here's ${subject}. Tell me what you'd like to change — try "add side slits" or "shorter sleeves" — or just continue as-is.`;
}

export default function CustomizeChat({
  spec,
  onSpecChange,
  itemName,
  previewImage,
  previewBackImage,
  previewGradient,
  suggestions = DEFAULT_SUGGESTIONS,
}: {
  spec: DesignSpec;
  onSpecChange: (spec: DesignSpec) => void;
  itemName: string;
  previewImage?: string | null;
  previewBackImage?: string | null;
  previewGradient: [string, string];
  suggestions?: string[];
}) {
  function handleFabricChange(fabric: Fabric) {
    onSpecChange({ ...spec, fabric });
  }
  function handleColorChange(color: string) {
    onSpecChange({ ...spec, color });
  }
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "ai", text: greetingFor(spec) },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [view, setView] = useState<"front" | "back">("front");
  const activeImage = view === "back" && previewBackImage ? previewBackImage : previewImage;
  const canSlide = Boolean(previewBackImage);
  const touchStartX = useRef(0);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }
  function handleTouchEnd(e: React.TouchEvent) {
    if (!canSlide) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) < 40) return;
    setView(delta < 0 ? "back" : "front");
  }

  const colorHex = colors.find((c) => c.name === spec.color)?.hex ?? previewGradient[0];

  // A flagged constraint otherwise never clears — nothing else in this stub
  // resets singleFabric/singleLayer/noLogo back to true, which would strand
  // a customer at a permanently disabled Continue button even after they've
  // clearly moved on to a different request.
  function clearFlag() {
    onSpecChange({ ...spec, constraints: { ...PASSING_CONSTRAINTS } });
    setMessages((m) => [
      ...m,
      { role: "ai", text: "Cleared — that request won't be included. Continue whenever you're ready." },
    ]);
  }

  async function sendMessage(text: string) {
    const message = text.trim();
    if (!message || sending) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text: message }]);
    setSending(true);
    try {
      const res = await fetch("/api/customize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, spec }),
      });
      const data = await res.json();
      if (res.ok) {
        onSpecChange(data.spec);
        setMessages((m) => [...m, { role: "ai", text: data.reply }]);
      } else {
        setMessages((m) => [
          ...m,
          { role: "ai", text: "Couldn't process that just now — try again in a moment." },
        ]);
      }
    } catch {
      setMessages((m) => [
        ...m,
        { role: "ai", text: "Couldn't reach the customize service — try again in a moment." },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div>
      {/* Preview */}
      <div
        className="relative aspect-[3/4] w-full touch-pan-y select-none overflow-hidden rounded-shaklek border border-border"
        style={
          activeImage
            ? undefined
            : { background: `linear-gradient(135deg, ${colorHex}, ${previewGradient[1]})` }
        }
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {activeImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={activeImage}
            alt={view === "back" ? "Back view" : "Your uploaded reference"}
            className="h-full w-full object-cover"
            draggable={false}
          />
        )}
        <span className="absolute top-4 right-4 rounded-full bg-accent px-3 py-1 text-[10px] font-medium tracking-wide text-white">
          LIVE PREVIEW
        </span>
        <span className="absolute top-4 left-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-medium tracking-wide text-text backdrop-blur-sm">
          {itemName}
        </span>

        {canSlide && (
          <>
            <button
              aria-label="Show front"
              onClick={() => setView("front")}
              className={`absolute top-1/2 left-3 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-text shadow-[var(--shadow)] backdrop-blur-sm transition-opacity hover:bg-white ${
                view === "front" ? "pointer-events-none opacity-0" : "opacity-100"
              }`}
            >
              ‹
            </button>
            <button
              aria-label="Show back"
              onClick={() => setView("back")}
              className={`absolute top-1/2 right-3 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-text shadow-[var(--shadow)] backdrop-blur-sm transition-opacity hover:bg-white ${
                view === "back" ? "pointer-events-none opacity-0" : "opacity-100"
              }`}
            >
              ›
            </button>
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
              <span
                className={`h-1.5 w-1.5 rounded-full transition-colors ${
                  view === "front" ? "bg-white" : "bg-white/40"
                }`}
              />
              <span
                className={`h-1.5 w-1.5 rounded-full transition-colors ${
                  view === "back" ? "bg-white" : "bg-white/40"
                }`}
              />
            </div>
          </>
        )}
      </div>

      <FabricColorPicker
        fabric={spec.fabric}
        color={spec.color}
        onFabricChange={handleFabricChange}
        onColorChange={handleColorChange}
      />

      {spec.changes.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {spec.changes.map((c) => (
            <span
              key={c.type}
              className="rounded-full border border-border bg-surface px-3 py-1 text-xs text-text-2"
            >
              {c.label}
            </span>
          ))}
        </div>
      )}

      {!spec.constraints.passed && (
        <div
          role="alert"
          className="mt-3 rounded-shaklek-xs border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700"
        >
          <p className="font-medium">This request needs adjusting before it can be made:</p>
          <ul className="mt-1 list-disc pl-4">
            {spec.constraints.flagNotes.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
          <button
            onClick={clearFlag}
            className="mt-2 font-medium text-red-800 underline underline-offset-2 hover:text-red-900"
          >
            Drop that part of the request and continue
          </button>
        </div>
      )}

      {/* Chat log */}
      <div role="log" aria-live="polite" aria-label="Customization conversation" className="mt-4 flex flex-col gap-2">
        {messages.map((m, i) =>
          m.role === "ai" ? (
            <div
              key={i}
              className="rounded-shaklek-xs rounded-bl-sm border border-border bg-surface px-4 py-3 text-sm text-text-2"
            >
              {m.text}
            </div>
          ) : (
            <div
              key={i}
              className="ml-auto max-w-[80%] rounded-shaklek-xs rounded-br-sm bg-accent px-4 py-2.5 text-sm text-white"
            >
              {m.text}
            </div>
          ),
        )}
      </div>

      {/* Suggestions */}
      <div className="mt-3 flex flex-wrap gap-2">
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => sendMessage(s)}
            disabled={sending}
            className="rounded-full border border-border px-3 py-1.5 text-xs text-text-2 transition-colors hover:border-accent hover:text-text disabled:opacity-40"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="mt-3 flex gap-2">
        <label htmlFor="customize-input" className="sr-only">
          Describe your change
        </label>
        <input
          id="customize-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage(input);
          }}
          placeholder="Describe your change…"
          disabled={sending}
          className="flex-1 rounded-full border border-border-strong bg-white px-4 py-2.5 text-sm text-text placeholder:text-text-3 focus:border-accent focus:outline-none"
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={sending || !input.trim()}
          className="rounded-full bg-accent px-5 py-2.5 text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {sending ? "…" : "Send"}
        </button>
      </div>
      <p className="mt-2 text-xs text-text-3">
        Everything above is what gets made — fabric, color, and every change listed on the
        preview are committed, not a best-effort guess.
      </p>
    </div>
  );
}

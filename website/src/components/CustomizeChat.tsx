"use client";

import { useState } from "react";
import { colors } from "@/data/colors";
import { PASSING_CONSTRAINTS, type DesignSpec } from "@/data/designSpec";

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
  previewImage,
  previewGradient,
  suggestions = DEFAULT_SUGGESTIONS,
}: {
  spec: DesignSpec;
  onSpecChange: (spec: DesignSpec) => void;
  previewImage?: string | null;
  previewGradient: [string, string];
  suggestions?: string[];
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "ai", text: greetingFor(spec) },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

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
        className="relative aspect-[3/4] w-full overflow-hidden rounded-shaklek border border-border"
        style={
          previewImage
            ? undefined
            : { background: `linear-gradient(135deg, ${colorHex}, ${previewGradient[1]})` }
        }
      >
        {previewImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewImage} alt="Your uploaded reference" className="h-full w-full object-cover" />
        )}
        <span className="absolute top-4 right-4 rounded-full bg-accent px-3 py-1 text-[10px] font-medium tracking-wide text-white">
          LIVE PREVIEW
        </span>
        <div className="absolute inset-x-4 bottom-4 flex flex-wrap gap-2">
          <span className="rounded-full border border-border bg-white/90 px-3 py-1 text-xs text-text-2 backdrop-blur-sm">
            {spec.color}
          </span>
          <span className="rounded-full border border-border bg-white/90 px-3 py-1 text-xs text-text-2 backdrop-blur-sm">
            {spec.fabric === "cotton" ? "Cotton" : "Linen"}
          </span>
          {spec.changes.map((c) => (
            <span
              key={c.type}
              className="rounded-full border border-border bg-white/90 px-3 py-1 text-xs text-text-2 backdrop-blur-sm"
            >
              {c.label}
            </span>
          ))}
        </div>
      </div>

      {!spec.constraints.passed && (
        <div className="mt-3 rounded-shaklek-xs border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
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
      <div className="mt-4 flex flex-col gap-2">
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
        <input
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
        A stylist reviews every request before it goes to the tailor — this preview shows what
        Shaklek can automatically apply today.
      </p>
    </div>
  );
}

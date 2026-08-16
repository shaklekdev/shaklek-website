"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AccountNameForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await fetch("/api/account/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-4 rounded-shaklek-sm border border-gold/30 bg-gold/10 p-5">
      <p className="text-sm text-text">What should we call you?</p>
      <p className="mt-1 text-xs text-text-2">
        Helps your stylist address you by name when they reach out.
      </p>
      <div className="mt-3 flex gap-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="flex-1 rounded-shaklek-xs border border-border-strong bg-white px-3 py-2.5 text-sm text-text placeholder:text-text-3 focus:border-accent focus:outline-none"
        />
        <button
          onClick={handleSave}
          disabled={!name.trim() || saving}
          className="rounded-full bg-accent px-5 py-2 text-xs text-white transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}

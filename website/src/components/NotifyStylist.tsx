"use client";

import { useEffect, useState } from "react";

type OrderPayload = {
  slug: string;
  name: string;
  size: string;
  fabric: string;
  color: string;
  request: string;
  total: number;
  method: string;
};

export default function NotifyStylist({ order }: { order: OrderPayload }) {
  const [status, setStatus] = useState<"sending" | "sent" | "queued">("sending");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setStatus(data.emailed ? "sent" : "queued");
      })
      .catch(() => {
        if (!cancelled) setStatus("queued");
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (status === "sending") {
    return <p className="text-xs text-text-3">Notifying your stylist…</p>;
  }

  if (status === "sent") {
    return (
      <p className="text-xs text-text-3">
        Your stylist has been notified and will reach out shortly.
      </p>
    );
  }

  return (
    <p className="text-xs text-text-3">
      Order received — stylist notification is queued (email delivery isn&apos;t
      fully connected yet).
    </p>
  );
}

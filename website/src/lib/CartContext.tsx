"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { MAX_QUANTITY_PER_ITEM } from "@/lib/pricing";

export type CartItem = {
  id: string;
  slug: string;
  name: string;
  category: string;
  gradient: [string, string];
  previewImage?: string; // uploaded reference photo, shown instead of the gradient when present
  price: number;
  fabric: "cotton" | "linen";
  color: string;
  size: string;
  measurements: string;
  changes: string[];
  freeformNotes: string;
  // How many of this exact garment to make. Display and cart maths only --
  // the server re-resolves it from the request before it can touch
  // unit_amount or the database (src/lib/pricing.ts).
  quantity: number;
};

const STORAGE_KEY = "shaklek-cart";

type CartContextValue = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "id">) => void;
  updateItem: (id: string, item: Omit<CartItem, "id">) => void;
  setQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clear: () => void;
  total: number;
};

const CartContext = createContext<CartContextValue | null>(null);

// localStorage is attacker-writable in the sense that anything on the page --
// or the customer themselves -- can put arbitrary JSON here. Money is not at
// risk (src/lib/pricing.ts re-prices every order server-side), but a
// malformed entry used to flow straight into the UI as `NaN` totals and
// arbitrary strings. Validate the shape on the way in.
function isValidCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    typeof item.slug === "string" &&
    typeof item.name === "string" &&
    typeof item.category === "string" &&
    typeof item.price === "number" &&
    Number.isFinite(item.price) &&
    item.price >= 0 &&
    // Older carts predate quantity, so a missing value is valid and
    // normalised to 1 on read rather than discarding the whole line.
    (item.quantity === undefined ||
      (typeof item.quantity === "number" &&
        Number.isInteger(item.quantity) &&
        item.quantity >= 1 &&
        item.quantity <= MAX_QUANTITY_PER_ITEM)) &&
    (item.previewImage === undefined ||
      (typeof item.previewImage === "string" && item.previewImage.startsWith("data:image/")))
  );
}

function readStoredCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(isValidCartItem)
      .map((item) => ({ ...item, quantity: item.quantity ?? 1 }));
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Cart lives client-side only — there's no backend/DB yet (backend-todo.md),
  // so localStorage is the durable store until real order persistence exists.
  // Deliberately deferred to an effect rather than a lazy useState initializer:
  // reading localStorage during the initial render would mismatch the
  // server-rendered (window-less) output and break hydration.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(readStoredCart());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // QuotaExceededError -- an uploaded reference photo held as a data URL
      // can push the cart past the ~5MB origin quota. This used to throw
      // inside the effect and take the tree down on the highest-intent
      // flow. The in-memory cart still works for this session; only
      // persistence across a reload is lost.
      console.warn("[cart] could not persist cart to localStorage");
    }
  }, [items, hydrated]);

  const addItem = useCallback((item: Omit<CartItem, "id">) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setItems((prev) => [...prev, { ...item, id }]);
  }, []);

  // Reopening a cart line to change something has to overwrite that line, not
  // append a second one -- the customer who goes back to swap a colour is
  // editing one garment, not ordering two. Keeps the original id so the line
  // stays in place in the cart rather than jumping to the end.
  const updateItem = useCallback((id: string, item: Omit<CartItem, "id">) => {
    setItems((prev) => prev.map((existing) => (existing.id === id ? { ...item, id } : existing)));
  }, []);

  // Clamped here as well as on the server: the stepper can't go out of range,
  // but a hand-edited localStorage entry shouldn't render a broken cart
  // either. The server still re-resolves it -- this is display, not money.
  const setQuantity = useCallback((id: string, quantity: number) => {
    const next = Math.min(MAX_QUANTITY_PER_ITEM, Math.max(1, Math.floor(quantity)));
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, quantity: next } : item)));
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, updateItem, setQuantity, removeItem, clear, total }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

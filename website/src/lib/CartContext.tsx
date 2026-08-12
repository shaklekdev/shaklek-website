"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

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
};

const STORAGE_KEY = "shaklek-cart";

type CartContextValue = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  clear: () => void;
  total: number;
};

const CartContext = createContext<CartContextValue | null>(null);

function readStoredCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
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
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const addItem = useCallback((item: Omit<CartItem, "id">) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setItems((prev) => [...prev, { ...item, id }]);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const total = items.reduce((sum, i) => sum + i.price, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clear, total }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

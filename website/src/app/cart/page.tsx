"use client";

import Link from "next/link";
import { customerChosenLabels } from "@/data/parameterSliders";
import Header from "@/components/Header";
import { useCart } from "@/lib/CartContext";
import { cartThumbnail } from "@/lib/cartThumbnail";
import { MAX_QUANTITY_PER_ITEM } from "@/lib/pricing";

export default function CartPage() {
  const { items, removeItem, setQuantity, total } = useCart();

  if (items.length === 0) {
    return (
      <div className="flex flex-1 flex-col bg-bg">
        <Header />
        <div className="mx-auto w-full max-w-md flex-1 px-6 py-20 text-center">
          <h1 className="text-[26px] text-text">Your cart is empty</h1>
          <p className="subtitle mt-2">
            Browse the catalog or upload your own design to get started.
          </p>
          <Link
            href="/"
            className="mt-8 inline-block rounded-full bg-accent px-8 py-3.5 text-sm text-white transition-opacity hover:opacity-90"
          >
            Browse catalog
          </Link>
        </div>
      </div>
    );
  }

  // Garments, not cart lines -- two of the same shirt is two pieces to cut.
  const units = items.reduce((sum, item) => sum + item.quantity, 0);
  const thumbnails = Object.fromEntries(items.map((item) => [item.id, cartThumbnail(item)]));

  return (
    <div className="flex flex-1 flex-col bg-bg">
      <Header />
      <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
        <h1 className="text-[26px] text-text">Your cart</h1>
        <p className="subtitle">
          {units} {units === 1 ? "piece" : "pieces"}, each cut to order.
        </p>

        <div className="mt-8 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 rounded-shaklek-sm border border-border bg-surface p-4"
            >
              {/* The blank square here used to be the first thing a customer
                  saw after committing to a design. cartThumbnail resolves the
                  exact combination photo they were looking at. */}
              {thumbnails[item.id] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={thumbnails[item.id]}
                  alt={`${item.name} in ${item.color}`}
                  className="h-20 w-16 shrink-0 rounded-shaklek-xs object-cover"
                />
              ) : (
                <div
                  className="h-20 w-16 shrink-0 rounded-shaklek-xs"
                  style={{
                    background: `linear-gradient(135deg, ${item.gradient[0]}, ${item.gradient[1]})`,
                  }}
                  aria-hidden
                />
              )}
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[15px] font-medium text-text">{item.name}</p>
                  <div className="text-right">
                    <p className="font-display text-lg text-text whitespace-nowrap">
                      AED {item.price * item.quantity}
                    </p>
                    {item.quantity > 1 && (
                      <p className="text-[11px] text-text-3 whitespace-nowrap">
                        AED {item.price} each
                      </p>
                    )}
                  </div>
                </div>
                <p className="mt-1 text-xs text-text-2">
                  {item.fabric === "cotton" ? "Cotton" : "Linen"} · {item.color} · Size {item.size}
                </p>
                {customerChosenLabels(item.category, item.changes).length > 0 && (
                  <p className="mt-1 text-xs text-text-2">
                    {customerChosenLabels(item.category, item.changes).join(", ")}
                  </p>
                )}
                {/* Adding to the cart used to be a one-way door -- changing a
                    colour you'd just picked meant rebuilding the whole
                    garment. The design page restores this line from its id
                    and saves over it rather than adding a second one. */}
                <div className="mt-3 flex items-center gap-3">
                  <span className="text-xs text-text-3">Quantity</span>
                  <div className="flex items-center rounded-full border border-border-strong">
                    <button
                      onClick={() => setQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      aria-label={`Fewer ${item.name}`}
                      className="h-8 w-8 rounded-full text-sm text-text-2 transition-colors hover:text-text disabled:opacity-30"
                    >
                      −
                    </button>
                    <span aria-live="polite" className="min-w-6 text-center text-sm text-text">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= MAX_QUANTITY_PER_ITEM}
                      aria-label={`More ${item.name}`}
                      className="h-8 w-8 rounded-full text-sm text-text-2 transition-colors hover:text-text disabled:opacity-30"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="mt-2 flex gap-4">
                  {/* Uploaded designs carry no catalog slug (see
                      src/app/upload/page.tsx) -- there is no /design page to
                      send them back to, so they stay uneditable rather than
                      getting a link that 404s. */}
                  {item.slug && (
                    <Link
                      href={`/design/${item.slug}?edit=${item.id}`}
                      className="text-xs text-text-2 underline hover:text-text"
                    >
                      Edit
                    </Link>
                  )}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-xs text-text-3 underline hover:text-text-2"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
          <div>
            <p className="text-xs text-text-3">Total</p>
            <p className="font-display text-2xl text-text">AED {total}</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Adding a second piece used to mean finding your own way back --
                the only route out of the cart was a grey line of text under
                the fold. */}
            <Link
              href="/"
              className="rounded-full border border-border-strong px-6 py-3.5 text-sm text-text transition-colors hover:bg-surface-2"
            >
              Add another piece
            </Link>
            <Link
              href="/checkout"
              className="rounded-full bg-accent px-8 py-3.5 text-sm text-white transition-opacity hover:opacity-90"
            >
              Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

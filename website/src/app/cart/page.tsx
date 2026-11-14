"use client";

import Link from "next/link";
import { customerChosenLabels, paramKeyFor } from "@/data/parameterSliders";
import { catalog } from "@/data/catalog";
import { fitNoteLabel, resolveFitNotes } from "@/data/fitNotes";
import Header from "@/components/Header";
import { useCart } from "@/lib/CartContext";
import { cartThumbnail } from "@/lib/cartThumbnail";
import { MAX_QUANTITY_PER_ITEM } from "@/lib/pricing";

/** The slider set a cart line's product uses. The line stores a slug, so the
 *  catalogue item is recoverable; without this the labels are filtered against
 *  the CATEGORY's sliders and a product with its own set (the Jacket Abaya)
 *  would have its choices silently dropped from the order summary. Falls back
 *  to the stored category if the slug is not in the catalogue any more. */
function paramKeyForLine(line: { slug: string; category: string }): string {
  const found = catalog.find((c) => c.slug === line.slug);
  return found ? paramKeyFor(found) : line.category;
}

export default function CartPage() {
  const { items, removeItem, setQuantity, total } = useCart();

  if (items.length === 0) {
    return (
      <div className="flex flex-1 flex-col bg-bg">
        <Header />
        <div className="mx-auto w-full max-w-md flex-1 px-6 py-20 text-center">
          <h1 className="text-[26px] text-text">Your cart is empty</h1>
          <Link
            href="/catalog"
            className="mt-8 inline-block rounded-full bg-accent px-8 py-3.5 text-sm text-white transition-opacity hover:opacity-90"
          >
            Browse catalogue
          </Link>
        </div>
      </div>
    );
  }

  const thumbnails = Object.fromEntries(items.map((item) => [item.id, cartThumbnail(item)]));

  return (
    <div className="flex flex-1 flex-col bg-bg">
      <Header />
      <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
        <h1 className="text-[26px] text-text">Your cart</h1>

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
                  {item.color} ·{" "}
                  {/* "Size Tailored" read as a size called Tailored -- founder review 2026-11-11. */}
                  {item.size === "Tailored" ? "Tailored" : `Size ${item.size}`}
                </p>
                {/* What "Tailored" means, before paying (shaklek-ui 2026-11-14:
                    a buyer outside Dubai did not know how she would be measured). */}
                {item.size === "Tailored" && (
                  <p className="mt-1 text-xs text-text-3">Free fitting after payment: home in Dubai, or virtual.</p>
                )}
                {customerChosenLabels(paramKeyForLine(item), item.changes).length > 0 && (
                  <p className="mt-1 text-xs text-text-2">
                    {customerChosenLabels(paramKeyForLine(item), item.changes).join(", ")}
                  </p>
                )}
                {/* Read back what she told us about her usual size. Without
                    this the answers vanish between the design page and the
                    till, which reads as "it did not save" -- and this is the
                    one part of the order the customer cannot see on the
                    garment before it is made. */}
                {resolveFitNotes(item.category, item.fitNotes).length > 0 && (
                  <p className="mt-1 text-xs text-text-3">
                    Usually:{" "}
                    {resolveFitNotes(item.category, item.fitNotes)
                      .map((id) => fitNoteLabel(item.category, id)?.toLowerCase())
                      .filter(Boolean)
                      .join(", ")}
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
                      // h-11 w-11: 44px tap targets -- founder review 2026-11-11
                      className="h-11 w-11 rounded-full text-sm text-text-2 transition-colors hover:text-text disabled:opacity-30"
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
                      className="h-11 w-11 rounded-full text-sm text-text-2 transition-colors hover:text-text disabled:opacity-30"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* gap-6 + before:-inset hit areas give Edit and Remove 44px tap
                    targets that touch but never overlap -- founder review 2026-11-11 */}
                <div className="mt-2 flex gap-6">
                  {/* Kept after /upload was removed on 2026-09-12. Slugless
                      lines can no longer be created and readStoredCart drops
                      any that were stored, so this is now always true -- but a
                      guard that stops a link 404ing costs nothing and the next
                      slugless thing would find it already here. */}
                  {item.slug && (
                    <Link
                      href={`/design/${item.slug}?edit=${item.id}`}
                      className="relative text-xs text-text-2 underline before:absolute before:-inset-x-3 before:-inset-y-3.5 before:content-[''] hover:text-text"
                    >
                      Edit
                    </Link>
                  )}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="relative text-xs text-text-3 underline before:absolute before:-inset-x-3 before:-inset-y-3.5 before:content-[''] hover:text-text-2"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stacked below 640px: at 390px the total and two buttons shared one row
            and both wrapped mid-word -- founder review 2026-11-11. */}
        <div className="mt-8 flex flex-col gap-5 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs text-text-3">Total</p>
            <p className="font-display text-2xl text-text whitespace-nowrap">AED {total}</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Adding a second piece used to mean finding your own way back --
                the only route out of the cart was a grey line of text under
                the fold. */}
            <Link
              href="/catalog"
              className="flex-1 rounded-full border border-border-strong px-4 py-3.5 text-center text-sm whitespace-nowrap text-text transition-colors hover:bg-surface-2 sm:flex-none sm:px-6"
            >
              Add another piece
            </Link>
            <Link
              href="/checkout"
              className="flex-1 rounded-full bg-accent px-8 py-3.5 text-center text-sm whitespace-nowrap text-white transition-opacity hover:opacity-90 sm:flex-none"
            >
              Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

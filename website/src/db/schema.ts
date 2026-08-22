import {
  pgTable,
  uuid,
  text,
  numeric,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";

// Tailor and catalog tables aren't defined yet — nothing writes to them
// until the tailor swipe tool and catalog admin tool exist (backend-todo.md).
// This covers the order pipeline, which is the only part with a real
// write path today (checkout -> /api/orders).

export const customers = pgTable("customers", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  // Set from /account. Not stored on the Clerk user itself -- Clerk
  // rejects writes to first_name/last_name unless the "Name" personal
  // information attribute is turned on for the instance, which is a
  // Dashboard-only toggle with no Backend API equivalent. Keeping this in
  // our own customers row instead avoids needing that Dashboard change.
  name: text("name"),
  // Saved from /account so a signed-in customer doesn't re-enter the same
  // numbers on every order -- same fields as SizePicker's Tailored mode
  // (order_items.measurements), just persisted once per customer instead
  // of once per order.
  measurementBust: text("measurement_bust"),
  measurementWaist: text("measurement_waist"),
  measurementHip: text("measurement_hip"),
  measurementHeight: text("measurement_height"),
  measurementNotes: text("measurement_notes"),
});

export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  customerId: uuid("customer_id")
    .notNull()
    .references(() => customers.id),
  totalAed: numeric("total_aed", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text("payment_method").notNull(),
  // pending_payment -> paid (checkout.session.completed) or -> payment_failed
  // (checkout.session.expired, ~24h checkout timeout) -- both set by the
  // Stripe webhook, api/webhooks/stripe/route.ts. Stays pending_payment
  // forever if Stripe isn't configured -- see /api/orders. Fulfillment
  // statuses (in progress, shipped, canceled) don't exist yet -- no
  // external system can set those automatically, needs a staff UI.
  status: text("status").notNull().default("pending_payment"),
  stripeSessionId: text("stripe_session_id"),
  // Where the garment actually goes. Collected by Stripe Checkout and written
  // by the webhook, not by the checkout form -- Stripe already validates and
  // autocompletes addresses, and it keeps the address out of our form POST.
  // All nullable: orders placed before 2026-08-22 have none, and the
  // no-Stripe fallback path never collects one.
  shippingName: text("shipping_name"),
  shippingPhone: text("shipping_phone"),
  shippingLine1: text("shipping_line1"),
  shippingLine2: text("shipping_line2"),
  shippingCity: text("shipping_city"),
  shippingState: text("shipping_state"),
  shippingPostalCode: text("shipping_postal_code"),
  shippingCountry: text("shipping_country"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const orderItems = pgTable("order_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id),
  name: text("name").notNull(),
  category: text("category"),
  fabric: text("fabric"),
  color: text("color"),
  size: text("size"),
  measurements: text("measurements"),
  changes: text("changes").array(),
  freeformNotes: text("freeform_notes"),
  priceAed: numeric("price_aed", { precision: 10, scale: 2 }).notNull(),
  hasReferenceImage: boolean("has_reference_image").notNull().default(false),
});

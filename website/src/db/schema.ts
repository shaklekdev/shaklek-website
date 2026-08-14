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
});

export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  customerId: uuid("customer_id")
    .notNull()
    .references(() => customers.id),
  totalAed: numeric("total_aed", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text("payment_method").notNull(),
  // pending_payment -> paid (set by the Stripe webhook on checkout.session.completed).
  // Stays pending_payment forever if Stripe isn't configured -- see /api/orders.
  status: text("status").notNull().default("pending_payment"),
  stripeSessionId: text("stripe_session_id"),
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

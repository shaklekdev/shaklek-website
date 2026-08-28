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
  // "Make it your way" -- stable ids from src/data/fitNotes.ts, never customer
  // free text. Set on BOTH size modes since 2026-08-27. They were standard-only
  // when the labels named faults ("Sleeves too short"), on the reasoning that a
  // garment cut to the customer's own numbers cannot be wrong in its size. The
  // labels are now preferences ("Sleeves a little longer"), and a preference
  // about how a garment should hang is something measurements do not express.
  // Nullable, because every order placed before 2026-08-26 has none.
  fitNotes: text("fit_notes").array(),
  changes: text("changes").array(),
  freeformNotes: text("freeform_notes"),
  priceAed: numeric("price_aed", { precision: 10, scale: 2 }).notNull(),
  hasReferenceImage: boolean("has_reference_image").notNull().default(false),
});

/**
 * Every piece of fit feedback a customer has ever sent from /fit.
 *
 * ⚠️ APPEND ONLY. THIS WAS THREE COLUMNS ON `customers` AND IT WAS WRONG.
 * That version kept one answer per customer and overwrote it on the next
 * submission, on the reasoning that the tailor only needs the latest read.
 * The founder's instruction, 2026-08-28: "i don't want anything to be
 * overwritten, i don't want to lose any data."
 *
 * She is right, and the reason is not sentiment about records. A body changes,
 * and so does what she wants from a garment. Three entries saying "a little
 * tight at the waist" across a year is a different instruction from one, and
 * an overwrite destroys the only evidence that would tell them apart. It also
 * destroyed the customer's own history silently, with nothing to restore from.
 *
 * So: one row per submission, nothing ever updated. The tech pack reads the
 * most recent row that predates the order it is printing; the account shows
 * her the whole list. The only DELETE is the customer's own, from her account,
 * and it clears every row because that is what "delete my data" has to mean.
 */
export const fitFeedback = pgTable("fit_feedback", {
  id: uuid("id").defaultRandom().primaryKey(),
  customerId: uuid("customer_id")
    .notNull()
    .references(() => customers.id),
  // WHICH PIECE THIS IS ABOUT. Founder, 2026-08-28: "one customer can have
  // different feedbacks on multiple orders."
  //
  // ⚠️ RESOLVED ON THE SERVER, NOT ASKED FOR. The QR is printed in bulk on a
  // card that cannot know which parcel it was packed into, and /fit has no
  // sign-in -- so it must never offer a visitor a list of orders for a typed
  // email. That would answer "what has this woman bought" to anyone who knows
  // her address. Instead the insert attaches the feedback to her most recent
  // PAID order at the moment she submits, which is the parcel she is holding.
  //
  // Nullable because the reference must survive an order being removed for any
  // reason; the feedback itself is still true about her body.
  orderId: uuid("order_id").references(() => orders.id),
  // JSON of {questionId: optionId}. Ids only, never labels: labels are copy
  // and get reworded, ids reach a tailor's document and must not move.
  answers: text("answers").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

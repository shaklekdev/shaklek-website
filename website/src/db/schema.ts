import { boolean, index, numeric, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

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

  // ⚠️ THE TAILOR'S SET, ADDED 2026-09-15. The four above were what a customer
  // could type into a form; these are what the person with the tape actually
  // works from. The founder, on why this table matters: "this is our MOST
  // IMPORTANT DATA", and she fills it in herself at the appointment.
  //
  // ELEVEN BODY MEASUREMENTS, her instruction: "take the eleven body
  // measurement shared by taylor already". Source is the tailor's own sheet,
  // recorded at planning/frontend-todo.md:68-72. Three of the eleven are
  // already above under their customer-facing names: chest is measurementBust,
  // waist is measurementWaist, hips is measurementHip. The eight below are the
  // rest. measurementHeight is NOT on the tailor's list and is kept because a
  // customer can give it and it helps sanity-check the others.
  //
  // ⚠️ TEXT, NOT NUMERIC, deliberately and consistently with the four above.
  // She writes what the tape says, and that includes "92 (over the bust)" or a
  // range. A numeric column would reject the note and lose the nuance, and
  // nothing computes on these: they are read by a human and cut to.
  measurementStomach: text("measurement_stomach"),
  measurementShoulder: text("measurement_shoulder"),
  measurementNeck: text("measurement_neck"),
  measurementThigh: text("measurement_thigh"),
  measurementCrotch: text("measurement_crotch"),
  measurementShirtLength: text("measurement_shirt_length"),
  measurementSleeveLength: text("measurement_sleeve_length"),
  measurementTrouserLength: text("measurement_trouser_length"),

  // Her words: "add a mention for anything specific depending on the design."
  // Distinct from measurementNotes above, which is whatever the CUSTOMER typed;
  // this is what SHE observed in the room and it is the part a form can never
  // capture. One shoulder lower than the other, a preference for more ease
  // through the hip, a posture the block has to allow for.
  measurementFittingNotes: text("measurement_fitting_notes"),
  // When the tape was last in the room. Distinguishes "no measurements yet"
  // from "measured, and these are the numbers", which the page must show
  // differently or she cannot tell who still needs an appointment.
  measuredAt: timestamp("measured_at", { withTimezone: true }),
}, (t) => [
  // ⚠️ THE CUSTOMER KEY IS CASE-INSENSITIVE, AND THE DATABASE ENFORCES IT HERE.
  //
  // `email` already carries a plain unique constraint, but a Postgres `text`
  // index is CASE-SENSITIVE -- so `jane@x.com` and `Jane@X.com` satisfied it as
  // two different customers. Customers are keyed by email, so that meant one
  // person could end up as two rows: her order attached to the second, and
  // stopped appearing on her own /account page. Found 2026-08-30 by the
  // security review, before any real customer met it.
  //
  // Every write path now lower-cases at the boundary. This index is what makes
  // that a GUARANTEE rather than four call sites remembering to -- the next
  // route someone adds cannot reintroduce the split, because the insert fails
  // instead of quietly succeeding.
  //
  // Applied to dev and production on 2026-08-31 after confirming zero existing
  // violations in either (distinct-case-insensitive equalled total row count).
  uniqueIndex("customers_email_lower_idx").on(sql`lower(${t.email})`),
]);

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
  // forever if Stripe isn't configured -- see /api/orders.
  //
  // Fulfillment statuses ARE set by staff, by hand, from /dashboard/orders:
  // paid -> in_progress -> shipped -> delivered, plus canceled. The allowed
  // list lives in api/dashboard/orders/[id]/status/route.ts, which is the
  // authority -- this comment said they "don't exist yet, needs a staff UI"
  // for a week after the staff UI shipped, and that stale line was read back
  // to the founder as current on 2026-09-05.
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
  // WHEN THE PARCEL REACHED HER. The anchor for "one free alteration or remake
  // within 14 days of delivery" -- printed on the thank-you card, which cannot
  // be recalled, so this is not optional bookkeeping.
  //
  // ⚠️ NOT DERIVABLE FROM `status`. That is one overwritable field: mark an
  // order delivered and then cancel it and the date is gone. Written once, on
  // the first transition into `delivered` (the status route coalesces), so a
  // second click cannot quietly extend a customer's deadline.
  //
  // Nullable: every order placed before 2026-09-05 has none, and an order that
  // has not arrived yet has none by definition.
  deliveredAt: timestamp("delivered_at", { withTimezone: true }),
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
  // THE FIT GUARANTEE, SPENT. Null means she still has it.
  //
  // ⚠️ ON THE ITEM, NOT THE ORDER. The promise is written about a garment --
  // /legal/terms files it under "If the fit isn't right", /shipping opens with
  // "Try it on promptly" -- so a customer whose shirt AND trousers both fit
  // badly gets both fixed. Quantity expands to one row per garment in
  // /api/orders, so two of the same shirt carry a remedy each.
  //
  // ⚠️ AND ONLY THE FIT REMEDY. /shipping is explicit that a faulty or
  // wrong-item remake "is separate from the fit guarantee and does not use it
  // up". Do not set this from that path, and do not rename it to something
  // that invites it.
  fitRemakeUsedAt: timestamp("fit_remake_used_at", { withTimezone: true }),
}, (t) => [
  // A foreign key does NOT create an index in Postgres. Every read path that
  // matters filters on this -- the Stripe webhook, the spec sheet, /account,
  // the dashboard, and the subselect in /api/fit-feedback that attaches
  // feedback to a garment. That last one is public and unauthenticated and is
  // deliberately constant-work, so an unindexed scan there is a timing
  // residual that grows with the table.
  index("order_items_order_id_idx").on(t.orderId),
]);

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
  // WHICH GARMENT IN THAT ORDER. One card is packed in a parcel that may hold
  // several pieces, and the five questions are garment-agnostic, so without
  // this "the length was shorter than I like" on a two-piece order cannot be
  // attributed -- and the tech pack prints it under HOW HER LAST PIECE FITTED
  // against whatever is being cut next. Wrong instructions to a tailor, not a
  // gap in a report.
  //
  // Resolved on the server from a question she answers about the garment IN
  // HER HAND ("which piece is this about?"), never by showing her a list of
  // what she bought -- that would be the account-enumeration leak the whole
  // route is built to avoid. She tells us; we tell her nothing.
  //
  // Nullable and staying that way: every row before 2026-09-05 has none, and a
  // customer who skips the question still gets her answers stored against the
  // order rather than thrown away.
  orderItemId: uuid("order_item_id").references(() => orderItems.id),
  // JSON of {questionId: optionId}. Ids only, never labels: labels are copy
  // and get reworded, ids reach a tailor's document and must not move.
  answers: text("answers").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  // All three readers -- the account page, the spec sheet and the delete --
  // filter on customer_id and order by created_at. A foreign key does NOT
  // create an index in Postgres, so without this every read is a sequential
  // scan of the whole table, and the table only grows.
  index("fit_feedback_customer_created_idx").on(t.customerId, t.createdAt),
]);

/**
 * WAITLIST. Everyone who asked to be told when the shop opens.
 *
 * ⚠️ THIS TABLE IS THE LIST. Resend is a copy of it, not the other way round.
 * Until 2026-09-12 a signup existed ONLY as a Resend contact and an email in
 * the founder's inbox, and her objection was the right one: an email address
 * someone chose to give is the asset, and it should not live only inside a
 * third party we might leave. Query this table for the real number; Resend is
 * how the launch mail gets sent, not where the truth is.
 *
 * ⚠️ AND A ROW HERE IS NOT PERMISSION TO EMAIL. Anyone can type anyone's
 * address into a public form, so a row starts UNCONFIRMED and only a click in
 * the real inbox sets `confirmedAt`. Only confirmed rows are pushed to Resend,
 * which is what keeps a launch Broadcast off the addresses of people who never
 * asked -- and keeps shaklek.com's sending reputation, which also carries every
 * order confirmation, out of spam folders.
 */
export const waitlist = pgTable("waitlist", {
  id: uuid("id").defaultRandom().primaryKey(),
  // Lowercased at the boundary, like customers.email, and unique so a repeat
  // signup updates rather than duplicates. A list with the same person three
  // times is not a list.
  email: text("email").notNull().unique(),
  // "coming-soon", "shaklek-plus", and whatever comes next. Bounded server-side.
  source: text("source").notNull().default("unknown"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  // Set by the confirm link, never by the signup itself. Null means "asked, but
  // has not proved the inbox is hers" -- countable, not mailable.
  confirmedAt: timestamp("confirmed_at"),
  // Set when the contact reaches Resend, so a failed push can be retried
  // without guessing who already made it across.
  syncedAt: timestamp("synced_at"),
  // ⚠️ THE PROMISE MADE IN THE CONFIRM EMAIL. Founder, 2026-09-12: the list is
  // for new drops too, not only the opening, so "nothing else, ever" came out
  // and "you can leave the list whenever you like" went in. That sentence is a
  // permission promise the moment it is written, so leaving has to actually
  // work -- hence a column, an endpoint and a List-Unsubscribe header on every
  // send, rather than trusting that drops will always go out as Broadcasts.
  //
  // Kept as a timestamp rather than deleting the row: a deleted row can be
  // re-added by a later signup and silently re-subscribe someone who left.
  unsubscribedAt: timestamp("unsubscribed_at"),
});

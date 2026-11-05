// The one customer-facing WhatsApp link. Header, Footer, /faq, /shipping and
// /fit all point here, so a number change is one edit, not a grep.
//
// ⚠️ NOT THE TAILOR'S NUMBER. The dashboard's wa.me link reads
// TAILOR_WHATSAPP_NUMBER from the environment and goes to the tailor; this one
// goes to the founder. Do not merge the two.
//
// The Header prints WHATSAPP_HANDLE. scripts/brand/generate-supplier-pdf.mjs
// still draws the old number on a business-card MOCKUP only (the real card
// artwork has no number since 2026-09-19).
// ⚠️ THE BUSINESS USERNAME, NOT THE NUMBER. Founder, 2026-11-05: people who
// click or scan must land on the WhatsApp Business profile @shaklek, not see a
// phone number. Checked: wa.me/shaklek 302s to api.whatsapp.com/send/?
// username=shaklek&type=username. The visible handle is WHATSAPP_HANDLE.
export const WHATSAPP_URL = "https://wa.me/shaklek";
export const WHATSAPP_HANDLE = "@shaklek";

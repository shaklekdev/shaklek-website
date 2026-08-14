import { NextResponse } from "next/server";

function prefix(v: string | undefined) {
  if (!v) return null;
  return v.slice(0, 8) + "..." + v.length;
}

export async function GET() {
  return NextResponse.json({
    stripeSecretKeyPrefix: prefix(process.env.STRIPE_SECRET_KEY),
    stripeWebhookSecretPrefix: prefix(process.env.STRIPE_WEBHOOK_SECRET),
    resendKeyPrefix: prefix(process.env.RESEND_API_KEY),
  });
}

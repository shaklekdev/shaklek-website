import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
    hasStripeKey: Boolean(process.env.STRIPE_SECRET_KEY),
    hasResendKey: Boolean(process.env.RESEND_API_KEY),
  });
}

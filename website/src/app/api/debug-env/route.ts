import { NextResponse } from "next/server";

// Temporary — checks which env vars the Lambda runtime actually sees,
// without ever revealing values. Delete once the DATABASE_URL mystery
// is resolved.
export async function GET() {
  return NextResponse.json({
    hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
    hasStripeKey: Boolean(process.env.STRIPE_SECRET_KEY),
    hasResendKey: Boolean(process.env.RESEND_API_KEY),
  });
}

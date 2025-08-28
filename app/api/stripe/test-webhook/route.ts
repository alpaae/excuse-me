import { NextRequest, NextResponse } from 'next/server';
import { serverEnv } from '@/lib/env';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    hasSecretKey: !!serverEnv.STRIPE_SECRET_KEY,
    hasMonthlyPrice: !!serverEnv.STRIPE_PRICE_PRO_MONTHLY,
    hasPackPrice: !!serverEnv.STRIPE_PRICE_PACK_100,
    hasWebhookSecret: !!serverEnv.STRIPE_WEBHOOK_SECRET,
    webhookUrl: `${request.nextUrl.origin}/api/stripe/webhook`,
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
}

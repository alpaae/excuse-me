import { NextRequest, NextResponse } from 'next/server';
import { serverEnv } from '@/lib/env';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Stripe webhook test endpoint',
    config: {
      hasSecretKey: !!serverEnv.STRIPE_SECRET_KEY,
      hasMonthlyPrice: !!serverEnv.STRIPE_PRICE_PRO_MONTHLY,
      hasPackPrice: !!serverEnv.STRIPE_PRICE_PACK_100,
      hasWebhookSecret: !!serverEnv.STRIPE_WEBHOOK_SECRET,
    },
    webhookUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/stripe/webhook`,
  });
}

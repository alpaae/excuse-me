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
    // Добавляем больше деталей для диагностики
    stripeKeys: {
      secretKeyLength: serverEnv.STRIPE_SECRET_KEY?.length || 0,
      monthlyPriceId: serverEnv.STRIPE_PRICE_PRO_MONTHLY || 'NOT_SET',
      packPriceId: serverEnv.STRIPE_PRICE_PACK_100 || 'NOT_SET',
      webhookSecretLength: serverEnv.STRIPE_WEBHOOK_SECRET?.length || 0,
    },
    // Проверяем формат ключей
    keyFormats: {
      secretKeyStartsWith: serverEnv.STRIPE_SECRET_KEY?.substring(0, 3) || 'N/A',
      webhookSecretStartsWith: serverEnv.STRIPE_WEBHOOK_SECRET?.substring(0, 3) || 'N/A',
    }
  });
}

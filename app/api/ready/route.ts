import { NextRequest, NextResponse } from 'next/server';
import { validateAllEnv } from '@/lib/env';

// Edge runtime для быстрой проверки
export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    // Проверяем все критические переменные окружения
    const env = validateAllEnv();
    
    // Проверяем наличие критичных переменных
    const criticalVars = [
      'OPENAI_API_KEY',
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE',
    ];
    
    const missing: string[] = [];
    
    // Проверяем обязательные переменные
    if (!env.OPENAI_API_KEY) {
      missing.push('OPENAI_API_KEY');
    }
    if (!env.NEXT_PUBLIC_SUPABASE_URL) {
      missing.push('NEXT_PUBLIC_SUPABASE_URL');
    }
    if (!env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    }
    if (!env.SUPABASE_SERVICE_ROLE) {
      missing.push('SUPABASE_SERVICE_ROLE');
    }
    
    // Проверяем опциональные переменные (для полной функциональности)
    const optionalVars = [
      'STRIPE_SECRET_KEY',
      'STRIPE_PRICE_PRO_MONTHLY',
      'STRIPE_WEBHOOK_SECRET',
      'TG_BOT_TOKEN',
    ];
    
    const missingOptional: string[] = [];
    if (!env.STRIPE_SECRET_KEY) {
      missingOptional.push('STRIPE_SECRET_KEY');
    }
    if (!env.STRIPE_PRICE_PRO_MONTHLY) {
      missingOptional.push('STRIPE_PRICE_PRO_MONTHLY');
    }
    if (!env.STRIPE_WEBHOOK_SECRET) {
      missingOptional.push('STRIPE_WEBHOOK_SECRET');
    }
    if (!env.TG_BOT_TOKEN) {
      missingOptional.push('TG_BOT_TOKEN');
    }
    
    const isReady = missing.length === 0;
    
    return NextResponse.json({
      ok: isReady,
      missing: missing,
      missingOptional: missingOptional,
      env: {
        nodeEnv: env.NODE_ENV,
        vercel: !!env.VERCEL,
        vercelEnv: env.VERCEL_ENV,
        vercelRegion: env.VERCEL_REGION,
      },
      features: {
        payments: !!(env.STRIPE_SECRET_KEY && env.STRIPE_PRICE_PRO_MONTHLY),
        telegram: !!env.TG_BOT_TOKEN,
        redis: !!(env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN),
      },
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    // Если валидация env не прошла, возвращаем ошибку
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json({
      ok: false,
      error: errorMessage,
      missing: ['ENV_VALIDATION_FAILED'],
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

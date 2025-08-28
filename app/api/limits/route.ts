import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { getWarsawDateString } from '@/lib/time-warsaw';
import { logger, getRequestId, createErrorResponse, ErrorCodes } from '@/lib/logger';

export async function GET(request: NextRequest) {
  const requestId = getRequestId(request);
  logger.info('Limits API started', requestId);
  
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return createErrorResponse(
        ErrorCodes.UNAUTHORIZED,
        'Authentication required',
        401,
        requestId
      );
    }

    // Проверяем подписку пользователя
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    const isPro = !!subscription;
    let remaining = 3; // По умолчанию 3 для всех
    let used = 0;
    let nextResetAt = new Date();
    nextResetAt.setDate(nextResetAt.getDate() + 1);
    nextResetAt.setHours(0, 0, 0, 0);

    if (isPro) {
      if (subscription.plan_type === 'monthly') {
        // Месячная подписка - безлимитные генерации
        remaining = Infinity;
      } else if (subscription.plan_type === 'pack100') {
        // Пакет 100 генераций
        remaining = subscription.generations_remaining || 0;
      }
    } else {
      // Проверяем дневной лимит по Warsaw timezone для всех остальных
      const today = getWarsawDateString();
      const todayStart = new Date(today + 'T00:00:00.000Z');
      const todayEnd = new Date(today + 'T23:59:59.999Z');
      
      const { count } = await supabase
        .from('excuses')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', todayStart.toISOString())
        .lte('created_at', todayEnd.toISOString());

      used = count || 0;
      remaining = Math.max(0, 3 - used);
    }

    logger.info('Limits API completed successfully', requestId, { 
      userId: user.id,
      isPro,
      remaining,
      used
    });

    return NextResponse.json({
      success: true,
      limits: {
        isPro,
        remaining,
        used,
        total: isPro ? Infinity : 3,
        nextResetAt: nextResetAt.toISOString(),
      },
      requestId,
    });

  } catch (error) {
    logger.error(
      'Limits API failed',
      error instanceof Error ? error : new Error(String(error)),
      requestId
    );
    
    return createErrorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'Internal server error',
      500,
      requestId
    );
  }
}

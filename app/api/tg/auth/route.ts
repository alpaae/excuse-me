import { NextRequest, NextResponse } from 'next/server';
import { verifyInitData } from '@/lib/telegram';
import { createServiceClient } from '@/lib/supabase-server';
import { logger, getRequestId, createErrorResponse, ErrorCodes } from '@/lib/logger';
import { serverEnv } from '@/lib/env';

export async function POST(request: NextRequest) {
  if (process.env.ENV_MODE === 'ci') {
    // никакой сети в CI
    throw new Error('Network calls are disabled in CI');
  }
  
  const requestId = getRequestId(request);
  logger.info('Telegram auth started', requestId);
  
  try {
    const { initData } = await request.json();
    
    if (!initData) {
      return createErrorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'Init data is required',
        400,
        requestId
      );
    }

    // Проверяем initData только в production
    if (serverEnv.NODE_ENV === 'production' && serverEnv.TG_BOT_TOKEN) {
      const isValid = verifyInitData(initData, serverEnv.TG_BOT_TOKEN);
      if (!isValid) {
        return createErrorResponse(
          ErrorCodes.UNAUTHORIZED,
          'Invalid Telegram data',
          401,
          requestId
        );
      }
    }

    // Парсим данные пользователя из initData
    const urlParams = new URLSearchParams(initData);
    const userDataStr = urlParams.get('user');
    
    if (!userDataStr) {
      return createErrorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'User data not found',
        400,
        requestId
      );
    }

    const userData = JSON.parse(userDataStr);
    
    // Создаем или обновляем профиль
    const supabase = createServiceClient();
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userData.id.toString(),
        display_name: userData.first_name + (userData.last_name ? ` ${userData.last_name}` : ''),
      })
      .select()
      .single();

    if (profileError) {
      logger.error('Profile upsert error', profileError, requestId);
      return createErrorResponse(
        ErrorCodes.SERVICE_UNAVAILABLE,
        'Failed to create profile',
        500,
        requestId
      );
    }

    logger.info('Telegram auth completed successfully', requestId, { 
      userId: userData.id,
      firstName: userData.first_name 
    });

    return NextResponse.json({
      success: true,
      user: {
        id: userData.id,
        first_name: userData.first_name,
        last_name: userData.last_name,
        username: userData.username,
      },
      requestId,
    });

  } catch (error) {
    logger.error(
      'Telegram auth failed',
      error instanceof Error ? error : new Error(String(error)),
      requestId
    );
    
    return createErrorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'Authentication failed',
      500,
      requestId
    );
  }
}

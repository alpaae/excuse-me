import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@/lib/supabase-server';
import { SYSTEM_PROMPT, generateUserPrompt } from '@/lib/prompts';
import { rateLimit } from '@/lib/rate-limit';
import { logger, getRequestId, createErrorResponse, ErrorCodes } from '@/lib/logger';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  const requestId = getRequestId(request);
  logger.info('Generate API started', requestId);
  
  try {
    const { scenario, tone, channel, lang, context, generateAudio } = await request.json();
    
    // Валидация входных данных
    if (!scenario || !tone || !channel || !lang) {
      return createErrorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'Missing required fields',
        400,
        requestId
      );
    }

    // Получаем пользователя
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return createErrorResponse(
        ErrorCodes.UNAUTHORIZED,
        'Authentication required',
        401,
        requestId
      );
    }

    // Rate limiting
    const rateLimitResult = await rateLimit(request, user.id);
    if (!rateLimitResult.success) {
      return createErrorResponse(
        ErrorCodes.RATE_LIMIT,
        'Too many requests',
        429,
        requestId
      );
    }

    // Проверяем лимиты для бесплатных пользователей
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (!subscription) {
      // Проверяем дневной лимит
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { count } = await supabase
        .from('excuses')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', today.toISOString());

      if (count && count >= 3) {
        return createErrorResponse(
          ErrorCodes.FREE_LIMIT_REACHED,
          'Daily free limit reached',
          402,
          requestId
        );
      }
    }

    // Генерируем отмазку через OpenAI
    const userPrompt = generateUserPrompt({ scenario, tone, channel, lang, context });
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    const resultText = completion.choices[0]?.message?.content?.trim();
    
    if (!resultText) {
      return createErrorResponse(
        ErrorCodes.SERVICE_UNAVAILABLE,
        'Failed to generate excuse',
        500,
        requestId
      );
    }

    // Сохраняем результат в БД
    const { data: excuse, error: dbError } = await supabase
      .from('excuses')
      .insert({
        user_id: user.id,
        input: { scenario, tone, channel, lang, context },
        result_text: resultText,
        sent_via: channel,
      })
      .select()
      .single();

    if (dbError) {
      logger.warn('Database error during excuse save', requestId, { error: dbError.message });
    }

    logger.info('Generate API completed successfully', requestId, { 
      scenario, 
      tone, 
      channel, 
      lang,
      excuseId: excuse?.id 
    });

    return NextResponse.json({
      success: true,
      text: resultText,
      excuse_id: excuse?.id,
      requestId,
    });

  } catch (error) {
    logger.error(
      'Generate API failed',
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

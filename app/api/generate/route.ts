import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@/lib/supabase-server';
import { SYSTEM_PROMPT, generateUserPrompt } from '@/lib/prompts';
import { rateLimit } from '@/lib/rate-limit';
import { logger, getRequestId, createErrorResponse, ErrorCodes } from '@/lib/logger';
import { serverEnv } from '@/lib/env';
import { getWarsawDateString, nextMidnightZonedISO } from '@/lib/time-warsaw';
import { pickRarity } from '@/lib/rarity';

// Node.js runtime для работы с OpenAI и Supabase
export const runtime = 'nodejs';

const openai = new OpenAI({
  apiKey: serverEnv.OPENAI_API_KEY,
});

// Server-side language detection function
function detectLanguage(text: string): string {
  const t = (text || '').trim();
  if (!t) return 'en';
  // very rough heuristics
  if (/[а-яё]/i.test(t)) return 'ru';
  if (/[ñáéíóúü¿¡]/i.test(t)) return 'es';
  if (/[ąćęłńóśźż]/i.test(t)) return 'pl';
  if (/[äöüß]/i.test(t)) return 'de';
  if (/[àâçéèêëîïôûùüÿœ]/i.test(t)) return 'fr';
  // fallback
  return 'en';
}

export async function POST(request: NextRequest) {
  if (process.env.ENV_MODE === 'ci') {
    // никакой сети в CI
    throw new Error('Network calls are disabled in CI');
  }
  
  const requestId = getRequestId(request);
  logger.info('Generate API started', requestId);
  
  try {
    const { scenario, tone, channel, context, generateAudio } = await request.json();
    
    // Валидация входных данных
    if (!scenario || !tone || !channel) {
      return createErrorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'Missing required fields',
        400,
        requestId
      );
    }

    // Server-side language detection
    const combinedText = `${scenario} ${context || ''}`.trim();
    const targetLang = detectLanguage(combinedText);
    
    logger.info('Language detected', requestId, { 
      scenario, 
      context, 
      detectedLang: targetLang 
    });

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

    // Проверяем подписку пользователя
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    const isPro = !!subscription;
    let remaining = 3; // По умолчанию 3 для всех
    let nextResetAt = nextMidnightZonedISO();

    if (isPro) {
      if (subscription.plan_type === 'monthly') {
        // Месячная подписка - безлимитные генерации
        remaining = Infinity;
      } else if (subscription.plan_type === 'pack100') {
        // Пакет 100 генераций
        remaining = subscription.generations_remaining || 0;
        
        if (remaining === 0) {
          return NextResponse.json({
            success: false,
            error: 'PACK_LIMIT_REACHED',
            remaining: 0,
            nextResetAt,
          }, { status: 402 });
        }
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

      const used = count || 0;
      remaining = Math.max(0, 3 - used);

      if (remaining === 0) {
        return NextResponse.json({
          success: false,
          error: 'FREE_LIMIT_REACHED',
          remaining: 0,
          nextResetAt,
        }, { status: 402 });
      }
    }

    // Генерируем отмазку через OpenAI с server-detected language
    const userPrompt = generateUserPrompt({ 
      scenario, 
      tone, 
      channel, 
      targetLang, 
      context 
    });
    
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

    // Get total excuses before this one for rarity calculation
    const { count: totalBefore } = await supabase
      .from('excuses')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    // Calculate rarity
    const rarity = pickRarity(totalBefore || 0);

    // Сохраняем результат в БД с detected language and rarity
    const { data: excuse, error: dbError } = await supabase
      .from('excuses')
      .insert({
        user_id: user.id,
        input: { scenario, tone, channel, lang: targetLang, context },
        result_text: resultText,
        sent_via: channel,
        rarity: rarity,
      })
      .select()
      .single();

    if (dbError) {
      logger.warn('Database error during excuse save', requestId, { error: dbError.message });
    }

    // Обновляем лимиты после успешной генерации
    let updatedRemaining = remaining;
    if (isPro && subscription?.plan_type === 'pack100') {
      // Уменьшаем количество оставшихся генераций для пакета 100
      const newRemaining = Math.max(0, (subscription.generations_remaining || 0) - 1);
      await supabase
        .from('subscriptions')
        .update({ generations_remaining: newRemaining })
        .eq('user_id', user.id)
        .eq('status', 'active');
      
      updatedRemaining = newRemaining;
    } else if (!isPro) {
      // Для бесплатных пользователей уменьшаем дневной лимит
      updatedRemaining = remaining - 1;
    }

    logger.info('Generate API completed successfully', requestId, { 
      scenario, 
      tone, 
      channel, 
      detectedLang: targetLang,
      excuseId: excuse?.id 
    });

    return NextResponse.json({
      success: true,
      text: resultText,
      rarity: rarity,
      excuse_id: excuse?.id,
      requestId,
      limits: {
        remaining: updatedRemaining,
        nextResetAt,
      },
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

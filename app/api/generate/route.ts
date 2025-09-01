import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@/lib/supabase-server';
import { SYSTEM_PROMPT, generateUserPrompt } from '@/lib/prompts';
import { rateLimit } from '@/lib/rate-limit';
import { logger, getRequestId, createErrorResponse, ErrorCodes } from '@/lib/logger';
import { serverEnv } from '@/lib/env';
import { getWarsawDateString, nextMidnightZonedISO } from '@/lib/time-warsaw';
import { pickRarity } from '@/lib/rarity';
import { getCurrentServerTime, getTodayBoundaries } from '@/lib/time-validation';

// Node.js runtime для работы с OpenAI и Supabase
export const runtime = 'nodejs';

const openai = new OpenAI({
  apiKey: serverEnv.OPENAI_API_KEY,
});

// Server-side language detection function
function detectLanguage(text: string): string {
  const t = (text || '').trim();
  if (!t) return 'en';
  
  // More accurate language detection
  const patterns = [
    { lang: 'ru', pattern: /[а-яё]/i, weight: 3 },
    { lang: 'pl', pattern: /[ąćęłńóśźż]/i, weight: 3 },
    { lang: 'de', pattern: /[äöüß]/i, weight: 2 },
    { lang: 'fr', pattern: /[àâçéèêëîïôûùüÿœ]/i, weight: 2 },
    { lang: 'es', pattern: /[ñáéíóúü¿¡]/i, weight: 2 },
    { lang: 'it', pattern: /[àèéìíîòóù]/i, weight: 1 },
    { lang: 'pt', pattern: /[ãâáàçéêíóôõú]/i, weight: 1 }
  ];
  
  let bestLang = 'en';
  let bestScore = 0;
  
  for (const { lang, pattern, weight } of patterns) {
    const matches = (t.match(pattern) || []).length;
    const score = matches * weight;
    if (score > bestScore) {
      bestScore = score;
      bestLang = lang;
    }
  }
  
  // Additional context-based detection
  const lowerText = t.toLowerCase();
  if (lowerText.includes('polski') || lowerText.includes('polsce') || lowerText.includes('polak')) return 'pl';
  if (lowerText.includes('russian') || lowerText.includes('россия') || lowerText.includes('русский')) return 'ru';
  if (lowerText.includes('spanish') || lowerText.includes('español') || lowerText.includes('españa')) return 'es';
  if (lowerText.includes('german') || lowerText.includes('deutsch') || lowerText.includes('deutschland')) return 'de';
  if (lowerText.includes('french') || lowerText.includes('français') || lowerText.includes('france')) return 'fr';
  
  return bestLang;
}

export async function POST(request: NextRequest) {
  if (process.env.ENV_MODE === 'ci') {
    // никакой сети в CI
    throw new Error('Network calls are disabled in CI');
  }
  
  const requestId = getRequestId(request);
  logger.info('Generate API started', requestId);
  
  try {
    const { scenario, tone, channel, lang, context, generateAudio } = await request.json();
    
    // Валидация входных данных
    if (!scenario || !tone || !channel) {
      return createErrorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'Missing required fields',
        400,
        requestId
      );
    }

    // Use selected language or detect from text if not specified
    let targetLang = lang || 'en';
    
    // If no language specified, try to detect from text
    if (!lang) {
      const combinedText = `${scenario} ${context || ''}`.trim();
      targetLang = detectLanguage(combinedText);
    }
    
    logger.info('Language processing', requestId, { 
      scenario, 
      context, 
      selectedLang: lang,
      targetLang: targetLang 
    });

    // Получаем пользователя
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
      // Проверяем дневной лимит по серверному времени (Warsaw timezone)
      // Это защищает от манипуляций с датой на клиенте
      const { start: todayStart, end: todayEnd } = getTodayBoundaries();
      
      const { count } = await supabase
        .from('excuses')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', todayStart)
        .lte('created_at', todayEnd);

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
    // Используем серверное время для защиты от манипуляций
    const serverTime = getCurrentServerTime();
    
    const { data: excuse, error: dbError } = await supabase
      .from('excuses')
      .insert({
        user_id: user.id,
        input: { scenario, tone, channel, lang: targetLang, context },
        result_text: resultText,
        sent_via: channel,
        rarity: rarity,
        created_at: serverTime, // Явно устанавливаем серверное время
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

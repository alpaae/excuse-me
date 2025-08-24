import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createServiceClient } from '@/lib/supabase-server';
import { rateLimit } from '@/lib/rate-limit';
import { logger, getRequestId, createErrorResponse, ErrorCodes } from '@/lib/logger';
import { serverEnv } from '@/lib/env';

// Node.js runtime для работы с OpenAI и Supabase Storage
// private bucket + signed URL; не требуется настраивать RLS
export const runtime = 'nodejs';

const openai = new OpenAI({
  apiKey: serverEnv.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  const requestId = getRequestId(request);
  logger.info('TTS API started', requestId);
  
  try {
    const { text, lang = 'en', excuse_id } = await request.json();
    
    if (!text) {
      return createErrorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'Text is required',
        400,
        requestId
      );
    }

    // Получаем пользователя
    const supabase = createServiceClient();
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

    // Определяем голос на основе языка
    const voice = lang === 'ru' ? 'alloy' : 'alloy';
    
    // Генерируем TTS
    const mp3 = await openai.audio.speech.create({
      model: 'tts-1',
      voice: voice,
      input: text,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    
    // Создаем уникальное имя файла
    const timestamp = Date.now();
    const filename = `tts_${user.id}_${timestamp}.mp3`;
    
    // Загружаем файл в Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('tts')
      .upload(filename, buffer, {
        contentType: 'audio/mpeg',
        upsert: false,
      });

    if (uploadError) {
      logger.error('Storage upload error', uploadError, requestId);
      return createErrorResponse(
        ErrorCodes.SERVICE_UNAVAILABLE,
        'Failed to upload audio file',
        500,
        requestId
      );
    }

    // Генерируем signed URL на 1 час
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('tts')
      .createSignedUrl(filename, 3600); // 1 час

    if (signedUrlError) {
      logger.error('Signed URL error', signedUrlError, requestId);
      return createErrorResponse(
        ErrorCodes.SERVICE_UNAVAILABLE,
        'Failed to generate signed URL',
        500,
        requestId
      );
    }

    const ttsUrl = signedUrlData.signedUrl;

    // Обновляем запись в БД если есть excuse_id
    if (excuse_id) {
      await supabase
        .from('excuses')
        .update({ tts_url: ttsUrl })
        .eq('id', excuse_id)
        .eq('user_id', user.id);
    }

    logger.info('TTS API completed successfully', requestId, { 
      lang, 
      excuseId: excuse_id,
      filename 
    });

    return NextResponse.json({
      success: true,
      url: ttsUrl,
      requestId,
    });

  } catch (error) {
    logger.error(
      'TTS API failed',
      error instanceof Error ? error : new Error(String(error)),
      requestId
    );
    
    return createErrorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'Failed to generate audio',
      500,
      requestId
    );
  }
}

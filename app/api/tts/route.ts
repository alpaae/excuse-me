import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createServiceClient } from '@/lib/supabase-server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { text, lang = 'en', excuse_id } = await request.json();
    
    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // Получаем пользователя
    const supabase = createServiceClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
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
      console.error('Storage upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload audio file' },
        { status: 500 }
      );
    }

    // Генерируем signed URL на 1 час
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('tts')
      .createSignedUrl(filename, 3600); // 1 час

    if (signedUrlError) {
      console.error('Signed URL error:', signedUrlError);
      return NextResponse.json(
        { error: 'Failed to generate signed URL' },
        { status: 500 }
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

    return NextResponse.json({
      success: true,
      url: ttsUrl,
    });

  } catch (error) {
    console.error('TTS error:', error);
    return NextResponse.json(
      { error: 'Failed to generate audio' },
      { status: 500 }
    );
  }
}

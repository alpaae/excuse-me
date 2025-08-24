import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@/lib/supabase-server';
import { SYSTEM_PROMPT, generateUserPrompt } from '@/lib/prompts';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { scenario, tone, channel, lang, context, generateAudio } = await request.json();
    
    // Валидация входных данных
    if (!scenario || !tone || !channel || !lang) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Получаем пользователя
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
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
        return NextResponse.json(
          { error: 'FREE_LIMIT_REACHED', limit: true },
          { status: 402 }
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
      return NextResponse.json(
        { error: 'Failed to generate excuse' },
        { status: 500 }
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
      console.error('Database error:', dbError);
    }

    return NextResponse.json({
      success: true,
      text: resultText,
      excuse_id: excuse?.id,
    });

  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

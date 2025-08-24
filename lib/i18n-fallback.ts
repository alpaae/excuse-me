import OpenAI from 'openai';
import { createServiceClient } from '@/lib/supabase-server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface TranslationCache {
  id: string;
  locale: string;
  namespace: string;
  key: string;
  value: string;
  updated_at: string;
}

export async function translateWithFallback(
  text: string,
  targetLocale: string,
  sourceLocale: string = 'en',
  namespace: string = 'common'
): Promise<string> {
  const supabase = createServiceClient();

  // 1. Проверяем кеш
  const { data: cached } = await supabase
    .from('i18n_cache')
    .select('*')
    .eq('locale', targetLocale)
    .eq('namespace', namespace)
    .eq('key', text)
    .single();

  if (cached) {
    return cached.value;
  }

  // 2. Если нет в кеше, переводим через OpenAI
  try {
    const translation = await translateWithOpenAI(text, targetLocale, sourceLocale);
    
    // 3. Сохраняем в кеш
    await supabase
      .from('i18n_cache')
      .upsert({
        locale: targetLocale,
        namespace,
        key: text,
        value: translation,
        updated_at: new Date().toISOString(),
      });

    return translation;
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Возвращаем оригинальный текст при ошибке
  }
}

async function translateWithOpenAI(
  text: string,
  targetLocale: string,
  sourceLocale: string
): Promise<string> {
  const localeNames: Record<string, string> = {
    'en': 'English',
    'ru': 'Russian',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'it': 'Italian',
    'pt': 'Portuguese',
    'ja': 'Japanese',
    'ko': 'Korean',
    'zh': 'Chinese',
  };

  const sourceLang = localeNames[sourceLocale] || 'English';
  const targetLang = localeNames[targetLocale] || 'English';

  const prompt = `
Translate the following text from ${sourceLang} to ${targetLang}.
Keep the translation natural and contextually appropriate.
If the text contains placeholders like {{variable}}, preserve them exactly.

Text to translate: "${text}"

Translation:`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: 'You are a professional translator. Provide accurate and natural translations while preserving formatting and placeholders.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    max_tokens: 200,
    temperature: 0.3,
  });

  const translation = completion.choices[0]?.message?.content?.trim();
  
  if (!translation) {
    throw new Error('Failed to get translation from OpenAI');
  }

  return translation;
}

export async function getTranslation(
  key: string,
  locale: string,
  namespace: string = 'common',
  fallbackLocale: string = 'en'
): Promise<string> {
  const supabase = createServiceClient();

  // 1. Ищем перевод в запрошенной локали
  const { data: translation } = await supabase
    .from('i18n_cache')
    .select('*')
    .eq('locale', locale)
    .eq('namespace', namespace)
    .eq('key', key)
    .single();

  if (translation) {
    return translation.value;
  }

  // 2. Ищем в fallback локали
  const { data: fallbackTranslation } = await supabase
    .from('i18n_cache')
    .select('*')
    .eq('locale', fallbackLocale)
    .eq('namespace', namespace)
    .eq('key', key)
    .single();

  if (fallbackTranslation) {
    // 3. Если нашли в fallback, переводим в запрошенную локаль
    return await translateWithFallback(fallbackTranslation.value, locale, fallbackLocale, namespace);
  }

  // 4. Если нигде не нашли, возвращаем ключ
  return key;
}

export async function bulkTranslate(
  keys: string[],
  targetLocale: string,
  sourceLocale: string = 'en',
  namespace: string = 'common'
): Promise<Record<string, string>> {
  const results: Record<string, string> = {};
  
  for (const key of keys) {
    results[key] = await getTranslation(key, targetLocale, namespace, sourceLocale);
  }
  
  return results;
}

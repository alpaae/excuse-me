import { NextRequest, NextResponse } from 'next/server';

// Константы из middleware (синхронизированы)
const SUPPORTED_LOCALES = ['ru', 'en', 'pl', 'de', 'fr', 'es', 'it', 'pt', 'uk', 'zh-CN', 'ja', 'ko'] as const;
const BASE_LOCALE = 'ru';

const LOCALE_ALIASES: Record<string, string> = {
  'cn': 'zh-CN',
  'ua': 'uk',
  'pt': 'pt-PT',
  'br': 'pt-BR',
  'en-US': 'en',
  'ru-RU': 'ru',
  'russian': 'ru',
  'русский': 'ru',
  'рус': 'ru',
  'english': 'en',
  'английский': 'en',
  'polish': 'pl',
  'polski': 'pl',
  'german': 'de',
  'deutsch': 'de',
  'french': 'fr',
  'français': 'fr',
  'spanish': 'es',
  'español': 'es',
  'italian': 'it',
  'italiano': 'it',
  'portuguese': 'pt',
  'português': 'pt',
  'ukrainian': 'uk',
  'українська': 'uk',
  'chinese': 'zh-CN',
  '中文': 'zh-CN',
  'japanese': 'ja',
  '日本語': 'ja',
  'korean': 'ko',
  '한국어': 'ko',
};

/**
 * Нормализует локаль к BCP-47 формату (синхронизировано с middleware)
 */
function normalizeLocale(input: string): string {
  if (!input || typeof input !== 'string') {
    return BASE_LOCALE;
  }

  const cleaned = input.trim().toLowerCase();

  if (LOCALE_ALIASES[cleaned]) {
    return LOCALE_ALIASES[cleaned];
  }

  const bcp47Match = cleaned.match(/^([a-z]{2})(?:-([A-Z]{2}))?$/);
  if (bcp47Match) {
    const lang = bcp47Match[1];
    const region = bcp47Match[2];
    
    if (LOCALE_ALIASES[lang]) {
      return LOCALE_ALIASES[lang];
    }
    
    const normalized = region ? `${lang}-${region}` : lang;
    
    if (SUPPORTED_LOCALES.includes(normalized as any)) {
      return normalized;
    }
    
    if (SUPPORTED_LOCALES.includes(lang as any)) {
      return lang;
    }
  }

  return BASE_LOCALE;
}

export async function POST(request: NextRequest) {
  try {
    // Парсим тело запроса
    const body = await request.json();
    const { lang } = body;

    // Проверяем наличие параметра lang
    if (!lang || typeof lang !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid lang parameter' },
        { status: 400 }
      );
    }

    // Нормализуем локаль
    const normalizedLang = normalizeLocale(lang);

    // Создаем ответ с установкой cookie
    const response = new NextResponse(null, { status: 204 });

    // Устанавливаем cookie через response.cookies.set()
    response.cookies.set('excuseme_lang', normalizedLang, {
      path: '/',
      maxAge: 15552000, // 180 дней
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });

    return response;
  } catch (error) {
    console.error('Error in /api/i18n/lang:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// OPTIONS для CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

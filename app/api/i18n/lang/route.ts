import { NextRequest, NextResponse } from 'next/server';
import { normalizeLocale } from '@/lib/i18n-detect';

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

    // Устанавливаем cookie на 180 дней (15552000 секунд)
    // Path=/; Max-Age=15552000; SameSite=Lax
    const cookieValue = `excuseme_lang=${normalizedLang}; Path=/; Max-Age=15552000; SameSite=Lax`;
    response.headers.set('Set-Cookie', cookieValue);

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

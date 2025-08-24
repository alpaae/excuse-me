import { NextResponse, NextRequest } from 'next/server';

// === КОНСТАНТЫ ===

const SUPPORTED_LOCALES = ['ru', 'en', 'pl', 'de', 'fr', 'es'] as const;
const BASE_LOCALE = 'en' as const;

// Поддерживаемые алиасы локалей
const LOCALE_ALIASES: Record<string, string> = {
  'en-US': 'en',
  'en-GB': 'en',
  'ru-RU': 'ru',
  'pl-PL': 'pl',
  'de-DE': 'de',
  'fr-FR': 'fr',
  'es-ES': 'es',
};

// === УТИЛИТЫ ===

/**
 * Нормализует локаль и возвращает поддерживаемую
 */
function normalizeLocale(locale: string): string {
  if (!locale) return BASE_LOCALE;
  
  const normalized = locale.toLowerCase().trim();
  
  // Проверяем алиасы
  if (LOCALE_ALIASES[normalized]) {
    return LOCALE_ALIASES[normalized];
  }
  
  // Проверяем прямое соответствие
  if (SUPPORTED_LOCALES.includes(normalized as any)) {
    return normalized;
  }
  
  // Проверяем по первой части (en-US -> en)
  const languageCode = normalized.split('-')[0];
  if (SUPPORTED_LOCALES.includes(languageCode as any)) {
    return languageCode;
  }
  
  return BASE_LOCALE;
}

/**
 * Парсит заголовок Accept-Language и возвращает наиболее подходящую локаль
 */
function parseAcceptLanguage(acceptLanguage: string): string | null {
  if (!acceptLanguage) return null;
  
  try {
    const languages = acceptLanguage
      .split(',')
      .map(lang => {
        const [locale, q = '1'] = lang.trim().split(';q=');
        return {
          locale: locale.trim(),
          quality: parseFloat(q)
        };
      })
      .filter(lang => !isNaN(lang.quality))
      .sort((a, b) => b.quality - a.quality);
    
    for (const { locale } of languages) {
      const normalized = normalizeLocale(locale);
      if (SUPPORTED_LOCALES.includes(normalized as any)) {
        return normalized;
      }
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

// === MIDDLEWARE ===

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const pathname = url.pathname;
  
  // Пропускаем статические файлы и API роуты
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/fonts/') ||
    pathname.startsWith('/images/') ||
    pathname === '/favicon.ico' ||
    pathname === '/manifest.webmanifest' ||
    pathname === '/sw.js' ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }
  
  console.log(`[Middleware] ${request.method} ${pathname}`);
  
  const searchParams = url.searchParams;
  
  // === МИГРАЦИЯ lng → lang ===
  if (searchParams.has('lng') && !searchParams.has('lang')) {
    const val = normalizeLocale(searchParams.get('lng') || '');
    searchParams.delete('lng');
    searchParams.set('lang', val);
    
    const response = NextResponse.redirect(url, 307);
    response.cookies.set('excuseme_lang', val, {
      path: '/',
      maxAge: 60 * 60 * 24 * 180, // 180 дней
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });
    
    console.log(`[Middleware] Redirect lng→lang: ${searchParams.get('lng')} → ${val}`);
    return response;
  }
  
  // === ОПРЕДЕЛЕНИЕ ЭФФЕКТИВНОЙ ЛОКАЛИ ===
  const fromQuery = searchParams.get('lang');
  const fromCookie = request.cookies.get('excuseme_lang')?.value;
  const fromAccept = parseAcceptLanguage(request.headers.get('accept-language') || '');
  const effective = normalizeLocale(fromQuery || fromCookie || fromAccept || BASE_LOCALE);
  
  console.log(`[Middleware] Locale resolution: query=${fromQuery}, cookie=${fromCookie}, accept=${fromAccept}, effective=${effective}`);
  
  // === ПРОКИДЫВАЕМ ЛОКАЛЬ ЧЕРЕЗ ЗАГОЛОВОК ===
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-locale', effective);
  
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  
  // Устанавливаем cookie
  response.cookies.set('excuseme_lang', effective, {
    path: '/',
    maxAge: 60 * 60 * 24 * 180, // 180 дней
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  });
  
  return response;
}

export const config = {
  matcher: ['/((?!_next|api|fonts|images|favicon\\.ico|manifest\\.webmanifest|sw\\.js).*)'],
};
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// === КОНСТАНТЫ ===

// Поддерживаемые языки
const SUPPORTED_LOCALES = ['ru', 'en', 'pl', 'de', 'fr', 'es', 'it', 'pt', 'uk', 'zh-CN', 'ja', 'ko'] as const;
const BASE_LOCALE = 'ru';

// Алиасы языков
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

// Игнорируемые пути
const IGNORED_PATHS = [
  '/api',
  '/_next',
  '/fonts',
  '/images',
  '/favicon.',
  '/manifest.webmanifest',
  '/sw.js',
];

// === УТИЛИТЫ ===

/**
 * Нормализует локаль к BCP-47 формату
 * @param input - входная строка локали
 * @returns нормализованная локаль или BASE_LOCALE
 */
function normalizeLocale(input: string): string {
  if (!input || typeof input !== 'string') {
    return BASE_LOCALE;
  }

  // Очищаем и приводим к нижнему регистру
  const cleaned = input.trim().toLowerCase();

  // Проверяем алиасы
  if (LOCALE_ALIASES[cleaned]) {
    return LOCALE_ALIASES[cleaned];
  }

  // Проверяем BCP-47 формат (xx или xx-YY)
  const bcp47Match = cleaned.match(/^([a-z]{2})(?:-([A-Z]{2}))?$/);
  if (bcp47Match) {
    const lang = bcp47Match[1];
    const region = bcp47Match[2];
    
    // Проверяем алиасы для языка
    if (LOCALE_ALIASES[lang]) {
      return LOCALE_ALIASES[lang];
    }
    
    // Формируем BCP-47 код
    const normalized = region ? `${lang}-${region}` : lang;
    
    // Проверяем поддержку
    if (SUPPORTED_LOCALES.includes(normalized as any)) {
      return normalized;
    }
    
    // Если регион не поддерживается, пробуем только язык
    if (SUPPORTED_LOCALES.includes(lang as any)) {
      return lang;
    }
  }

  // Fallback к базовой локали
  return BASE_LOCALE;
}

/**
 * Парсит Accept-Language заголовок и возвращает первую поддерживаемую локаль
 * @param header - значение Accept-Language заголовка
 * @returns поддерживаемая локаль или null
 */
function parseAcceptLanguage(header: string): string | null {
  if (!header || typeof header !== 'string') {
    return null;
  }

  try {
    // Парсим языки с качеством: "ru-RU,ru;q=0.9,en;q=0.8"
    const languages = header
      .split(',')
      .map(lang => {
        const [code, quality] = lang.trim().split(';q=');
        return {
          code: code.trim(),
          quality: quality ? parseFloat(quality) : 1.0
        };
      })
      .filter(lang => lang.code && !isNaN(lang.quality))
      .sort((a, b) => b.quality - a.quality); // Сортируем по качеству

    // Ищем первую поддерживаемую локаль
    for (const lang of languages) {
      const normalized = normalizeLocale(lang.code);
      if (normalized !== BASE_LOCALE || lang.code.toLowerCase().startsWith('ru')) {
        return normalized;
      }
    }

    return null;
  } catch (error) {
    console.warn('Error parsing Accept-Language header:', error);
    return null;
  }
}

/**
 * Проверяет, должен ли путь игнорироваться middleware
 * @param pathname - путь запроса
 * @returns true если путь должен игнорироваться
 */
function shouldIgnorePath(pathname: string): boolean {
  return IGNORED_PATHS.some(ignored => pathname.startsWith(ignored));
}

/**
 * Создает cookie строку для установки локали
 * @param locale - локаль для установки
 * @param isProduction - флаг продакшена
 * @returns строка cookie
 */
function createLocaleCookie(locale: string, isProduction: boolean): string {
  const base = `excuseme_lang=${locale}; Path=/; Max-Age=15552000; SameSite=Lax`;
  return isProduction ? `${base}; Secure` : base;
}

// === MATCHER КОНФИГУРАЦИЯ ===
export const config = {
  matcher: [
    // Исключаем статические файлы и API
    '/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|api).*)',
  ],
};

// === MIDDLEWARE ===
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // === ЛОГИРОВАНИЕ ===
  console.log(`[Middleware] ${request.method} ${pathname}`);
  
  // === ПРОВЕРКА ИГНОРИРУЕМЫХ ПУТЕЙ ===
  if (shouldIgnorePath(pathname)) {
    return NextResponse.next();
  }
  
  // === CORS ДЛЯ API ===
  if (pathname.startsWith('/api/')) {
    const response = NextResponse.next();
    
    // Добавляем CORS заголовки для API
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Обрабатываем preflight запросы
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 200, headers: response.headers });
    }
    
    return response;
  }
  
  // === I18N ОБРАБОТКА ===
  
  // Получаем текущий cookie
  const currentCookie = request.cookies.get('excuseme_lang')?.value;
  
  // Проверяем query параметры
  const queryLang = request.nextUrl.searchParams.get('lang');
  const queryLng = request.nextUrl.searchParams.get('lng');
  
  // Определяем продакшен
  const isProduction = request.nextUrl.protocol === 'https:' || process.env.NODE_ENV === 'production';
  
  // === МИГРАЦИЯ lng → lang ===
  if (queryLng && !queryLang) {
    // Нормализуем значение
    const normalizedLang = normalizeLocale(queryLng);
    
    // Создаем новый URL с ?lang и без ?lng
    const newUrl = new URL(request.url);
    newUrl.searchParams.delete('lng');
    newUrl.searchParams.set('lang', normalizedLang);
    
    // Создаем ответ с редиректом
    const response = NextResponse.redirect(newUrl, 307);
    
    // Устанавливаем cookie
    const cookieValue = createLocaleCookie(normalizedLang, isProduction);
    response.headers.set('Set-Cookie', cookieValue);
    
    console.log(`[Middleware] Redirect lng→lang: ${queryLng} → ${normalizedLang}`);
    return response;
  }
  
  // === ОБРАБОТКА ?lang ===
  if (queryLang) {
    const normalizedLang = normalizeLocale(queryLang);
    const response = NextResponse.next();
    
    // Устанавливаем cookie
    const cookieValue = createLocaleCookie(normalizedLang, isProduction);
    response.headers.set('Set-Cookie', cookieValue);
    
    console.log(`[Middleware] Set cookie from ?lang: ${normalizedLang}`);
    
    // Добавляем security headers
    addSecurityHeaders(response, isProduction);
    return response;
  }
  
  // === ДЕТЕКТ ПО Accept-Language ===
  if (!currentCookie) {
    const acceptLanguage = request.headers.get('accept-language');
    
    if (acceptLanguage) {
      const detectedLang = parseAcceptLanguage(acceptLanguage);
      
      if (detectedLang) {
        const response = NextResponse.next();
        
        // Устанавливаем cookie
        const cookieValue = createLocaleCookie(detectedLang, isProduction);
        response.headers.set('Set-Cookie', cookieValue);
        
        console.log(`[Middleware] Set cookie from Accept-Language: ${detectedLang}`);
        
        // Добавляем security headers
        addSecurityHeaders(response, isProduction);
        return response;
      }
    }
  }
  
  // === DEFAULT RESPONSE ===
  const response = NextResponse.next();
  addSecurityHeaders(response, isProduction);
  return response;
}

/**
 * Добавляет security headers к ответу
 * @param response - объект ответа
 * @param isProduction - флаг продакшена
 */
function addSecurityHeaders(response: NextResponse, isProduction: boolean): void {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // HSTS для HTTPS
  if (isProduction) {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
}

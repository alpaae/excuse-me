import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { normalizeLocale, parseAcceptLanguage } from './lib/i18n-detect';

// === MATCHER КОНФИГУРАЦИЯ ===
// Next.js 15: используем современные паттерны без устаревших
export const config = {
  matcher: [
    // API роуты (кроме статических файлов)
    '/api/((?!_next/static|_next/image|favicon.ico).*)',
    // Страницы приложения (только /(web) и корень)
    '/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|api).*)',
  ],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // === ЛОГИРОВАНИЕ ===
  console.log(`[Middleware] ${request.method} ${pathname}`);
  
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
  
  // === I18N СИНХРОНИЗАЦИЯ ===
  // Только для путей /(web) и корня
  if (pathname === '/' || pathname.startsWith('/(web)') || pathname === '/dashboard' || pathname === '/account') {
    const response = NextResponse.next();
    
    // Получаем текущий cookie
    const currentCookie = request.cookies.get('excuseme_lang')?.value;
    
    // Проверяем query параметр ?lang
    const queryLang = request.nextUrl.searchParams.get('lang') || request.nextUrl.searchParams.get('lng');
    
    if (queryLang) {
      // Если есть ?lang → normalizeLocale → установить cookie
      const normalizedLang = normalizeLocale(queryLang);
      
      // Устанавливаем cookie на 180 дней (15552000 секунд)
      const cookieValue = `excuseme_lang=${normalizedLang}; Path=/; Max-Age=15552000; SameSite=Lax`;
      
      // Добавляем Set-Cookie заголовок
      response.headers.set('Set-Cookie', cookieValue);
      
      console.log(`[Middleware] Set cookie from query: ${normalizedLang}`);
    } else if (!currentCookie) {
      // Если нет ?lang и нет cookie → определить по Accept-Language
      const acceptLanguage = request.headers.get('accept-language');
      
      if (acceptLanguage) {
        const detectedLang = parseAcceptLanguage(acceptLanguage);
        
        if (detectedLang) {
          // Устанавливаем cookie на 180 дней
          const cookieValue = `excuseme_lang=${detectedLang}; Path=/; Max-Age=15552000; SameSite=Lax`;
          
          // Добавляем Set-Cookie заголовок
          response.headers.set('Set-Cookie', cookieValue);
          
          console.log(`[Middleware] Set cookie from Accept-Language: ${detectedLang}`);
        }
      }
    }
    // Если есть cookie, но нет ?lang → ничего не делаем (сохраняем существующий выбор)
    
    // === БЕЗОПАСНОСТЬ ===
    // Добавляем security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // HSTS для HTTPS
    if (request.nextUrl.protocol === 'https:') {
      response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    
    return response;
  }
  
  // === РЕДИРЕКТЫ ===
  
  // Telegram Mini App редирект
  if (pathname === '/tg') {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // === БЕЗОПАСНОСТЬ ДЛЯ ОСТАЛЬНЫХ ПУТЕЙ ===
  
  // Добавляем security headers для всех остальных запросов
  const response = NextResponse.next();
  
  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // HSTS для HTTPS
  if (request.nextUrl.protocol === 'https:') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  return response;
}

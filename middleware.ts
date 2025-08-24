import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// === MATCHER КОНФИГУРАЦИЯ ===
// Next.js 15: используем современные паттерны без устаревших
export const config = {
  matcher: [
    // API роуты (кроме статических файлов)
    '/api/((?!_next/static|_next/image|favicon.ico).*)',
    // Страницы приложения
    '/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest).*)',
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
  
  // === РЕДИРЕКТЫ ===
  
  // Telegram Mini App редирект
  if (pathname === '/tg') {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // === БЕЗОПАСНОСТЬ ===
  
  // Добавляем security headers для всех запросов
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

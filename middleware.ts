import { NextResponse, NextRequest } from 'next/server';
import { normalizeLocale, parseAcceptLanguage } from '@/lib/i18n-detect';

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const sp = url.searchParams;

  // Логирование для отладки
  console.log('[Middleware] URL:', req.url);
  console.log('[Middleware] Accept-Language:', req.headers.get('accept-language'));

  if (sp.has('lng') && !sp.has('lang')) {
    const val = normalizeLocale(sp.get('lng') || '');
    console.log('[Middleware] Redirecting lng -> lang:', val);
    sp.delete('lng'); sp.set('lang', val);
    const res = NextResponse.redirect(url, 307);
    res.cookies.set('excuseme_lang', val, { path:'/', maxAge:60*60*24*180, sameSite:'lax', secure:process.env.NODE_ENV==='production' });
    return res;
  }

  const fromQuery = sp.get('lang');
  const fromCookie = req.cookies.get('excuseme_lang')?.value;
  const fromAccept = parseAcceptLanguage(req.headers.get('accept-language') || '');
  const effective = normalizeLocale(fromQuery || fromCookie || fromAccept || 'en');

  console.log('[Middleware] Locale sources:', { fromQuery, fromCookie, fromAccept, effective });

  const reqHeaders = new Headers(req.headers);
  reqHeaders.set('x-locale', effective);

  const res = NextResponse.next({ request: { headers: reqHeaders } });
  res.cookies.set('excuseme_lang', effective, { path:'/', maxAge:60*60*24*180, sameSite:'lax', secure:process.env.NODE_ENV==='production' });
  return res;
}

export const config = {
  matcher: ['/((?!_next|api|fonts|images|favicon\\.ico|manifest\\.webmanifest|sw\\.js).*)'],
};
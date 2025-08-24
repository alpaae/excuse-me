import { cookies } from 'next/headers';
import { detectLanguage, normalizeLocale } from './i18n-detect';

export async function getLanguageFromRequest(request: Request): Promise<string> {
  const url = new URL(request.url);
  // Приоритет: lang > lng
  const queryLang = url.searchParams.get('lang') || url.searchParams.get('lng');
  
  const cookieStore = await cookies();
  // Новый cookie: excuseme_lang
  const cookieLang = cookieStore.get('excuseme_lang')?.value || cookieStore.get('i18nextLng')?.value;
  
  const acceptLanguage = request.headers.get('accept-language');

  return detectLanguage({
    query: queryLang || undefined,
    cookie: cookieLang || undefined,
    acceptLanguage: acceptLanguage || undefined,
  });
}

/**
 * Получает локаль из cookie на сервере
 * @returns нормализованная локаль или null
 */
export async function getLanguageFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  const cookieLang = cookieStore.get('excuseme_lang')?.value || cookieStore.get('i18nextLng')?.value;
  
  if (cookieLang) {
    return normalizeLocale(cookieLang);
  }
  
  return null;
}

import { cookies } from 'next/headers';
import { detectLanguage } from './i18n-detect';

export async function getLanguageFromRequest(request: Request): Promise<string> {
  const url = new URL(request.url);
  // Поддерживаем оба параметра: lang и lng
  const queryLang = url.searchParams.get('lang') || url.searchParams.get('lng');
  
  const cookieStore = await cookies();
  const cookieLang = cookieStore.get('i18nextLng')?.value;
  
  const acceptLanguage = request.headers.get('accept-language');

  return detectLanguage({
    query: queryLang || undefined,
    cookie: cookieLang || undefined,
    acceptLanguage: acceptLanguage || undefined,
  });
}

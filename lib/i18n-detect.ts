import { cookies } from 'next/headers';

export interface LanguageDetectOptions {
  query?: string;
  cookie?: string;
  telegramLanguage?: string;
  acceptLanguage?: string;
  defaultLanguage?: string;
}

export function detectLanguage(options: LanguageDetectOptions = {}): string {
  const {
    query,
    cookie,
    telegramLanguage,
    acceptLanguage,
    defaultLanguage = 'en'
  } = options;

  // 1. Query parameter (highest priority)
  if (query) {
    const lang = query.toLowerCase().trim();
    if (isValidLanguage(lang)) {
      return lang;
    }
  }

  // 2. Cookie
  if (cookie) {
    const lang = cookie.toLowerCase().trim();
    if (isValidLanguage(lang)) {
      return lang;
    }
  }

  // 3. Telegram language_code
  if (telegramLanguage) {
    const lang = telegramLanguage.toLowerCase().trim();
    if (isValidLanguage(lang)) {
      return lang;
    }
  }

  // 4. Accept-Language header
  if (acceptLanguage) {
    const lang = parseAcceptLanguage(acceptLanguage);
    if (lang) {
      return lang;
    }
  }

  // 5. Default
  return defaultLanguage;
}

export function isValidLanguage(lang: string): boolean {
  const supportedLanguages = ['en', 'ru', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'ko', 'zh'];
  return supportedLanguages.includes(lang);
}

export function parseAcceptLanguage(acceptLanguage: string): string | null {
  // Parse Accept-Language header like "en-US,en;q=0.9,ru;q=0.8"
  const languages = acceptLanguage
    .split(',')
    .map(lang => {
      const [code, quality = '1'] = lang.trim().split(';q=');
      return {
        code: code.split('-')[0].toLowerCase(), // Get primary language code
        quality: parseFloat(quality)
      };
    })
    .sort((a, b) => b.quality - a.quality);

  // Find first supported language
  for (const lang of languages) {
    if (isValidLanguage(lang.code)) {
      return lang.code;
    }
  }

  return null;
}

export async function getLanguageFromRequest(request: Request): Promise<string> {
  const url = new URL(request.url);
  const queryLang = url.searchParams.get('lng');
  
  const cookieStore = await cookies();
  const cookieLang = cookieStore.get('i18nextLng')?.value;
  
  const acceptLanguage = request.headers.get('accept-language');

  return detectLanguage({
    query: queryLang || undefined,
    cookie: cookieLang || undefined,
    acceptLanguage: acceptLanguage || undefined,
  });
}

export function setLanguageCookie(lang: string): void {
  // This would be used in client-side to set the cookie
  document.cookie = `i18nextLng=${lang}; path=/; max-age=31536000`; // 1 year
}

import { headers } from 'next/headers';
import { I18nProvider } from './i18n-provider';

// Константы из middleware
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
 * Нормализует локаль к BCP-47 формату (копия из middleware)
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

/**
 * Парсит Accept-Language заголовок (копия из middleware)
 */
function parseAcceptLanguage(header: string): string | null {
  if (!header || typeof header !== 'string') {
    return null;
  }

  try {
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
      .sort((a, b) => b.quality - a.quality);

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
 * Определяет текущую локаль на сервере
 */
function resolveLocaleServer(headersList: Headers): string {
  try {
    // 1. Проверяем cookie
    const cookieHeader = headersList.get('cookie');
    if (cookieHeader) {
      const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
        const [name, value] = cookie.trim().split('=');
        if (name && value) {
          acc[name] = value;
        }
        return acc;
      }, {} as Record<string, string>);
      
      const cookieLang = cookies['excuseme_lang'];
      if (cookieLang) {
        const normalized = normalizeLocale(cookieLang);
        if (SUPPORTED_LOCALES.includes(normalized as any)) {
          return normalized;
        }
      }
    }

    // 2. Проверяем Accept-Language заголовок
    const acceptLanguage = headersList.get('accept-language');
    if (acceptLanguage) {
      const detected = parseAcceptLanguage(acceptLanguage);
      if (detected) {
        return detected;
      }
    }

    // 3. Fallback к базовой локали
    return BASE_LOCALE;
  } catch (error) {
    console.warn('Error in resolveLocaleServer:', error);
    return BASE_LOCALE;
  }
}

interface I18nProviderServerProps {
  children: React.ReactNode;
}

export async function I18nProviderServer({ children }: I18nProviderServerProps) {
  // Получаем заголовки
  const headersList = await headers();
  
  // Определяем локаль на сервере
  const initialLocale = resolveLocaleServer(headersList);

  return (
    <I18nProvider initialLocale={initialLocale}>
      {children}
    </I18nProvider>
  );
}

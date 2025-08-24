// BCP-47 Language Tag Aliases
// Маппинг алиасов к стандартным BCP-47 тегам
const LOCALE_ALIASES: Record<string, string> = {
  // Китайский
  'cn': 'zh-CN',
  'zh-cn': 'zh-CN',
  'zh_cn': 'zh-CN',
  
  // Украинский
  'ua': 'uk',
  'ukraine': 'uk',
  
  // Португальский
  'pt': 'pt-PT',
  'pt-pt': 'pt-PT',
  'portugal': 'pt-PT',
  'br': 'pt-BR',
  'pt-br': 'pt-BR',
  'brazil': 'pt-BR',
  
  // Английский
  'en': 'en',
  'en-us': 'en',
  'en-US': 'en',
  'us': 'en',
  'usa': 'en',
  
  // Русский
  'ru': 'ru',
  'ru-ru': 'ru',
  'ru-RU': 'ru',
  'russian': 'ru',
  'русский': 'ru',
  'рус': 'ru',
  
  // Испанский
  'es': 'es',
  'es-es': 'es',
  'spanish': 'es',
  'esp': 'es',
  
  // Французский
  'fr': 'fr',
  'fr-fr': 'fr',
  'french': 'fr',
  'fra': 'fr',
  
  // Немецкий
  'de': 'de',
  'de-de': 'de',
  'german': 'de',
  'deu': 'de',
  
  // Итальянский
  'it': 'it',
  'it-it': 'it',
  'italian': 'it',
  'ita': 'it',
  
  // Японский
  'ja': 'ja',
  'ja-jp': 'ja',
  'japanese': 'ja',
  'jpn': 'ja',
  
  // Корейский
  'ko': 'ko',
  'ko-kr': 'ko',
  'korean': 'ko',
  'kor': 'ko',
};

// Поддерживаемые локали (BCP-47)
const SUPPORTED_LOCALES = [
  'en',      // English
  'ru',      // Russian
  'es',      // Spanish
  'fr',      // French
  'de',      // German
  'it',      // Italian
  'pt-PT',   // Portuguese (Portugal)
  'pt-BR',   // Portuguese (Brazil)
  'ja',      // Japanese
  'ko',      // Korean
  'zh-CN',   // Chinese (Simplified)
  'uk',      // Ukrainian
];

// Базовая локаль (fallback)
const BASE_LOCALE = 'ru';

export interface LanguageDetectOptions {
  query?: string;
  cookie?: string;
  telegramLanguage?: string;
  acceptLanguage?: string;
  defaultLanguage?: string;
}

/**
 * Нормализует локаль к BCP-47 формату
 * @param input - входная строка локали
 * @returns нормализованная локаль
 */
export function normalizeLocale(input: string): string {
  if (!input || typeof input !== 'string') {
    return BASE_LOCALE;
  }

  // Очищаем и приводим к lowercase
  const cleaned = input.trim().toLowerCase();
  
  // Проверяем алиасы
  if (LOCALE_ALIASES[cleaned]) {
    return LOCALE_ALIASES[cleaned];
  }
  
  // Проверяем точное совпадение
  if (SUPPORTED_LOCALES.includes(cleaned)) {
    return cleaned;
  }
  
  // Пытаемся нормализовать BCP-47 формат
  const parts = cleaned.split('-');
  const language = parts[0];
  const region = parts[1]?.toUpperCase();
  
  // Собираем BCP-47 тег
  const bcp47 = region ? `${language}-${region}` : language;
  
  // Проверяем алиасы для BCP-47
  if (LOCALE_ALIASES[bcp47.toLowerCase()]) {
    return LOCALE_ALIASES[bcp47.toLowerCase()];
  }
  
  // Проверяем поддержку
  if (SUPPORTED_LOCALES.includes(bcp47)) {
    return bcp47;
  }
  
  // Fallback к базовой локали
  return BASE_LOCALE;
}

/**
 * Проверяет, поддерживается ли локаль
 * @param locale - локаль для проверки
 * @returns true если локаль поддерживается
 */
export function isValidLocale(locale: string): boolean {
  const normalized = normalizeLocale(locale);
  return SUPPORTED_LOCALES.includes(normalized);
}

/**
 * Парсит Accept-Language заголовок
 * @param acceptLanguage - строка Accept-Language
 * @returns нормализованная локаль или null
 */
export function parseAcceptLanguage(acceptLanguage: string): string | null {
  if (!acceptLanguage) return null;

  try {
    // Парсим "en-US,en;q=0.9,ru;q=0.8"
    const languages = acceptLanguage
      .split(',')
      .map(lang => {
        const [code, quality = '1'] = lang.trim().split(';q=');
        return {
          code: code.trim(),
          quality: parseFloat(quality)
        };
      })
      .sort((a, b) => b.quality - a.quality);

    // Ищем первую поддерживаемую локаль
    for (const lang of languages) {
      const normalized = normalizeLocale(lang.code);
      if (SUPPORTED_LOCALES.includes(normalized)) {
        return normalized;
      }
    }

    // Специальная обработка для русского языка
    // Если Accept-Language начинается с 'ru', но не найден в поддерживаемых
    const firstLang = languages[0]?.code?.toLowerCase();
    if (firstLang && firstLang.startsWith('ru')) {
      return 'ru'; // Принудительно используем русский
    }
  } catch (error) {
    console.warn('Failed to parse Accept-Language:', acceptLanguage, error);
  }

  return null;
}

/**
 * Детектирует язык по приоритету источников
 * @param options - опции детекта
 * @returns нормализованная локаль
 */
export function detectLanguage(options: LanguageDetectOptions = {}): string {
  const {
    query,
    cookie,
    telegramLanguage,
    acceptLanguage,
    defaultLanguage = BASE_LOCALE
  } = options;

  // 1. Query parameter (highest priority)
  if (query) {
    try {
      // Безопасно декодируем и нормализуем
      const decodedValue = decodeURIComponent(query);
      const normalized = normalizeLocale(decodedValue);
      if (SUPPORTED_LOCALES.includes(normalized)) {
        return normalized;
      }
    } catch (error) {
      // При ошибке декодирования игнорируем query параметр
      console.warn('Failed to decode query parameter:', query, error);
    }
  }

  // 2. Cookie (excuseme_lang)
  if (cookie) {
    const normalized = normalizeLocale(cookie);
    if (SUPPORTED_LOCALES.includes(normalized)) {
      return normalized;
    }
  }

  // 3. Telegram language_code
  if (telegramLanguage) {
    const normalized = normalizeLocale(telegramLanguage);
    if (SUPPORTED_LOCALES.includes(normalized)) {
      return normalized;
    }
  }

  // 4. Accept-Language header
  if (acceptLanguage) {
    const detected = parseAcceptLanguage(acceptLanguage);
    if (detected) {
      return detected;
    }
  }

  // 5. Default
  return normalizeLocale(defaultLanguage);
}

/**
 * Устанавливает cookie для локали
 * @param locale - локаль для сохранения
 * @param days - количество дней (по умолчанию 180)
 */
export function setLanguageCookie(locale: string, days: number = 180): void {
  if (typeof document === 'undefined') return; // SSR

  const normalized = normalizeLocale(locale);
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  
  document.cookie = `excuseme_lang=${normalized}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
}

/**
 * Получает локаль из cookie
 * @returns локаль из cookie или null
 */
export function getLanguageCookie(): string | null {
  if (typeof document === 'undefined') return null; // SSR

  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'excuseme_lang' && value) {
      return normalizeLocale(value);
    }
  }
  return null;
}

/**
 * Обновляет URL с параметром lang
 * @param locale - локаль для установки
 */
export function updateLanguageQuery(locale: string): void {
  if (typeof window === 'undefined') return; // SSR

  const normalized = normalizeLocale(locale);
  const url = new URL(window.location.href);
  
  if (normalized === BASE_LOCALE) {
    url.searchParams.delete('lang');
  } else {
    // Безопасно кодируем значение для URL
    const encodedValue = encodeURIComponent(normalized);
    url.searchParams.set('lang', encodedValue);
  }
  
  // Удаляем старые параметры
  url.searchParams.delete('lng');
  
  window.history.replaceState({}, '', url.toString());
}

/**
 * Безопасно читает параметр lang из URL
 * @param url - URL для парсинга
 * @returns нормализованная локаль или null
 */
export function getLanguageFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const langParam = urlObj.searchParams.get('lang') || urlObj.searchParams.get('lng');
    
    if (!langParam) {
      return null;
    }

    // Декодируем параметр
    const decodedValue = decodeURIComponent(langParam);
    
    // Нормализуем и проверяем
    const normalized = normalizeLocale(decodedValue);
    
    // Проверяем, что нормализованная локаль поддерживается
    if (SUPPORTED_LOCALES.includes(normalized)) {
      return normalized;
    }
    
    // Если не поддерживается, возвращаем базовую локаль
    return BASE_LOCALE;
  } catch (error) {
    // При любой ошибке (невалидный URL, невалидное кодирование) возвращаем базовую локаль
    console.warn('Failed to parse language from URL:', url, error);
    return BASE_LOCALE;
  }
}

/**
 * Синхронизирует локаль между cookie и query
 * @param locale - локаль для синхронизации
 */
export function syncLanguage(locale: string): void {
  const normalized = normalizeLocale(locale);
  setLanguageCookie(normalized, 180); // 180 дней
  updateLanguageQuery(normalized);
}

// Экспортируем константы для тестов
export const I18N_CONSTANTS = {
  LOCALE_ALIASES,
  SUPPORTED_LOCALES,
  BASE_LOCALE,
} as const;

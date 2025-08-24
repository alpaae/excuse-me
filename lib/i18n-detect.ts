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
    const lang = normalizeLanguage(query);
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

// Поддерживаемые языки и их алиасы
const LANGUAGE_ALIASES: Record<string, string> = {
  // Алиасы для русского
  'ru': 'ru',
  'russian': 'ru',
  'русский': 'ru',
  'рус': 'ru',
  
  // Алиасы для английского
  'en': 'en',
  'english': 'en',
  'eng': 'en',
  
  // Алиасы для других языков
  'es': 'es',
  'spanish': 'es',
  'esp': 'es',
  'fr': 'fr',
  'french': 'fr',
  'fra': 'fr',
  'de': 'de',
  'german': 'de',
  'deu': 'de',
  'it': 'it',
  'italian': 'it',
  'ita': 'it',
  'pt': 'pt',
  'portuguese': 'pt',
  'por': 'pt',
  'ja': 'ja',
  'japanese': 'ja',
  'jpn': 'ja',
  'ko': 'ko',
  'korean': 'ko',
  'kor': 'ko',
  'zh': 'zh',
  'chinese': 'zh',
  'zho': 'zh',
};

// Базовые поддерживаемые языки
const SUPPORTED_LANGUAGES = ['en', 'ru', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'ko', 'zh'];

export function normalizeLanguage(lang: string): string {
  const normalized = lang.toLowerCase().trim();
  return LANGUAGE_ALIASES[normalized] || normalized;
}

export function isValidLanguage(lang: string): boolean {
  const normalized = normalizeLanguage(lang);
  return SUPPORTED_LANGUAGES.includes(normalized);
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



export function setLanguageCookie(lang: string): void {
  // This would be used in client-side to set the cookie
  document.cookie = `i18nextLng=${lang}; path=/; max-age=31536000`; // 1 year
}

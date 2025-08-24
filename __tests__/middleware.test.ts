/**
 * Unit тесты для middleware функций
 * 
 * Тестируем:
 * - normalizeLocale - нормализация локалей
 * - parseAcceptLanguage - парсинг Accept-Language заголовка
 * - shouldIgnorePath - проверка игнорируемых путей
 * - createLocaleCookie - создание cookie строки
 */

// Мокаем Next.js типы для тестирования
const mockNextRequest = (url: string, headers: Record<string, string> = {}) => ({
  nextUrl: new URL(url),
  headers: {
    get: (name: string) => headers[name] || null,
  },
  cookies: {
    get: (name: string) => null,
  },
  method: 'GET',
});

describe('Middleware Functions', () => {
  // Импортируем функции из middleware (в реальном проекте нужно будет экспортировать)
  // Для тестирования копируем логику
  
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
  
  const IGNORED_PATHS = [
    '/api',
    '/_next',
    '/fonts',
    '/images',
    '/favicon.',
    '/manifest.webmanifest',
    '/sw.js',
  ];

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

  function shouldIgnorePath(pathname: string): boolean {
    return IGNORED_PATHS.some(ignored => pathname.startsWith(ignored));
  }

  function createLocaleCookie(locale: string, isProduction: boolean): string {
    const base = `excuseme_lang=${locale}; Path=/; Max-Age=15552000; SameSite=Lax`;
    return isProduction ? `${base}; Secure` : base;
  }

  describe('normalizeLocale', () => {
    it('should normalize basic language codes', () => {
      expect(normalizeLocale('en')).toBe('en');
      expect(normalizeLocale('ru')).toBe('ru');
      expect(normalizeLocale('pl')).toBe('pl');
    });

    it('should normalize BCP-47 codes', () => {
      expect(normalizeLocale('en-US')).toBe('en');
      expect(normalizeLocale('ru-RU')).toBe('ru');
      expect(normalizeLocale('zh-CN')).toBe('zh-CN');
    });

    it('should handle aliases', () => {
      expect(normalizeLocale('cn')).toBe('zh-CN');
      expect(normalizeLocale('ua')).toBe('uk');
      expect(normalizeLocale('russian')).toBe('ru');
      expect(normalizeLocale('русский')).toBe('ru');
      expect(normalizeLocale('english')).toBe('en');
      expect(normalizeLocale('polish')).toBe('pl');
    });

    it('should handle case variations', () => {
      expect(normalizeLocale('EN')).toBe('en');
      expect(normalizeLocale('Ru')).toBe('ru');
      expect(normalizeLocale('PL')).toBe('pl');
    });

    it('should handle whitespace', () => {
      expect(normalizeLocale(' en ')).toBe('en');
      expect(normalizeLocale('  ru  ')).toBe('ru');
    });

    it('should fallback to base locale for unsupported languages', () => {
      expect(normalizeLocale('xx')).toBe('ru');
      expect(normalizeLocale('invalid')).toBe('ru');
      expect(normalizeLocale('en-XX')).toBe('en'); // язык поддерживается, регион нет
    });

    it('should handle edge cases', () => {
      expect(normalizeLocale('')).toBe('ru');
      expect(normalizeLocale(null as any)).toBe('ru');
      expect(normalizeLocale(undefined as any)).toBe('ru');
      expect(normalizeLocale('123')).toBe('ru');
      expect(normalizeLocale('very-long-language-code-that-is-not-supported')).toBe('ru');
    });

    it('should handle complex aliases', () => {
      expect(normalizeLocale('中文')).toBe('zh-CN');
      expect(normalizeLocale('日本語')).toBe('ja');
      expect(normalizeLocale('한국어')).toBe('ko');
      expect(normalizeLocale('українська')).toBe('uk');
    });
  });

  describe('parseAcceptLanguage', () => {
    it('should parse basic Accept-Language headers', () => {
      expect(parseAcceptLanguage('ru-RU,ru;q=0.9,en;q=0.8')).toBe('ru');
      expect(parseAcceptLanguage('en-US,en;q=0.9')).toBe('en');
      expect(parseAcceptLanguage('pl')).toBe('pl');
    });

    it('should parse Accept-Language with quality values', () => {
      expect(parseAcceptLanguage('en;q=0.9,ru;q=0.8,pl;q=0.7')).toBe('en');
      expect(parseAcceptLanguage('pl;q=0.9,en;q=0.8,ru;q=0.7')).toBe('pl');
    });

    it('should respect quality values order', () => {
      expect(parseAcceptLanguage('en;q=0.5,ru;q=0.9,pl;q=0.7')).toBe('ru');
      expect(parseAcceptLanguage('pl;q=0.3,en;q=0.8,ru;q=0.1')).toBe('en');
    });

    it('should handle aliases in Accept-Language', () => {
      expect(parseAcceptLanguage('russian,en;q=0.9')).toBe('ru');
      expect(parseAcceptLanguage('english,pl;q=0.8')).toBe('en');
      expect(parseAcceptLanguage('polish,ru;q=0.7')).toBe('pl');
    });

    it('should prioritize supported languages', () => {
      expect(parseAcceptLanguage('xx,ru;q=0.9,en;q=0.8')).toBe('ru');
      expect(parseAcceptLanguage('invalid,pl;q=0.9,ru;q=0.8')).toBe('pl');
    });

    it('should handle Russian fallback', () => {
      expect(parseAcceptLanguage('ru-RU,ru;q=0.9')).toBe('ru');
      expect(parseAcceptLanguage('ru,en;q=0.8')).toBe('ru');
    });

    it('should handle edge cases', () => {
      expect(parseAcceptLanguage('')).toBeNull();
      expect(parseAcceptLanguage(null as any)).toBeNull();
      expect(parseAcceptLanguage(undefined as any)).toBeNull();
    });

    it('should handle malformed Accept-Language', () => {
      expect(parseAcceptLanguage('invalid-header')).toBe('ru'); // fallback
      expect(parseAcceptLanguage('en;q=invalid,ru;q=0.9')).toBe('ru');
    });

    it('should handle complex Accept-Language strings', () => {
      expect(parseAcceptLanguage('ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7,pl;q=0.6')).toBe('ru');
      expect(parseAcceptLanguage('en-US,en;q=0.9,ru-RU;q=0.8,ru;q=0.7')).toBe('en');
    });

    it('should handle unsupported languages gracefully', () => {
      expect(parseAcceptLanguage('xx-YY,zz;q=0.9')).toBeNull();
      expect(parseAcceptLanguage('invalid-language-code')).toBe('ru'); // fallback
    });

    it('should handle mixed case and whitespace', () => {
      expect(parseAcceptLanguage(' RU-RU , ru ; q=0.9 , EN ; q=0.8 ')).toBe('ru');
      expect(parseAcceptLanguage('En-US,en;q=0.9,PL;q=0.8')).toBe('en');
    });
  });

  describe('shouldIgnorePath', () => {
    it('should ignore API paths', () => {
      expect(shouldIgnorePath('/api/health')).toBe(true);
      expect(shouldIgnorePath('/api/generate')).toBe(true);
      expect(shouldIgnorePath('/api/tts')).toBe(true);
    });

    it('should ignore Next.js static paths', () => {
      expect(shouldIgnorePath('/_next/static/chunks/main.js')).toBe(true);
      expect(shouldIgnorePath('/_next/image')).toBe(true);
      expect(shouldIgnorePath('/_next/static/css/app.css')).toBe(true);
    });

    it('should ignore static assets', () => {
      expect(shouldIgnorePath('/fonts/inter.woff2')).toBe(true);
      expect(shouldIgnorePath('/images/logo.png')).toBe(true);
      expect(shouldIgnorePath('/favicon.ico')).toBe(true);
      expect(shouldIgnorePath('/manifest.webmanifest')).toBe(true);
      expect(shouldIgnorePath('/sw.js')).toBe(true);
    });

    it('should not ignore application paths', () => {
      expect(shouldIgnorePath('/')).toBe(false);
      expect(shouldIgnorePath('/dashboard')).toBe(false);
      expect(shouldIgnorePath('/account')).toBe(false);
      expect(shouldIgnorePath('/admin/i18n')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(shouldIgnorePath('')).toBe(false);
      expect(shouldIgnorePath('/api')).toBe(true);
      expect(shouldIgnorePath('/_next')).toBe(true);
    });
  });

  describe('createLocaleCookie', () => {
    it('should create basic cookie string', () => {
      const cookie = createLocaleCookie('en', false);
      expect(cookie).toBe('excuseme_lang=en; Path=/; Max-Age=15552000; SameSite=Lax');
    });

    it('should add Secure flag in production', () => {
      const cookie = createLocaleCookie('ru', true);
      expect(cookie).toBe('excuseme_lang=ru; Path=/; Max-Age=15552000; SameSite=Lax; Secure');
    });

    it('should handle different locales', () => {
      expect(createLocaleCookie('pl', false)).toContain('excuseme_lang=pl');
      expect(createLocaleCookie('zh-CN', false)).toContain('excuseme_lang=zh-CN');
      expect(createLocaleCookie('uk', false)).toContain('excuseme_lang=uk');
    });

    it('should always include required attributes', () => {
      const cookie = createLocaleCookie('en', false);
      expect(cookie).toContain('Path=/');
      expect(cookie).toContain('Max-Age=15552000');
      expect(cookie).toContain('SameSite=Lax');
    });
  });
});

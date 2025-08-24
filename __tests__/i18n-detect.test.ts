import { 
  normalizeLocale, 
  isValidLocale, 
  parseAcceptLanguage, 
  detectLanguage,
  syncLanguage,
  I18N_CONSTANTS 
} from '@/lib/i18n-detect';

describe('i18n-detect', () => {
  describe('normalizeLocale', () => {
    it('should normalize basic language codes', () => {
      expect(normalizeLocale('en')).toBe('en');
      expect(normalizeLocale('ru')).toBe('ru');
      expect(normalizeLocale('es')).toBe('es');
    });

    it('should handle BCP-47 format', () => {
      expect(normalizeLocale('en-US')).toBe('en');
      expect(normalizeLocale('ru-RU')).toBe('ru');
      expect(normalizeLocale('pt-BR')).toBe('pt-BR');
      expect(normalizeLocale('zh-CN')).toBe('zh-CN');
    });

    it('should handle aliases', () => {
      expect(normalizeLocale('cn')).toBe('zh-CN');
      expect(normalizeLocale('ua')).toBe('uk');
      expect(normalizeLocale('br')).toBe('pt-BR');
      expect(normalizeLocale('us')).toBe('en');
      expect(normalizeLocale('russian')).toBe('ru');
      expect(normalizeLocale('русский')).toBe('ru');
    });

    it('should handle case variations', () => {
      expect(normalizeLocale('EN')).toBe('en');
      expect(normalizeLocale('Ru')).toBe('ru');
      expect(normalizeLocale('EN-US')).toBe('en');
      expect(normalizeLocale('RU-RU')).toBe('ru');
    });

    it('should handle whitespace', () => {
      expect(normalizeLocale(' en ')).toBe('en');
      expect(normalizeLocale('  ru  ')).toBe('ru');
    });

    it('should return base locale for unsupported languages', () => {
      expect(normalizeLocale('xx')).toBe('ru');
      expect(normalizeLocale('invalid')).toBe('ru');
      expect(normalizeLocale('')).toBe('ru');
      expect(normalizeLocale('   ')).toBe('ru');
    });

    it('should handle null/undefined', () => {
      expect(normalizeLocale(null as any)).toBe('ru');
      expect(normalizeLocale(undefined as any)).toBe('ru');
    });
  });

  describe('isValidLocale', () => {
    it('should return true for supported locales', () => {
      expect(isValidLocale('en')).toBe(true);
      expect(isValidLocale('ru')).toBe(true);
      expect(isValidLocale('pt-BR')).toBe(true);
      expect(isValidLocale('zh-CN')).toBe(true);
    });

    it('should return false for unsupported locales', () => {
      expect(isValidLocale('xx')).toBe(false);
      expect(isValidLocale('invalid')).toBe(false);
      expect(isValidLocale('')).toBe(false);
    });

    it('should handle aliases', () => {
      expect(isValidLocale('cn')).toBe(true); // maps to zh-CN
      expect(isValidLocale('ua')).toBe(true); // maps to uk
      expect(isValidLocale('br')).toBe(true); // maps to pt-BR
    });
  });

  describe('parseAcceptLanguage', () => {
    it('should parse simple Accept-Language', () => {
      expect(parseAcceptLanguage('en')).toBe('en');
      expect(parseAcceptLanguage('ru')).toBe('ru');
    });

    it('should parse complex Accept-Language with quality', () => {
      expect(parseAcceptLanguage('en-US,en;q=0.9,ru;q=0.8')).toBe('en');
      expect(parseAcceptLanguage('ru-RU,ru;q=0.9,en;q=0.8')).toBe('ru');
    });

    it('should respect quality values', () => {
      expect(parseAcceptLanguage('en;q=0.8,ru;q=0.9')).toBe('ru');
      expect(parseAcceptLanguage('es;q=0.5,ru;q=0.9,en;q=0.8')).toBe('ru');
    });

    it('should handle aliases in Accept-Language', () => {
      expect(parseAcceptLanguage('cn,en;q=0.9')).toBe('zh-CN');
      expect(parseAcceptLanguage('ua,ru;q=0.9')).toBe('uk');
    });

    it('should return null for unsupported languages', () => {
      expect(parseAcceptLanguage('xx')).toBe(null);
      expect(parseAcceptLanguage('xx-YY,zz;q=0.9')).toBe(null);
    });

    it('should handle malformed Accept-Language', () => {
      expect(parseAcceptLanguage('')).toBe(null);
      expect(parseAcceptLanguage('invalid')).toBe(null);
    });
  });

  describe('detectLanguage', () => {
    it('should prioritize query parameter', () => {
      const result = detectLanguage({
        query: 'en',
        cookie: 'ru',
        acceptLanguage: 'es',
      });
      expect(result).toBe('en');
    });

    it('should use cookie when query is not available', () => {
      const result = detectLanguage({
        cookie: 'ru',
        acceptLanguage: 'es',
      });
      expect(result).toBe('ru');
    });

    it('should use Accept-Language when query and cookie are not available', () => {
      const result = detectLanguage({
        acceptLanguage: 'es',
      });
      expect(result).toBe('es');
    });

    it('should use default when no sources are available', () => {
      const result = detectLanguage({});
      expect(result).toBe('ru');
    });

    it('should handle telegram language', () => {
      const result = detectLanguage({
        telegramLanguage: 'en',
        acceptLanguage: 'ru',
      });
      expect(result).toBe('en');
    });

    it('should normalize all inputs', () => {
      const result = detectLanguage({
        query: 'EN-US',
        cookie: 'RU-RU',
        telegramLanguage: 'ES-ES',
      });
      expect(result).toBe('en');
    });
  });

  describe('I18N_CONSTANTS', () => {
    it('should export supported locales', () => {
      expect(I18N_CONSTANTS.SUPPORTED_LOCALES).toContain('en');
      expect(I18N_CONSTANTS.SUPPORTED_LOCALES).toContain('ru');
      expect(I18N_CONSTANTS.SUPPORTED_LOCALES).toContain('pt-BR');
      expect(I18N_CONSTANTS.SUPPORTED_LOCALES).toContain('zh-CN');
    });

    it('should export locale aliases', () => {
      expect(I18N_CONSTANTS.LOCALE_ALIASES['cn']).toBe('zh-CN');
      expect(I18N_CONSTANTS.LOCALE_ALIASES['ua']).toBe('uk');
      expect(I18N_CONSTANTS.LOCALE_ALIASES['br']).toBe('pt-BR');
    });

    it('should export base locale', () => {
      expect(I18N_CONSTANTS.BASE_LOCALE).toBe('ru');
    });
  });

  describe('syncLanguage', () => {
    let mockSetLanguageCookie: jest.SpyInstance;
    let mockUpdateLanguageQuery: jest.SpyInstance;

    beforeEach(() => {
      // Mock document and window for SSR
      Object.defineProperty(global, 'document', {
        value: {
          cookie: '',
        },
        writable: true,
      });

      Object.defineProperty(global, 'window', {
        value: {
          location: { href: 'http://localhost:3000' },
          history: { replaceState: jest.fn() },
        },
        writable: true,
      });

      // Mock the functions
      mockSetLanguageCookie = jest.spyOn(require('@/lib/i18n-detect'), 'setLanguageCookie');
      mockUpdateLanguageQuery = jest.spyOn(require('@/lib/i18n-detect'), 'updateLanguageQuery');
    });

    afterEach(() => {
      mockSetLanguageCookie.mockRestore();
      mockUpdateLanguageQuery.mockRestore();
    });

    it('should call setLanguageCookie and updateLanguageQuery', () => {
      syncLanguage('en');
      
      expect(mockSetLanguageCookie).toHaveBeenCalledWith('en', 365);
      expect(mockUpdateLanguageQuery).toHaveBeenCalledWith('en');
    });

    it('should normalize locale before syncing', () => {
      syncLanguage('EN-US');
      
      expect(mockSetLanguageCookie).toHaveBeenCalledWith('en', 365);
      expect(mockUpdateLanguageQuery).toHaveBeenCalledWith('en');
    });
  });
});

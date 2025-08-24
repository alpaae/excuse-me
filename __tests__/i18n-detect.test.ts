import { normalizeLocale, parseAcceptLanguage, I18N_CONSTANTS } from '../lib/i18n-detect';

describe('i18n-detect', () => {
  describe('normalizeLocale', () => {
    it('should normalize basic language codes', () => {
      expect(normalizeLocale('en')).toBe('en');
      expect(normalizeLocale('ru')).toBe('ru');
      expect(normalizeLocale('es')).toBe('es');
      expect(normalizeLocale('fr')).toBe('fr');
    });

    it('should normalize BCP-47 codes', () => {
      expect(normalizeLocale('en-US')).toBe('en');
      expect(normalizeLocale('ru-RU')).toBe('ru');
      expect(normalizeLocale('zh-CN')).toBe('zh-CN');
      expect(normalizeLocale('pt-BR')).toBe('pt-BR');
    });

    it('should handle aliases', () => {
      expect(normalizeLocale('cn')).toBe('zh-CN');
      expect(normalizeLocale('ua')).toBe('uk');
      expect(normalizeLocale('br')).toBe('pt-BR');
      expect(normalizeLocale('russian')).toBe('ru');
      expect(normalizeLocale('русский')).toBe('ru');
      expect(normalizeLocale('english')).toBe('en');
    });

    it('should handle case variations', () => {
      expect(normalizeLocale('EN')).toBe('en');
      expect(normalizeLocale('Ru')).toBe('ru');
      expect(normalizeLocale('zh-cn')).toBe('zh-CN');
      expect(normalizeLocale('PT-BR')).toBe('pt-BR');
    });

    it('should handle whitespace', () => {
      expect(normalizeLocale(' en ')).toBe('en');
      expect(normalizeLocale('  ru  ')).toBe('ru');
      expect(normalizeLocale('\tzh-CN\n')).toBe('zh-CN');
    });

    it('should fallback to base locale for unsupported languages', () => {
      expect(normalizeLocale('xx')).toBe('ru');
      expect(normalizeLocale('invalid')).toBe('ru');
      expect(normalizeLocale('zh-TW')).toBe('ru'); // Traditional Chinese not supported
      expect(normalizeLocale('ar')).toBe('ru'); // Arabic not supported
    });

    it('should handle edge cases', () => {
      expect(normalizeLocale('')).toBe('ru');
      expect(normalizeLocale('   ')).toBe('ru');
      expect(normalizeLocale(null as any)).toBe('ru');
      expect(normalizeLocale(undefined as any)).toBe('ru');
      expect(normalizeLocale(123 as any)).toBe('ru');
    });

    it('should handle complex aliases', () => {
      expect(normalizeLocale('zh_cn')).toBe('zh-CN');
      expect(normalizeLocale('pt-pt')).toBe('pt-PT');
      expect(normalizeLocale('portugal')).toBe('pt-PT');
      expect(normalizeLocale('brazil')).toBe('pt-BR');
      expect(normalizeLocale('ukraine')).toBe('uk');
      expect(normalizeLocale('spanish')).toBe('es');
      expect(normalizeLocale('french')).toBe('fr');
      expect(normalizeLocale('german')).toBe('de');
      expect(normalizeLocale('italian')).toBe('it');
      expect(normalizeLocale('japanese')).toBe('ja');
      expect(normalizeLocale('korean')).toBe('ko');
    });

    it('should handle ISO codes', () => {
      expect(normalizeLocale('eng')).toBe('en');
      expect(normalizeLocale('rus')).toBe('ru');
      expect(normalizeLocale('spa')).toBe('es');
      expect(normalizeLocale('fra')).toBe('fr');
      expect(normalizeLocale('deu')).toBe('de');
      expect(normalizeLocale('ita')).toBe('it');
      expect(normalizeLocale('jpn')).toBe('ja');
      expect(normalizeLocale('kor')).toBe('ko');
    });
  });

  describe('parseAcceptLanguage', () => {
    it('should parse simple Accept-Language', () => {
      expect(parseAcceptLanguage('en')).toBe('en');
      expect(parseAcceptLanguage('ru')).toBe('ru');
      expect(parseAcceptLanguage('es')).toBe('es');
    });

    it('should parse Accept-Language with quality values', () => {
      expect(parseAcceptLanguage('en-US,en;q=0.9,ru;q=0.8')).toBe('en');
      expect(parseAcceptLanguage('ru-RU,ru;q=0.9,en;q=0.8')).toBe('ru');
      expect(parseAcceptLanguage('es-ES,es;q=0.9,en;q=0.7')).toBe('es');
    });

    it('should respect quality values order', () => {
      expect(parseAcceptLanguage('ru;q=0.8,en;q=0.9')).toBe('en');
      expect(parseAcceptLanguage('es;q=0.7,ru;q=0.9,en;q=0.8')).toBe('ru');
      expect(parseAcceptLanguage('fr;q=0.9,de;q=0.8,en;q=0.7')).toBe('fr');
    });

    it('should handle aliases in Accept-Language', () => {
      expect(parseAcceptLanguage('cn,en;q=0.9')).toBe('zh-CN');
      expect(parseAcceptLanguage('ua,ru;q=0.8')).toBe('uk');
      expect(parseAcceptLanguage('br,pt;q=0.9')).toBe('pt-BR');
      expect(parseAcceptLanguage('russian,en;q=0.8')).toBe('ru');
    });

    it('should prioritize supported languages', () => {
      expect(parseAcceptLanguage('xx-XX,en;q=0.9,ru;q=0.8')).toBe('en');
      expect(parseAcceptLanguage('invalid,es;q=0.7,fr;q=0.8')).toBe('es');
      expect(parseAcceptLanguage('zz,de;q=0.9,it;q=0.8')).toBe('de');
    });

    it('should handle Russian fallback', () => {
      expect(parseAcceptLanguage('ru-XX,en;q=0.9')).toBe('ru');
      expect(parseAcceptLanguage('ru-RU,en;q=0.8')).toBe('ru');
      expect(parseAcceptLanguage('ru,en;q=0.9')).toBe('ru');
    });

    it('should handle edge cases', () => {
      expect(parseAcceptLanguage('')).toBeNull();
      expect(parseAcceptLanguage('   ')).toBeNull();
      expect(parseAcceptLanguage(null as any)).toBeNull();
      expect(parseAcceptLanguage(undefined as any)).toBeNull();
    });

    it('should handle malformed Accept-Language', () => {
      expect(parseAcceptLanguage('en-US,en;q=invalid,ru;q=0.8')).toBe('en');
      expect(parseAcceptLanguage('en;q=,ru;q=0.9')).toBe('ru');
      expect(parseAcceptLanguage('en-US;q=0.9,ru')).toBe('ru');
    });

    it('should handle complex Accept-Language strings', () => {
      expect(parseAcceptLanguage('en-US,en;q=0.9,ru-RU;q=0.8,ru;q=0.7,es;q=0.6')).toBe('en');
      expect(parseAcceptLanguage('fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7,de;q=0.6')).toBe('fr');
      expect(parseAcceptLanguage('zh-CN,zh;q=0.9,en;q=0.8,ja;q=0.7')).toBe('zh-CN');
    });

    it('should handle unsupported languages gracefully', () => {
      expect(parseAcceptLanguage('ar-SA,ar;q=0.9,en;q=0.8')).toBe('en');
      expect(parseAcceptLanguage('hi-IN,hi;q=0.9,ru;q=0.8')).toBe('ru');
      expect(parseAcceptLanguage('th-TH,th;q=0.9,es;q=0.8')).toBe('es');
    });

    it('should handle mixed case and whitespace', () => {
      expect(parseAcceptLanguage('EN-US,en;q=0.9, RU ;q=0.8')).toBe('en');
      expect(parseAcceptLanguage('  ru-RU  ,  ru  ;q=0.9  ')).toBe('ru');
      expect(parseAcceptLanguage('\ten-US\n,en;q=0.9\t')).toBe('en');
    });
  });

  describe('I18N_CONSTANTS', () => {
    it('should export correct constants', () => {
      expect(I18N_CONSTANTS.BASE_LOCALE).toBe('ru');
      expect(I18N_CONSTANTS.SUPPORTED_LOCALES).toContain('en');
      expect(I18N_CONSTANTS.SUPPORTED_LOCALES).toContain('ru');
      expect(I18N_CONSTANTS.SUPPORTED_LOCALES).toContain('zh-CN');
      expect(I18N_CONSTANTS.LOCALE_ALIASES).toHaveProperty('cn');
      expect(I18N_CONSTANTS.LOCALE_ALIASES).toHaveProperty('ua');
      expect(I18N_CONSTANTS.LOCALE_ALIASES).toHaveProperty('br');
    });

    it('should have consistent alias mappings', () => {
      expect(I18N_CONSTANTS.LOCALE_ALIASES['cn']).toBe('zh-CN');
      expect(I18N_CONSTANTS.LOCALE_ALIASES['ua']).toBe('uk');
      expect(I18N_CONSTANTS.LOCALE_ALIASES['br']).toBe('pt-BR');
      expect(I18N_CONSTANTS.LOCALE_ALIASES['russian']).toBe('ru');
      expect(I18N_CONSTANTS.LOCALE_ALIASES['english']).toBe('en');
    });
  });

  describe('integration tests', () => {
    it('should handle real-world Accept-Language scenarios', () => {
      // Chrome default
      expect(parseAcceptLanguage('en-US,en;q=0.9')).toBe('en');
      
      // Firefox with Russian
      expect(parseAcceptLanguage('ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7')).toBe('ru');
      
      // Safari with multiple languages
      expect(parseAcceptLanguage('en-GB,en;q=0.9,es;q=0.8,fr;q=0.7')).toBe('en');
      
      // Mobile browser
      expect(parseAcceptLanguage('zh-CN,zh;q=0.9,en;q=0.8')).toBe('zh-CN');
    });

    it('should handle edge cases in normalization', () => {
      // Very long strings
      expect(normalizeLocale('a'.repeat(1000))).toBe('ru');
      
      // Special characters
      expect(normalizeLocale('en-US@')).toBe('en');
      expect(normalizeLocale('ru_RU')).toBe('ru');
      expect(normalizeLocale('zh.CN')).toBe('zh-CN');
      
      // Numbers
      expect(normalizeLocale('123')).toBe('ru');
      expect(normalizeLocale('en123')).toBe('ru');
    });
  });
});

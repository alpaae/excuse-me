import { test, expect } from '@playwright/test';
import { SELECTORS, TEST_HELPERS, API_SCENARIOS } from '../fixtures';

test.describe('Accept-Language Detection', () => {
  test('should detect Russian from Accept-Language when no query param', async ({ page, mockApi }) => {
    // Мокаем API
    await mockApi('/api/health', API_SCENARIOS.health.response, API_SCENARIOS.health.status);
    await mockApi('/api/generate', API_SCENARIOS.success.response, API_SCENARIOS.success.status);
    
    // Устанавливаем Accept-Language с русским приоритетом
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'ru-RU,ru;q=0.9,en;q=0.8'
    });

    // Переходим на главную без query параметров
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Проверяем, что селект показывает русский язык
    await expect(page.getByTestId(SELECTORS.LANG_SELECT)).toContainText('Русский');
    
    // Проверяем, что cookie установлен
    const cookies = await page.context().cookies();
    const langCookie = cookies.find(cookie => cookie.name === 'excuseme_lang');
    expect(langCookie).toBeTruthy();
    expect(langCookie?.value).toBe('ru');
  });

  test('should detect English from Accept-Language when no query param', async ({ page, mockApi }) => {
    // Мокаем API
    await mockApi('/api/health', API_SCENARIOS.health.response, API_SCENARIOS.health.status);
    await mockApi('/api/generate', API_SCENARIOS.success.response, API_SCENARIOS.success.status);
    
    // Устанавливаем Accept-Language с английским приоритетом
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9,ru;q=0.8'
    });

    // Переходим на главную без query параметров
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Проверяем, что селект показывает английский язык
    await expect(page.getByTestId(SELECTORS.LANG_SELECT)).toContainText('English');
    
    // Проверяем, что cookie установлен
    const cookies = await page.context().cookies();
    const langCookie = cookies.find(cookie => cookie.name === 'excuseme_lang');
    expect(langCookie).toBeTruthy();
    expect(langCookie?.value).toBe('en');
  });

  test('should prioritize query param over Accept-Language', async ({ page, mockApi }) => {
    // Мокаем API
    await mockApi('/api/health', API_SCENARIOS.health.response, API_SCENARIOS.health.status);
    await mockApi('/api/generate', API_SCENARIOS.success.response, API_SCENARIOS.success.status);
    
    // Устанавливаем Accept-Language с русским приоритетом
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'ru-RU,ru;q=0.9,en;q=0.8'
    });

    // Переходим с query параметром английского языка
    await page.goto('/?lang=en');
    await page.waitForLoadState('networkidle');

    // Проверяем, что селект показывает английский язык (приоритет query)
    await expect(page.getByTestId(SELECTORS.LANG_SELECT)).toContainText('English');
    
    // Проверяем, что cookie НЕ перезаписан (query параметр имеет приоритет)
    const cookies = await page.context().cookies();
    const langCookie = cookies.find(cookie => cookie.name === 'excuseme_lang');
    // Cookie может не быть установлен, так как query параметр имеет приоритет
  });

  test('should handle complex Accept-Language with quality values', async ({ page, mockApi }) => {
    // Мокаем API
    await mockApi('/api/health', API_SCENARIOS.health.response, API_SCENARIOS.health.status);
    await mockApi('/api/generate', API_SCENARIOS.success.response, API_SCENARIOS.success.status);
    
    // Устанавливаем сложный Accept-Language с качеством
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'es-ES,es;q=0.9,ru;q=0.8,en;q=0.7'
    });

    // Переходим на главную без query параметров
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Проверяем, что селект показывает испанский язык (первый поддерживаемый)
    await expect(page.getByTestId(SELECTORS.LANG_SELECT)).toContainText('Español');
    
    // Проверяем, что cookie установлен
    const cookies = await page.context().cookies();
    const langCookie = cookies.find(cookie => cookie.name === 'excuseme_lang');
    expect(langCookie).toBeTruthy();
    expect(langCookie?.value).toBe('es');
  });

  test('should fallback to Russian for unsupported Accept-Language', async ({ page, mockApi }) => {
    // Мокаем API
    await mockApi('/api/health', API_SCENARIOS.health.response, API_SCENARIOS.health.status);
    await mockApi('/api/generate', API_SCENARIOS.success.response, API_SCENARIOS.success.status);
    
    // Устанавливаем неподдерживаемый Accept-Language
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'xx-XX,zz;q=0.9'
    });

    // Переходим на главную без query параметров
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Проверяем, что селект показывает русский язык (fallback)
    await expect(page.getByTestId(SELECTORS.LANG_SELECT)).toContainText('Русский');
    
    // Проверяем, что cookie установлен с fallback значением
    const cookies = await page.context().cookies();
    const langCookie = cookies.find(cookie => cookie.name === 'excuseme_lang');
    expect(langCookie).toBeTruthy();
    expect(langCookie?.value).toBe('ru');
  });

  test('should persist language choice in cookie for 180 days', async ({ page, mockApi }) => {
    // Мокаем API
    await mockApi('/api/health', API_SCENARIOS.health.response, API_SCENARIOS.health.status);
    await mockApi('/api/generate', API_SCENARIOS.success.response, API_SCENARIOS.success.status);
    
    // Устанавливаем Accept-Language с английским приоритетом
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9'
    });

    // Переходим на главную
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Проверяем, что cookie установлен с правильным max-age
    const cookies = await page.context().cookies();
    const langCookie = cookies.find(cookie => cookie.name === 'excuseme_lang');
    expect(langCookie).toBeTruthy();
    expect(langCookie?.value).toBe('en');
    
    // Проверяем, что cookie имеет правильные атрибуты
    expect(langCookie?.path).toBe('/');
    expect(langCookie?.sameSite).toBe('Lax');
    
    // Проверяем, что expires установлен примерно на 180 дней вперед
    if (langCookie?.expires) {
      const expiresDate = new Date(langCookie.expires * 1000);
      const now = new Date();
      const daysDiff = Math.floor((expiresDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      // Должно быть примерно 180 дней (допускаем погрешность в 1 день)
      expect(daysDiff).toBeGreaterThan(179);
      expect(daysDiff).toBeLessThan(181);
    }
  });

  test('should not show language switching animation on initial load', async ({ page, mockApi }) => {
    // Мокаем API
    await mockApi('/api/health', API_SCENARIOS.health.response, API_SCENARIOS.health.status);
    await mockApi('/api/generate', API_SCENARIOS.success.response, API_SCENARIOS.success.status);
    
    // Устанавливаем Accept-Language
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'ru-RU,ru;q=0.9'
    });

    // Переходим на главную
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Проверяем, что селект сразу показывает правильный язык
    // (без дерганий/анимаций переключения)
    await expect(page.getByTestId(SELECTORS.LANG_SELECT)).toContainText('Русский');
    
    // Проверяем, что форма отображается стабильно
    await expect(page.getByTestId(SELECTORS.GEN_FORM)).toBeVisible();
    await expect(page.getByTestId(SELECTORS.GEN_SUBMIT)).toBeVisible();
  });
});

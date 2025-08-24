import { test, expect } from '../fixtures';
import { TEST_HELPERS } from '../fixtures';

test.describe('i18n: query parameter handling', () => {
  test('should set English from ?lang=en query parameter', async ({ page, mockApi }) => {
    await mockApi('/api/health', { ok: true, time: new Date().toISOString() }, 200);
    
    // Открываем страницу с параметром lang=en
    await page.goto('/?lang=en');
    await page.waitForLoadState('networkidle');
    
    // Ждем инициализации клиентского кода
    await page.waitForFunction(() => {
      const select = document.querySelector('[data-testid="lang-select"]') as HTMLSelectElement;
      return select && select.value !== '';
    }, { timeout: 10000 });
    
    // Проверяем, что селектор показывает английский
    await TEST_HELPERS.expectSelectValue(page, '[data-testid="lang-select"]', 'en');
    
    // Проверяем, что cookie установлен
    await TEST_HELPERS.expectCookieSet(page, 'en');
    
    // Проверяем, что URL содержит параметр lang=en (не удаляется при прямом заходе)
    await expect(page).toHaveURL(/[?&]lang=en(&|$)/);
  });
  
  test('should set Polish from ?lang=pl query parameter', async ({ page, mockApi }) => {
    await mockApi('/api/health', { ok: true, time: new Date().toISOString() }, 200);
    
    await page.goto('/?lang=pl');
    await page.waitForLoadState('networkidle');
    
    await TEST_HELPERS.expectSelectValue(page, '[data-testid="lang-select"]', 'pl');
    await TEST_HELPERS.expectCookieSet(page, 'pl');
    await TEST_HELPERS.expectUrlContainsLang(page, 'pl');
  });
  
  test('should set German from ?lang=de query parameter', async ({ page, mockApi }) => {
    await mockApi('/api/health', { ok: true, time: new Date().toISOString() }, 200);
    
    await page.goto('/?lang=de');
    await page.waitForLoadState('networkidle');
    
    await TEST_HELPERS.expectSelectValue(page, '[data-testid="lang-select"]', 'de');
    await TEST_HELPERS.expectCookieSet(page, 'de');
    await TEST_HELPERS.expectUrlContainsLang(page, 'de');
  });
  
  test('should handle multiple query parameters with lang', async ({ page, mockApi }) => {
    await mockApi('/api/health', { ok: true, time: new Date().toISOString() }, 200);
    
    // Открываем с дополнительными параметрами
    await page.goto('/?lang=en&utm_source=test&ref=homepage');
    await page.waitForLoadState('networkidle');
    
    await TEST_HELPERS.expectSelectValue(page, '[data-testid="lang-select"]', 'en');
    await TEST_HELPERS.expectCookieSet(page, 'en');
    await expect(page).toHaveURL(/[?&]lang=en(&|$)/);
    
    // Проверяем, что другие параметры сохранились
    await expect(page).toHaveURL(/utm_source=test/);
    await expect(page).toHaveURL(/ref=homepage/);
  });
  
  test('should prioritize query parameter over Accept-Language', async ({ page, mockApi }) => {
    await mockApi('/api/health', { ok: true, time: new Date().toISOString() }, 200);
    
    // Accept-Language = ru-RU, но query = en
    await page.goto('/?lang=en');
    await page.waitForLoadState('networkidle');
    
    // Должен использовать query параметр, а не Accept-Language
    await TEST_HELPERS.expectSelectValue(page, '[data-testid="lang-select"]', 'en');
    await TEST_HELPERS.expectCookieSet(page, 'en');
    await expect(page).toHaveURL(/[?&]lang=en(&|$)/);
  });
});

import { test, expect } from '../fixtures';
import { TEST_HELPERS } from '../fixtures';

test.describe('i18n: migrate lng to lang parameter', () => {
  test('should redirect from ?lng=ru to ?lang=ru', async ({ page, mockApi }) => {
    await mockApi('/api/health', { ok: true, time: new Date().toISOString() }, 200);
    
    // Открываем страницу с устаревшим параметром lng
    await page.goto('/?lng=ru');
    
    // Должен произойти редирект на ?lang=ru
    await page.waitForURL('**/?lang=ru', { timeout: 5000 });
    
    // Проверяем, что селектор показывает русский
    await TEST_HELPERS.expectSelectValue(page, '[data-testid="lang-select"]', 'ru');
    
    // Проверяем, что cookie установлен
    await TEST_HELPERS.expectCookieSet(page, 'ru');
    
    // Проверяем, что URL содержит новый параметр lang
    await TEST_HELPERS.expectUrlContainsLang(page, 'ru');
    
    // Проверяем, что старый параметр lng удален
    await expect(page).not.toHaveURL(/lng=/);
  });
  
  test('should redirect from ?lng=en to ?lang=en', async ({ page, mockApi }) => {
    await mockApi('/api/health', { ok: true, time: new Date().toISOString() }, 200);
    
    await page.goto('/?lng=en');
    
    await page.waitForURL('**/?lang=en', { timeout: 5000 });
    
    await TEST_HELPERS.expectSelectValue(page, '[data-testid="lang-select"]', 'en');
    await TEST_HELPERS.expectCookieSet(page, 'en');
    await TEST_HELPERS.expectUrlContainsLang(page, 'en');
    await expect(page).not.toHaveURL(/lng=/);
  });
  
  test('should redirect from ?lng=pl to ?lang=pl', async ({ page, mockApi }) => {
    await mockApi('/api/health', { ok: true, time: new Date().toISOString() }, 200);
    
    await page.goto('/?lng=pl');
    
    await page.waitForURL('**/?lang=pl', { timeout: 5000 });
    
    await TEST_HELPERS.expectSelectValue(page, '[data-testid="lang-select"]', 'pl');
    await TEST_HELPERS.expectCookieSet(page, 'pl');
    await TEST_HELPERS.expectUrlContainsLang(page, 'pl');
    await expect(page).not.toHaveURL(/lng=/);
  });
  
  test('should handle lng with additional query parameters', async ({ page, mockApi }) => {
    await mockApi('/api/health', { ok: true, time: new Date().toISOString() }, 200);
    
    // Открываем с дополнительными параметрами
    await page.goto('/?lng=en&utm_source=test&ref=homepage');
    
    await page.waitForURL('**/?lang=en&utm_source=test&ref=homepage', { timeout: 5000 });
    
    await TEST_HELPERS.expectSelectValue(page, '[data-testid="lang-select"]', 'en');
    await TEST_HELPERS.expectCookieSet(page, 'en');
    await TEST_HELPERS.expectUrlContainsLang(page, 'en');
    
    // Проверяем, что другие параметры сохранились
    await expect(page).toHaveURL(/utm_source=test/);
    await expect(page).toHaveURL(/ref=homepage/);
    await expect(page).not.toHaveURL(/lng=/);
  });
  
  test('should not redirect when both lng and lang are present', async ({ page, mockApi }) => {
    await mockApi('/api/health', { ok: true, time: new Date().toISOString() }, 200);
    
    // Если оба параметра присутствуют, lang имеет приоритет
    await page.goto('/?lng=ru&lang=en');
    
    // Не должно быть редиректа
    await expect(page).toHaveURL(/lang=en/);
    await expect(page).toHaveURL(/lng=ru/);
    
    await TEST_HELPERS.expectSelectValue(page, '[data-testid="lang-select"]', 'en');
    await TEST_HELPERS.expectCookieSet(page, 'en');
  });
});

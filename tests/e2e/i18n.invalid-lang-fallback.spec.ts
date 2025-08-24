import { test, expect } from '../fixtures';
import { TEST_HELPERS } from '../fixtures';

test.describe('i18n: invalid language fallback', () => {
  test('should fallback to base locale for invalid ?lang=%ZZ', async ({ page, mockApi }) => {
    await mockApi('/api/health', { ok: true, time: new Date().toISOString() }, 200);
    
    // Открываем с невалидным закодированным параметром
    await page.goto('/?lang=%ZZ');
    await page.waitForLoadState('networkidle');
    
    // Должен fallback на базовую локаль (ru)
    await TEST_HELPERS.expectSelectValue(page, '[data-testid="lang-select"]', 'ru');
    await TEST_HELPERS.expectCookieSet(page, 'ru');
    
    // URL не должен содержать параметр lang для базового языка
    await expect(page).not.toHaveURL(/lang=/);
    
    // Проверяем, что страница загрузилась без ошибок
    await expect(page.getByTestId('gen-submit')).toBeVisible();
  });
  
  test('should fallback to base locale for invalid ?lang=invalid', async ({ page, mockApi }) => {
    await mockApi('/api/health', { ok: true, time: new Date().toISOString() }, 200);
    
    await page.goto('/?lang=invalid');
    await page.waitForLoadState('networkidle');
    
    await TEST_HELPERS.expectSelectValue(page, '[data-testid="lang-select"]', 'ru');
    await TEST_HELPERS.expectCookieSet(page, 'ru');
    await expect(page).not.toHaveURL(/lang=/);
    await expect(page.getByTestId('gen-submit')).toBeVisible();
  });
  
  test('should fallback to base locale for empty ?lang=', async ({ page, mockApi }) => {
    await mockApi('/api/health', { ok: true, time: new Date().toISOString() }, 200);
    
    await page.goto('/?lang=');
    await page.waitForLoadState('networkidle');
    
    await TEST_HELPERS.expectSelectValue(page, '[data-testid="lang-select"]', 'ru');
    await TEST_HELPERS.expectCookieSet(page, 'ru');
    await expect(page).not.toHaveURL(/lang=/);
    await expect(page.getByTestId('gen-submit')).toBeVisible();
  });
  
  test('should fallback to base locale for ?lang=xx (unsupported)', async ({ page, mockApi }) => {
    await mockApi('/api/health', { ok: true, time: new Date().toISOString() }, 200);
    
    await page.goto('/?lang=xx');
    await page.waitForLoadState('networkidle');
    
    await TEST_HELPERS.expectSelectValue(page, '[data-testid="lang-select"]', 'ru');
    await TEST_HELPERS.expectCookieSet(page, 'ru');
    await expect(page).not.toHaveURL(/lang=/);
    await expect(page.getByTestId('gen-submit')).toBeVisible();
  });
  
  test('should fallback to base locale for ?lng=invalid', async ({ page, mockApi }) => {
    await mockApi('/api/health', { ok: true, time: new Date().toISOString() }, 200);
    
    await page.goto('/?lng=invalid');
    
    // Должен произойти редирект на ?lang=ru (fallback)
    await page.waitForURL('**/?lang=ru', { timeout: 5000 });
    
    await TEST_HELPERS.expectSelectValue(page, '[data-testid="lang-select"]', 'ru');
    await TEST_HELPERS.expectCookieSet(page, 'ru');
    await expect(page).not.toHaveURL(/lng=/);
    await expect(page.getByTestId('gen-submit')).toBeVisible();
  });
  
  test('should handle malformed URL encoding gracefully', async ({ page, mockApi }) => {
    await mockApi('/api/health', { ok: true, time: new Date().toISOString() }, 200);
    
    // Тестируем различные варианты некорректного кодирования
    const invalidUrls = [
      '/?lang=%',
      '/?lang=%2',
      '/?lang=%ZZ',
      '/?lang=%FF',
      '/?lang=%%20',
    ];
    
    for (const url of invalidUrls) {
      await page.goto(url);
      await page.waitForLoadState('networkidle');
      
      await TEST_HELPERS.expectSelectValue(page, '[data-testid="lang-select"]', 'ru');
      await TEST_HELPERS.expectCookieSet(page, 'ru');
      await expect(page).not.toHaveURL(/lang=/);
      await expect(page.getByTestId('gen-submit')).toBeVisible();
    }
  });
  
  test('should not crash on extremely long language codes', async ({ page, mockApi }) => {
    await mockApi('/api/health', { ok: true, time: new Date().toISOString() }, 200);
    
    const longLang = 'a'.repeat(1000);
    await page.goto(`/?lang=${longLang}`);
    await page.waitForLoadState('networkidle');
    
    await TEST_HELPERS.expectSelectValue(page, '[data-testid="lang-select"]', 'ru');
    await TEST_HELPERS.expectCookieSet(page, 'ru');
    await expect(page).not.toHaveURL(/lang=/);
    await expect(page.getByTestId('gen-submit')).toBeVisible();
  });
});

import { test, expect } from '../fixtures';
import { TEST_HELPERS } from '../fixtures';

test.describe('i18n: switch via selector', () => {
  test('should switch to Polish via selector', async ({ page, selectLang, mockApi }) => {
    await mockApi('/api/health', { ok: true, time: new Date().toISOString() }, 200);
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Проверяем начальное состояние (английский)
    await TEST_HELPERS.expectSelectValue(page, '[data-testid="lang-select"]', 'en');
    
    // Переключаем на польский
    await selectLang(page, 'pl');
    
    // Проверяем результат
    await TEST_HELPERS.expectSelectValue(page, '[data-testid="lang-select"]', 'pl');
    await TEST_HELPERS.expectUrlContainsLang(page, 'pl');
    await TEST_HELPERS.expectCookieSet(page, 'pl');
  });
  
  test('should switch to English via selector', async ({ page, selectLang, mockApi }) => {
    await mockApi('/api/health', { ok: true, time: new Date().toISOString() }, 200);
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Переключаем на английский
    await selectLang(page, 'en');
    
    // Проверяем результат
    await TEST_HELPERS.expectSelectValue(page, '[data-testid="lang-select"]', 'en');
    await TEST_HELPERS.expectUrlContainsLang(page, 'en');
    await TEST_HELPERS.expectCookieSet(page, 'en');
  });
  
  test('should switch back to English (removes lang param)', async ({ page, selectLang, mockApi }) => {
    await mockApi('/api/health', { ok: true, time: new Date().toISOString() }, 200);
    
    await page.goto('/?lang=ru');
    await page.waitForLoadState('networkidle');
    
    // Переключаем обратно на английский
    await selectLang(page, 'en');
    
    // Проверяем результат
    await TEST_HELPERS.expectSelectValue(page, '[data-testid="lang-select"]', 'en');
    await TEST_HELPERS.expectCookieSet(page, 'en');
    
    // URL не должен содержать параметр lang для базового языка
    await expect(page).not.toHaveURL(/lang=/);
  });
  
  test('should persist language choice across page reloads', async ({ page, selectLang, mockApi }) => {
    await mockApi('/api/health', { ok: true, time: new Date().toISOString() }, 200);
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Переключаем на немецкий
    await selectLang(page, 'de');
    
    // Проверяем, что выбор сохранился
    await TEST_HELPERS.expectSelectValue(page, '[data-testid="lang-select"]', 'de');
    await TEST_HELPERS.expectCookieSet(page, 'de');
    
    // Перезагружаем страницу
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Проверяем, что выбор сохранился после перезагрузки
    await TEST_HELPERS.expectSelectValue(page, '[data-testid="lang-select"]', 'de');
    await TEST_HELPERS.expectCookieSet(page, 'de');
    await TEST_HELPERS.expectUrlContainsLang(page, 'de');
  });
});

import { test, expect } from '../fixtures';
import { TEST_HELPERS } from '../fixtures';

test.describe('i18n: default from Accept-Language', () => {
  test('should detect Russian from Accept-Language header', async ({ page, mockApi }) => {
    // Мокаем health API для стабильности
    await mockApi('/api/health', { ok: true, time: new Date().toISOString() }, 200);
    
    // Заходим на главную страницу
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Проверяем, что селектор языка показывает русский (из Accept-Language)
    await TEST_HELPERS.expectSelectValue(page, '[data-testid="lang-select"]', 'ru');
    
    // Проверяем, что cookie установлен
    await TEST_HELPERS.expectCookieSet(page, 'ru');
    
    // Проверяем, что URL не содержит параметр lang (базовый язык)
    await expect(page).not.toHaveURL(/lang=/);
    
    // Проверяем, что форма генерации доступна
    await expect(page.getByTestId('gen-submit')).toBeVisible();
  });
  
  test('should show Russian text in UI', async ({ page, mockApi }) => {
    await mockApi('/api/health', { ok: true, time: new Date().toISOString() }, 200);
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Проверяем, что интерфейс на русском
    await expect(page.getByRole('heading', { name: 'ExcuseME' })).toBeVisible();
    await expect(page.getByText('Генератор вежливых отмазок')).toBeVisible();
    await expect(page.getByText('Создать отмазку')).toBeVisible();
  });
});

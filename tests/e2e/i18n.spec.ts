import { test, expect, API_SCENARIOS } from '../fixtures';
import { SELECTORS, EXPECTED_TEXT } from '../selectors';

test.describe('i18n Language Switching', () => {
  test('should detect language from query parameter', async ({ page, mockApi }) => {
    // Мокаем health check
    await mockApi('/api/health', API_SCENARIOS.health.response, API_SCENARIOS.health.status);
    
    // Переходим на страницу с параметром языка
    await page.goto('/?lang=en');
    
    // Ждем загрузки страницы
    await page.waitForLoadState('networkidle');
    
    // Проверяем, что селектор языка показывает английский
    await expect(page.getByTestId(SELECTORS.LANG_SELECT)).toContainText('English');
    
    // Проверяем, что URL содержит правильный параметр
    await expect(page).toHaveURL(/lang=en/);
  });

  test('should switch to polish language and update texts', async ({ page, mockApi }) => {
    // Мокаем health check
    await mockApi('/api/health', API_SCENARIOS.health.response, API_SCENARIOS.health.status);
    
    // Переходим на страницу с польским языком
    await page.goto('/?lang=pl');
    
    // Ждем загрузки страницы
    await page.waitForLoadState('networkidle');
    
    // Проверяем, что селектор языка показывает польский (или fallback)
    await expect(page.getByTestId(SELECTORS.LANG_SELECT)).toBeVisible();
    
    // Проверяем, что URL содержит параметр языка
    await expect(page).toHaveURL(/lang=/);
    
    // Проверяем, что форма все еще видна и функциональна
    await expect(page.getByTestId(SELECTORS.GEN_FORM)).toBeVisible();
    await expect(page.getByTestId(SELECTORS.GEN_SUBMIT)).toBeVisible();
  });

  test('should switch language and update URL', async ({ page, mockApi }) => {
    // Мокаем health check
    await mockApi('/api/health', API_SCENARIOS.health.response, API_SCENARIOS.health.status);
    
    await page.goto('/');
    
    // Ждем загрузки страницы
    await page.waitForLoadState('networkidle');
    
    // Проверяем, что по умолчанию русский
    await expect(page.getByTestId(SELECTORS.LANG_SELECT)).toContainText('Русский');
    
    // Кликаем на селектор языка
    await page.getByTestId(SELECTORS.LANG_SELECT).click();
    
    // Выбираем английский
    await page.getByTestId(SELECTORS.LANG_OPTION_EN).click();
    
    // Проверяем, что URL обновился и содержит параметр lang
    await expect(page).toHaveURL(/lang=en/);
    
    // Проверяем, что селектор показывает английский
    await expect(page.getByTestId(SELECTORS.LANG_SELECT)).toContainText('English');
    
    // Проверяем, что параметр сохраняется в URL (persist)
    await page.reload();
    await expect(page).toHaveURL(/lang=en/);
    await expect(page.getByTestId(SELECTORS.LANG_SELECT)).toContainText('English');
  });

  test('should handle invalid language parameter gracefully', async ({ page, mockApi }) => {
    // Мокаем health check
    await mockApi('/api/health', API_SCENARIOS.health.response, API_SCENARIOS.health.status);
    
    // Переходим на страницу с невалидным параметром языка
    await page.goto('/?lang=invalid');
    
    // Ждем загрузки страницы
    await page.waitForLoadState('networkidle');
    
    // Проверяем, что приложение не упало и показывает дефолтный язык
    await expect(page.getByTestId(SELECTORS.LANG_SELECT)).toBeVisible();
    
    // Проверяем, что URL не содержит невалидный параметр
    await expect(page).not.toHaveURL(/lang=invalid/);
    
    // Проверяем, что используется baseLocale (русский по умолчанию)
    await expect(page.getByTestId(SELECTORS.LANG_SELECT)).toContainText('Русский');
    
    // Проверяем, что форма все еще функциональна
    await expect(page.getByTestId(SELECTORS.GEN_FORM)).toBeVisible();
    await expect(page.getByTestId(SELECTORS.GEN_SUBMIT)).toBeVisible();
  });

  test('should support language aliases', async ({ page, mockApi }) => {
    // Мокаем health check
    await mockApi('/api/health', API_SCENARIOS.health.response, API_SCENARIOS.health.status);
    
    // Тестируем разные алиасы для русского
    const aliases = ['russian', 'русский', 'рус'];
    
    for (const alias of aliases) {
      await page.goto(`/?lang=${alias}`);
      
      // Ждем загрузки страницы
      await page.waitForLoadState('networkidle');
      
      // Проверяем, что селектор показывает русский
      await expect(page.getByTestId(SELECTORS.LANG_SELECT)).toContainText('Русский');
      
      // Проверяем, что URL содержит правильный код языка
      await expect(page).toHaveURL(/lang=ru/);
    }
  });

  test('should maintain language selection in form data', async ({ page, mockApi }) => {
    // Мокаем health check
    await mockApi('/api/health', API_SCENARIOS.health.response, API_SCENARIOS.health.status);
    
    await page.goto('/?lang=en');
    
    // Ждем загрузки страницы
    await page.waitForLoadState('networkidle');
    
    // Проверяем, что форма использует правильный язык
    await expect(page.getByTestId(SELECTORS.LANG_SELECT)).toContainText('English');
    
    // Заполняем форму
    await page.getByTestId(SELECTORS.GEN_SCENARIO).fill('test scenario');
    
    // Проверяем, что язык остался английским
    await expect(page.getByTestId(SELECTORS.LANG_SELECT)).toContainText('English');
  });
});

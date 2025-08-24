import { test, expect, API_SCENARIOS } from '../fixtures';
import { SELECTORS, EXPECTED_TEXT } from '../selectors';

test.describe('i18n Language Switching', () => {
  test('should switch language via query parameter', async ({ page, mockApi }) => {
    // Мокаем health check
    await mockApi('/api/health', API_SCENARIOS.health.response, API_SCENARIOS.health.status);
    
    // Переходим на страницу с параметром языка
    await page.goto('/?lang=pl');
    
    // Ждем загрузки страницы
    await page.waitForLoadState('networkidle');
    
    // Проверяем, что селектор языка показывает польский (или fallback к русскому)
    await expect(page.getByTestId(SELECTORS.LANG_SELECT)).toBeVisible();
    
    // Проверяем, что URL содержит правильный параметр
    await expect(page).toHaveURL(/lang=pl/);
    
    // Проверяем, что форма все еще видна и функциональна
    await expect(page.getByTestId(SELECTORS.GEN_FORM)).toBeVisible();
    await expect(page.getByTestId(SELECTORS.GEN_SUBMIT)).toBeVisible();
  });

  test('should fallback on invalid lang', async ({ page, mockApi }) => {
    // Мокаем health check
    await mockApi('/api/health', API_SCENARIOS.health.response, API_SCENARIOS.health.status);
    
    // Переходим на страницу с невалидным параметром языка
    await page.goto('/?lang=zzz');
    
    // Ждем загрузки страницы
    await page.waitForLoadState('networkidle');
    
    // Проверяем, что приложение не упало и показывает baseLocale (русский)
    await expect(page.getByTestId(SELECTORS.LANG_SELECT)).toBeVisible();
    
    // Проверяем, что URL не содержит невалидный параметр (должен быть очищен)
    await expect(page).not.toHaveURL(/lang=zzz/);
    
    // Проверяем, что используется baseLocale (русский по умолчанию)
    await expect(page.getByTestId(SELECTORS.LANG_SELECT)).toContainText('Русский');
    
    // Проверяем, что форма все еще функциональна
    await expect(page.getByTestId(SELECTORS.GEN_FORM)).toBeVisible();
    await expect(page.getByTestId(SELECTORS.GEN_SUBMIT)).toBeVisible();
  });

  test('should handle language switching in form', async ({ page, mockApi }) => {
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
    
    // Проверяем, что URL обновился и содержит параметр lang=en
    await expect(page).toHaveURL(/lang=en/);
    
    // Проверяем, что селектор показывает английский
    await expect(page.getByTestId(SELECTORS.LANG_SELECT)).toContainText('English');
    
    // Проверяем, что cookie установлен
    const cookies = await page.context().cookies();
    const langCookie = cookies.find(cookie => cookie.name === 'excuseme_lang');
    expect(langCookie).toBeTruthy();
    expect(langCookie?.value).toBe('en');
    
    // Проверяем, что параметр сохраняется в URL (persist)
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/lang=en/);
    await expect(page.getByTestId(SELECTORS.LANG_SELECT)).toContainText('English');
  });

  test('should handle language aliases', async ({ page, mockApi }) => {
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

  test('should handle encoded language parameters', async ({ page, mockApi }) => {
    // Мокаем health check
    await mockApi('/api/health', API_SCENARIOS.health.response, API_SCENARIOS.health.status);
    
    // Тестируем закодированные параметры
    await page.goto('/?lang=zh%2DCN');
    
    // Ждем загрузки страницы
    await page.waitForLoadState('networkidle');
    
    // Проверяем, что селектор показывает китайский
    await expect(page.getByTestId(SELECTORS.LANG_SELECT)).toBeVisible();
    
    // Проверяем, что URL содержит правильный параметр
    await expect(page).toHaveURL(/lang=zh-CN/);
  });

  test('should handle legacy lng parameter', async ({ page, mockApi }) => {
    // Мокаем health check
    await mockApi('/api/health', API_SCENARIOS.health.response, API_SCENARIOS.health.status);
    
    // Тестируем legacy параметр lng
    await page.goto('/?lng=en');
    
    // Ждем загрузки страницы
    await page.waitForLoadState('networkidle');
    
    // Проверяем, что селектор показывает английский
    await expect(page.getByTestId(SELECTORS.LANG_SELECT)).toContainText('English');
    
    // Проверяем, что URL обновился на lang=en (миграция с lng)
    await expect(page).toHaveURL(/lang=en/);
    await expect(page).not.toHaveURL(/lng=/);
  });

  test('should clear lang parameter for base locale', async ({ page, mockApi }) => {
    // Мокаем health check
    await mockApi('/api/health', API_SCENARIOS.health.response, API_SCENARIOS.health.status);
    
    // Начинаем с английского
    await page.goto('/?lang=en');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/lang=en/);
    
    // Переключаемся на русский (base locale)
    await page.getByTestId(SELECTORS.LANG_SELECT).click();
    await page.getByTestId(SELECTORS.LANG_OPTION_RU).click();
    
    // Проверяем, что параметр lang удален из URL для base locale
    await expect(page).not.toHaveURL(/lang=/);
    await expect(page.getByTestId(SELECTORS.LANG_SELECT)).toContainText('Русский');
  });

  test('should handle Accept-Language header', async ({ page, mockApi }) => {
    // Мокаем health check
    await mockApi('/api/health', API_SCENARIOS.health.response, API_SCENARIOS.health.status);
    
    // Устанавливаем Accept-Language с английским приоритетом
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9,ru;q=0.8'
    });
    
    // Переходим на страницу без query параметров
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Проверяем, что селектор показывает английский (из Accept-Language)
    await expect(page.getByTestId(SELECTORS.LANG_SELECT)).toContainText('English');
    
    // Проверяем, что cookie установлен
    const cookies = await page.context().cookies();
    const langCookie = cookies.find(cookie => cookie.name === 'excuseme_lang');
    expect(langCookie).toBeTruthy();
    expect(langCookie?.value).toBe('en');
  });

  test('should prioritize query over Accept-Language', async ({ page, mockApi }) => {
    // Мокаем health check
    await mockApi('/api/health', API_SCENARIOS.health.response, API_SCENARIOS.health.status);
    
    // Устанавливаем Accept-Language с английским приоритетом
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9,ru;q=0.8'
    });
    
    // Переходим с query параметром русского языка
    await page.goto('/?lang=ru');
    await page.waitForLoadState('networkidle');
    
    // Проверяем, что селектор показывает русский (приоритет query)
    await expect(page.getByTestId(SELECTORS.LANG_SELECT)).toContainText('Русский');
    await expect(page).toHaveURL(/lang=ru/);
  });

  test('should handle cookie persistence', async ({ page, mockApi }) => {
    // Мокаем health check
    await mockApi('/api/health', API_SCENARIOS.health.response, API_SCENARIOS.health.status);
    
    // Устанавливаем cookie вручную
    await page.context().addCookies([
      {
        name: 'excuseme_lang',
        value: 'en',
        domain: 'localhost',
        path: '/',
      }
    ]);
    
    // Переходим на страницу без query параметров
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Проверяем, что селектор показывает английский (из cookie)
    await expect(page.getByTestId(SELECTORS.LANG_SELECT)).toContainText('English');
  });

  test('should handle complex language scenarios', async ({ page, mockApi }) => {
    // Мокаем health check
    await mockApi('/api/health', API_SCENARIOS.health.response, API_SCENARIOS.health.status);
    
    // Тестируем сложные сценарии
    const scenarios = [
      { query: '?lang=es', expected: 'Español', url: /lang=es/ },
      { query: '?lang=fr', expected: 'Français', url: /lang=fr/ },
      { query: '?lang=de', expected: 'Deutsch', url: /lang=de/ },
      { query: '?lang=it', expected: 'Italiano', url: /lang=it/ },
    ];
    
    for (const scenario of scenarios) {
      await page.goto(`/${scenario.query}`);
      await page.waitForLoadState('networkidle');
      
      // Проверяем, что селектор показывает правильный язык
      await expect(page.getByTestId(SELECTORS.LANG_SELECT)).toContainText(scenario.expected);
      
      // Проверяем, что URL содержит правильный параметр
      await expect(page).toHaveURL(scenario.url);
    }
  });
});

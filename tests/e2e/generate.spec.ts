import { test, expect, API_SCENARIOS, TEST_HELPERS } from '../fixtures';
import { SELECTORS, EXPECTED_TEXT } from '../selectors';

test.describe('Excuse Generation', () => {
  test('should display result when API returns success', async ({ page, mockGenerate, mockTts }) => {
    // Мокаем API responses
    await mockGenerate('success');
    await mockTts('success');
    await page.route('**/api/health', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(API_SCENARIOS.health.response)
    }));

    // Мокаем пользователя
    await TEST_HELPERS.mockUser(page);

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Заполняем форму
    await page.getByTestId(SELECTORS.GEN_SCENARIO).fill('cancel meeting');
    await page.getByTestId(SELECTORS.GEN_CONTEXT).fill('urgent work');
    
    // Отправляем форму
    await page.getByTestId(SELECTORS.GEN_SUBMIT).click();
    
    // Проверяем, что показывается результат
    await expect(page.getByTestId(SELECTORS.GEN_RESULT)).toBeVisible();
    await expect(page.getByTestId(SELECTORS.GEN_RESULT)).toContainText('OK: generated');
  });

  test('should display rate limit error', async ({ page, mockGenerate, mockTts }) => {
    // Мокаем rate limit response
    await mockGenerate('rate');
    await mockTts('success');
    await page.route('**/api/health', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(API_SCENARIOS.health.response)
    }));

    // Мокаем пользователя
    await TEST_HELPERS.mockUser(page);

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Заполняем и отправляем форму
    await page.getByTestId(SELECTORS.GEN_SCENARIO).fill('test rate limit');
    await page.getByTestId(SELECTORS.GEN_SUBMIT).click();
    
    // Проверяем баннер rate limit
    await expect(page.getByTestId(SELECTORS.BANNER_RATE_LIMIT)).toBeVisible();
    await expect(page.getByTestId(SELECTORS.BANNER_RATE_LIMIT)).toContainText('Too many requests');
  });

  test('should display free limit banner', async ({ page, mockGenerate, mockTts }) => {
    // Мокаем free limit response
    await mockGenerate('free');
    await mockTts('success');
    await page.route('**/api/health', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(API_SCENARIOS.health.response)
    }));

    // Мокаем пользователя
    await TEST_HELPERS.mockUser(page);

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Заполняем и отправляем форму
    await page.getByTestId(SELECTORS.GEN_SCENARIO).fill('test free limit');
    await page.getByTestId(SELECTORS.GEN_SUBMIT).click();
    
    // Проверяем баннер лимита
    await expect(page.getByTestId(SELECTORS.BANNER_FREE_LIMIT)).toBeVisible();
    await expect(page.getByTestId(SELECTORS.BANNER_FREE_LIMIT)).toContainText('Free limit reached');
  });

  test('should handle form validation', async ({ page }) => {
    // Мокаем только health check
    await page.route('**/api/health', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(API_SCENARIOS.health.response)
    }));
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Пытаемся отправить пустую форму
    await page.getByTestId(SELECTORS.GEN_SUBMIT).click();
    
    // Проверяем, что поле сценария обязательно (HTML5 validation)
    const scenarioInput = page.getByTestId(SELECTORS.GEN_SCENARIO);
    await expect(scenarioInput).toHaveAttribute('required');
  });

  test('should display auth dialog for unauthorized user', async ({ page, mockGenerate, mockTts }) => {
    // Мокаем API responses
    await mockGenerate('success');
    await mockTts('success');
    await page.route('**/api/health', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(API_SCENARIOS.health.response)
    }));

    // НЕ мокаем пользователя (неавторизованный)

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Заполняем форму
    await page.getByTestId(SELECTORS.GEN_SCENARIO).fill('отмена встречи');
    await page.getByTestId(SELECTORS.GEN_CONTEXT).fill('срочная работа');
    
    // Отправляем форму
    await page.getByTestId(SELECTORS.GEN_SUBMIT).click();
    
    // Проверяем, что показывается диалог авторизации
    await expect(page.getByTestId(SELECTORS.AUTH_DIALOG)).toBeVisible();
  });

  test('should handle TTS API response', async ({ page, mockGenerate, mockTts }) => {
    // Мокаем успешную генерацию и TTS
    await mockGenerate('success');
    await mockTts('success');
    await page.route('**/api/health', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(API_SCENARIOS.health.response)
    }));

    // Мокаем пользователя
    await TEST_HELPERS.mockUser(page);

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Заполняем форму
    await page.getByTestId(SELECTORS.GEN_SCENARIO).fill('тест TTS');
    await page.getByTestId(SELECTORS.GEN_SUBMIT).click();
    
    // Проверяем результат
    await expect(page.getByTestId(SELECTORS.GEN_RESULT)).toBeVisible();
    await expect(page.getByTestId(SELECTORS.GEN_RESULT)).toContainText('OK: generated');
  });

  test('should handle empty TTS response', async ({ page, mockGenerate, mockTts }) => {
    // Мокаем успешную генерацию и пустой TTS
    await mockGenerate('success');
    await mockTts('empty');
    await page.route('**/api/health', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(API_SCENARIOS.health.response)
    }));

    // Мокаем пользователя
    await TEST_HELPERS.mockUser(page);

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Заполняем форму
    await page.getByTestId(SELECTORS.GEN_SCENARIO).fill('тест пустой TTS');
    await page.getByTestId(SELECTORS.GEN_SUBMIT).click();
    
    // Проверяем результат (TTS ошибка не должна влиять на отображение текста)
    await expect(page.getByTestId(SELECTORS.GEN_RESULT)).toBeVisible();
    await expect(page.getByTestId(SELECTORS.GEN_RESULT)).toContainText('OK: generated');
  });
});

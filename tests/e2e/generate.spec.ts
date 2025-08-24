import { test, expect, API_SCENARIOS, TEST_HELPERS } from '../fixtures';
import { SELECTORS, EXPECTED_TEXT } from '../selectors';

test.describe('Excuse Generation', () => {
  test('should display result when API returns success', async ({ page, mockApi }) => {
    // Мокаем API response
    await mockApi('/api/generate', API_SCENARIOS.success.response, API_SCENARIOS.success.status);
    await mockApi('/api/health', API_SCENARIOS.health.response, API_SCENARIOS.health.status);

    // Мокаем пользователя
    await TEST_HELPERS.mockUser(page);

    await page.goto('/');
    
    // Ждем загрузки страницы
    await page.waitForLoadState('networkidle');
    
    // Заполняем форму
    await page.getByTestId(SELECTORS.GEN_SCENARIO).fill('отмена встречи');
    await page.getByTestId(SELECTORS.GEN_CONTEXT).fill('срочная работа');
    
    // Отправляем форму
    await page.getByTestId(SELECTORS.GEN_SUBMIT).click();
    
    // Проверяем, что показывается результат
    await expect(page.getByTestId(SELECTORS.GEN_RESULT)).toBeVisible();
    await expect(page.getByText(API_SCENARIOS.success.response.text)).toBeVisible();
  });

  test('should display rate limit error', async ({ page, mockApi }) => {
    // Мокаем rate limit response
    await mockApi('/api/generate', API_SCENARIOS.rateLimit.response, API_SCENARIOS.rateLimit.status);
    await mockApi('/api/health', API_SCENARIOS.health.response, API_SCENARIOS.health.status);

    // Мокаем пользователя
    await TEST_HELPERS.mockUser(page);

    await page.goto('/');
    
    // Ждем загрузки страницы
    await page.waitForLoadState('networkidle');
    
    // Заполняем и отправляем форму
    await page.getByTestId(SELECTORS.GEN_SCENARIO).fill('тест rate limit');
    await page.getByTestId(SELECTORS.GEN_SUBMIT).click();
    
    // Проверяем баннер rate limit
    await expect(page.getByTestId(SELECTORS.BANNER_RATE_LIMIT)).toBeVisible();
    await expect(page.getByText(EXPECTED_TEXT.BANNERS.RATE_LIMIT_TITLE)).toBeVisible();
  });

  test('should display free limit banner', async ({ page, mockApi }) => {
    // Мокаем free limit response
    await mockApi('/api/generate', API_SCENARIOS.freeLimit.response, API_SCENARIOS.freeLimit.status);
    await mockApi('/api/health', API_SCENARIOS.health.response, API_SCENARIOS.health.status);

    // Мокаем пользователя
    await TEST_HELPERS.mockUser(page);

    await page.goto('/');
    
    // Ждем загрузки страницы
    await page.waitForLoadState('networkidle');
    
    // Заполняем и отправляем форму
    await page.getByTestId(SELECTORS.GEN_SCENARIO).fill('тест free limit');
    await page.getByTestId(SELECTORS.GEN_SUBMIT).click();
    
    // Проверяем баннер лимита
    await expect(page.getByTestId(SELECTORS.BANNER_FREE_LIMIT)).toBeVisible();
    await expect(page.getByText(EXPECTED_TEXT.BANNERS.FREE_LIMIT_TITLE)).toBeVisible();
    await expect(page.getByText(EXPECTED_TEXT.BANNERS.FREE_LIMIT_DESCRIPTION)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Перейти на Pro' })).toBeVisible();
  });

  test('should handle form validation', async ({ page, mockApi }) => {
    // Мокаем health check
    await mockApi('/api/health', API_SCENARIOS.health.response, API_SCENARIOS.health.status);
    
    await page.goto('/');
    
    // Ждем загрузки страницы
    await page.waitForLoadState('networkidle');
    
    // Пытаемся отправить пустую форму
    await page.getByTestId(SELECTORS.GEN_SUBMIT).click();
    
    // Проверяем, что поле сценария обязательно (HTML5 validation)
    const scenarioInput = page.getByTestId(SELECTORS.GEN_SCENARIO);
    await expect(scenarioInput).toHaveAttribute('required');
  });

  test('should display result for authorized user', async ({ page, mockApi }) => {
    // Мокаем API response
    await mockApi('/api/generate', API_SCENARIOS.success.response, API_SCENARIOS.success.status);
    await mockApi('/api/health', API_SCENARIOS.health.response, API_SCENARIOS.health.status);

    // Мокаем пользователя
    await TEST_HELPERS.mockUser(page);

    await page.goto('/');
    
    // Ждем загрузки страницы
    await page.waitForLoadState('networkidle');
    
    // Заполняем форму
    await page.getByTestId(SELECTORS.GEN_SCENARIO).fill('отмена встречи');
    await page.getByTestId(SELECTORS.GEN_CONTEXT).fill('срочная работа');
    
    // Отправляем форму
    await page.getByTestId(SELECTORS.GEN_SUBMIT).click();
    
    // Проверяем, что показывается результат
    await expect(page.getByTestId(SELECTORS.GEN_RESULT)).toBeVisible();
    await expect(page.getByText(API_SCENARIOS.success.response.text)).toBeVisible();
  });
});

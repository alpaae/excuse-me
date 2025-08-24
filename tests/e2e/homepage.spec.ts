import { test, expect, API_SCENARIOS } from '../fixtures';
import { SELECTORS, TEST_HELPERS, EXPECTED_TEXT } from '../selectors';

test.describe('Homepage', () => {
  test('should display main page with generation form', async ({ page, mockApi }) => {
    // Мокаем health check
    await mockApi('/api/health', API_SCENARIOS.health.response, API_SCENARIOS.health.status);
    
    await page.goto('/');

    // Ждем загрузки страницы
    await page.waitForLoadState('networkidle');

    // Проверяем заголовок
    await expect(page).toHaveTitle(/ExcuseME/);
    
    // Проверяем основные элементы страницы
    await expect(page.getByRole('heading', { name: 'ExcuseME' })).toBeVisible();
    await expect(page.getByText('AI helps you create polite and convincing excuses for any situation')).toBeVisible();
    
    // Проверяем форму генерации и все её элементы
    await expect(page.getByTestId(SELECTORS.GEN_FORM)).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Create Excuse' })).toBeVisible();
    await expect(page.getByTestId(SELECTORS.GEN_SCENARIO)).toBeVisible();
    await expect(page.getByTestId(SELECTORS.GEN_CONTEXT)).toBeVisible();
    await expect(page.getByTestId(SELECTORS.GEN_TONE)).toBeVisible();
    await expect(page.getByTestId(SELECTORS.GEN_CHANNEL)).toBeVisible();
    await expect(page.getByTestId(SELECTORS.GEN_SUBMIT)).toBeVisible();
    
    // Проверяем плейсхолдеры
    await expect(page.getByPlaceholder('e.g., canceling a meeting, being late to work, missing a party...')).toBeVisible();
    await expect(page.getByPlaceholder('Additional details for more accurate excuse...')).toBeVisible();
    
    // Проверяем селекты через testid
    await expect(page.getByTestId(SELECTORS.GEN_TONE)).toContainText('Professional'); // Тон по умолчанию
    await expect(page.getByTestId(SELECTORS.GEN_CHANNEL)).toContainText('Email'); // Канал по умолчанию
    
    // Проверяем кнопку генерации
    await expect(page.getByTestId(SELECTORS.GEN_SUBMIT)).toHaveText(EXPECTED_TEXT.GENERATION.BUTTON);
    
    // Проверяем кнопку входа для неавторизованных пользователей
    await expect(page.getByTestId(SELECTORS.BTN_LOGIN)).toBeVisible();
    await expect(page.getByTestId(SELECTORS.BTN_LOGIN)).toHaveText(EXPECTED_TEXT.AUTH.LOGIN_BUTTON);
  });

  test('should show auth form when login button clicked', async ({ page, mockApi }) => {
    // Мокаем health check
    await mockApi('/api/health', API_SCENARIOS.health.response, API_SCENARIOS.health.status);
    
    await page.goto('/');
    
    // Ждем загрузки страницы
    await page.waitForLoadState('networkidle');
    
    // Проверяем, что форма генерации видна
    await expect(page.getByTestId(SELECTORS.GEN_FORM)).toBeVisible();
    
    // Кликаем на кнопку входа
    await page.getByTestId(SELECTORS.BTN_LOGIN).click();
    
    // Проверяем, что отображается диалог авторизации
    await expect(page.getByTestId(SELECTORS.AUTH_DIALOG)).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    
    // Проверяем, что форма генерации остается видимой под модальным окном
    await expect(page.getByTestId(SELECTORS.GEN_FORM)).toBeVisible();
  });
});

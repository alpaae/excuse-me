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
    await expect(page.getByText('Генератор вежливых отмазок')).toBeVisible();
    
    // Проверяем форму генерации и все её элементы
    await expect(page.getByTestId(SELECTORS.GEN_FORM)).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Создать отмазку' })).toBeVisible();
    await expect(page.getByTestId(SELECTORS.GEN_SCENARIO)).toBeVisible();
    await expect(page.getByTestId(SELECTORS.GEN_CONTEXT)).toBeVisible();
    await expect(page.getByTestId(SELECTORS.GEN_TONE)).toBeVisible();
    await expect(page.getByTestId(SELECTORS.GEN_CHANNEL)).toBeVisible();
    await expect(page.getByTestId(SELECTORS.LANG_SELECT)).toBeVisible();
    await expect(page.getByTestId(SELECTORS.GEN_SUBMIT)).toBeVisible();
    
    // Проверяем плейсхолдеры
    await expect(page.getByPlaceholder('Например: отмена встречи')).toBeVisible();
    await expect(page.getByPlaceholder('Дополнительные детали')).toBeVisible();
    
    // Проверяем селекты через testid
    await expect(page.getByTestId(SELECTORS.GEN_TONE)).toContainText('Профессиональный'); // Тон по умолчанию
    await expect(page.getByTestId(SELECTORS.GEN_CHANNEL)).toContainText('Email'); // Канал по умолчанию
    await expect(page.getByTestId(SELECTORS.LANG_SELECT)).toContainText('Русский'); // Язык по умолчанию
    
    // Проверяем кнопку генерации
    await expect(page.getByTestId(SELECTORS.GEN_SUBMIT)).toHaveText(EXPECTED_TEXT.GENERATION.BUTTON);
    
    // Проверяем призыв к авторизации для неавторизованных пользователей
    await expect(page.getByText('Войдите, чтобы сохранять историю')).toBeVisible();
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
    await expect(page.getByRole('heading', { name: 'Войти в ExcuseME' })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Отправить magic link' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Войти через GitHub' })).toBeVisible();
    
    // Проверяем, что форма генерации остается видимой под модальным окном
    await expect(page.getByTestId(SELECTORS.GEN_FORM)).toBeVisible();
  });
});

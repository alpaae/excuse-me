import { test, expect, API_SCENARIOS } from '../fixtures';
import { SELECTORS, TEST_HELPERS, EXPECTED_TEXT } from '../selectors';

test.describe('Homepage', () => {
  test('should display main page with generation form', async ({ page, mockApi }) => {
    // Мокаем health check
    await mockApi('/api/health', API_SCENARIOS.health.response, API_SCENARIOS.health.status);
    
    await page.goto('/');

    // Проверяем заголовок
    await expect(page).toHaveTitle(/ExcuseME/);
    
    // Проверяем основные элементы страницы
    await expect(page.getByRole('heading', { name: 'ExcuseME' })).toBeVisible();
    await expect(page.getByText('Генератор вежливых отмазок')).toBeVisible();
    
    // Проверяем форму генерации
    await expect(page.getByRole('heading', { name: 'Создать отмазку' })).toBeVisible();
    await expect(page.getByLabel('Сценарий')).toBeVisible();
    await expect(page.getByPlaceholder('Например: отмена встречи')).toBeVisible();
    
    // Проверяем селекты
    await expect(page.getByText('Профессиональный')).toBeVisible(); // Тон по умолчанию
    await expect(page.getByText('Email')).toBeVisible(); // Канал по умолчанию
    await expect(page.getByText('Русский')).toBeVisible(); // Язык по умолчанию
    
    // Проверяем кнопку генерации
    await expect(page.getByTestId(SELECTORS.GEN_SUBMIT)).toBeVisible();
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
    
    // Кликаем на кнопку входа
    await page.getByTestId(SELECTORS.BTN_LOGIN).click();
    
    // Проверяем, что отображается форма авторизации
    await expect(page.getByTestId(SELECTORS.AUTH_DIALOG)).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Войти в ExcuseME' })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Отправить magic link' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Войти через GitHub' })).toBeVisible();
  });
});

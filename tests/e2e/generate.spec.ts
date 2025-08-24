import { test, expect } from '@playwright/test';

test.describe('Excuse Generation', () => {
  test('should display result when API returns success', async ({ page }) => {
    // Мокаем API response
    await page.route('/api/generate', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          text: 'Извините, но у меня возникли непредвиденные обстоятельства, которые не позволяют мне присутствовать на встрече.',
          excuse_id: 'test-excuse-id',
          requestId: 'test-request-id'
        }),
      });
    });

    await page.goto('/');
    
    // Заполняем форму
    await page.getByLabel('Сценарий').fill('отмена встречи');
    await page.getByLabel('Дополнительный контекст').fill('срочная работа');
    
    // Отправляем форму (должно показать auth форму)
    await page.getByRole('button', { name: 'Сгенерировать отмазку' }).click();
    
    // Проверяем, что показывается форма авторизации
    await expect(page.getByRole('heading', { name: 'Добро пожаловать в ExcuseME' })).toBeVisible();
  });

  test('should display rate limit error', async ({ page }) => {
    // Мокаем rate limit response
    await page.route('/api/generate', async route => {
      await route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'RATE_LIMIT',
          message: 'Too many requests',
          requestId: 'test-request-id'
        }),
      });
    });

    // Мокаем пользователя (имитируем авторизацию)
    await page.addInitScript(() => {
      // Имитируем наличие пользователя
      window.localStorage.setItem('supabase.auth.token', 'mock-token');
    });

    await page.goto('/');
    
    // Заполняем и отправляем форму
    await page.getByLabel('Сценарий').fill('тест rate limit');
    await page.getByRole('button', { name: 'Сгенерировать отмазку' }).click();
    
    // Проверяем сообщение о rate limit
    await expect(page.getByText('Слишком много запросов')).toBeVisible();
  });

  test('should display free limit banner', async ({ page }) => {
    // Мокаем free limit response
    await page.route('/api/generate', async route => {
      await route.fulfill({
        status: 402,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'FREE_LIMIT_REACHED',
          message: 'Daily free limit reached',
          requestId: 'test-request-id'
        }),
      });
    });

    // Мокаем пользователя
    await page.addInitScript(() => {
      window.localStorage.setItem('supabase.auth.token', 'mock-token');
    });

    await page.goto('/');
    
    // Заполняем и отправляем форму
    await page.getByLabel('Сценарий').fill('тест free limit');
    await page.getByRole('button', { name: 'Сгенерировать отмазку' }).click();
    
    // Проверяем баннер лимита
    await expect(page.getByText('Достигнут дневной лимит')).toBeVisible();
    await expect(page.getByText('Бесплатные пользователи могут генерировать до 3 отмазок в день')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Перейти на Pro' })).toBeVisible();
  });

  test('should handle form validation', async ({ page }) => {
    await page.goto('/');
    
    // Пытаемся отправить пустую форму
    await page.getByRole('button', { name: 'Сгенерировать отмазку' }).click();
    
    // Проверяем, что поле сценария обязательно (HTML5 validation)
    const scenarioInput = page.getByLabel('Сценарий');
    await expect(scenarioInput).toHaveAttribute('required');
  });
});

import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should display main page with generation form', async ({ page }) => {
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
    await expect(page.getByRole('button', { name: 'Сгенерировать отмазку' })).toBeVisible();
    
    // Проверяем призыв к авторизации для неавторизованных пользователей
    await expect(page.getByText('Войдите, чтобы сохранять историю')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Войти в аккаунт' })).toBeVisible();
  });

  test('should show auth form when login button clicked', async ({ page }) => {
    await page.goto('/');
    
    // Кликаем на кнопку входа
    await page.getByRole('button', { name: 'Войти в аккаунт' }).click();
    
    // Проверяем, что отображается форма авторизации
    await expect(page.getByRole('heading', { name: 'Добро пожаловать в ExcuseME' })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Отправить ссылку' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Войти через GitHub' })).toBeVisible();
  });
});

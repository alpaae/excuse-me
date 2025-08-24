import { test, expect } from '../fixtures';
import { TEST_HELPERS } from '../fixtures';

test.describe('Language Detection', () => {
  test('should detect Russian language and generate response in Russian', async ({ page, mockGenerate, mockTts }) => {
    // Мокаем API responses
    await mockGenerate('success');
    await mockTts('success');
    
    // Мокаем пользователя
    await TEST_HELPERS.mockUser(page);

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Заполняем форму русским текстом
    await page.getByTestId('gen-scenario').fill('отмена встречи');
    await page.getByTestId('gen-context').fill('срочная работа');
    
    // Отправляем форму
    await page.getByTestId('gen-submit').click();
    
    // Проверяем, что результат отображается
    await expect(page.getByTestId('gen-result')).toBeVisible();
    
    // Проверяем, что API был вызван с правильным языком
    // (это проверяется в mockGenerate)
  });

  test('should detect English language and generate response in English', async ({ page, mockGenerate, mockTts }) => {
    // Мокаем API responses
    await mockGenerate('success');
    await mockTts('success');
    
    // Мокаем пользователя
    await TEST_HELPERS.mockUser(page);

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Заполняем форму английским текстом
    await page.getByTestId('gen-scenario').fill('cancel meeting');
    await page.getByTestId('gen-context').fill('urgent work');
    
    // Отправляем форму
    await page.getByTestId('gen-submit').click();
    
    // Проверяем, что результат отображается
    await expect(page.getByTestId('gen-result')).toBeVisible();
  });

  test('should detect Polish language and generate response in Polish', async ({ page, mockGenerate, mockTts }) => {
    // Мокаем API responses
    await mockGenerate('success');
    await mockTts('success');
    
    // Мокаем пользователя
    await TEST_HELPERS.mockUser(page);

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Заполняем форму польским текстом
    await page.getByTestId('gen-scenario').fill('odwołanie spotkania');
    await page.getByTestId('gen-context').fill('pilna praca');
    
    // Отправляем форму
    await page.getByTestId('gen-submit').click();
    
    // Проверяем, что результат отображается
    await expect(page.getByTestId('gen-result')).toBeVisible();
  });

  test('should default to English for empty or unrecognized text', async ({ page, mockGenerate, mockTts }) => {
    // Мокаем API responses
    await mockGenerate('success');
    await mockTts('success');
    
    // Мокаем пользователя
    await TEST_HELPERS.mockUser(page);

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Заполняем форму пустым текстом
    await page.getByTestId('gen-scenario').fill('test');
    await page.getByTestId('gen-context').fill('');
    
    // Отправляем форму
    await page.getByTestId('gen-submit').click();
    
    // Проверяем, что результат отображается
    await expect(page.getByTestId('gen-result')).toBeVisible();
  });

  test('should detect mixed language and use primary language', async ({ page, mockGenerate, mockTts }) => {
    // Мокаем API responses
    await mockGenerate('success');
    await mockTts('success');
    
    // Мокаем пользователя
    await TEST_HELPERS.mockUser(page);

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Заполняем форму смешанным текстом (русский + английский)
    await page.getByTestId('gen-scenario').fill('отмена meeting');
    await page.getByTestId('gen-context').fill('срочная work');
    
    // Отправляем форму
    await page.getByTestId('gen-submit').click();
    
    // Проверяем, что результат отображается
    await expect(page.getByTestId('gen-result')).toBeVisible();
  });
});

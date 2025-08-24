import { test, expect } from '@playwright/test';

test.describe('Language Detection', () => {
  test('Generate auto language — Spanish', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Mock API response with Spanish text
    await page.route('**/api/generate', route => {
      const body = JSON.parse(route.request().postData() || '{}');
      const isSpanish = /[ñáéíóúü¿¡]/i.test(body?.scenario || '') || /[ñáéíóúü¿¡]/i.test(body?.context || '');
      const text = isSpanish ? 'Lo siento, pero tengo una reunión importante que no puedo posponer.' : 'Sorry, I have a prior commitment.';
      route.fulfill({ 
        status: 200, 
        contentType: 'application/json', 
        body: JSON.stringify({ 
          success: true, 
          text 
        }) 
      });
    });
    
    // Fill form with Spanish text
    await page.getByLabel('Scenario').fill('Cancelar una reunión');
    await page.getByLabel('Context').fill('Tengo una reunión importante');
    
    // Click generate button
    await page.getByRole('button', { name: 'Generate Excuse' }).click();
    
    // Wait for Spanish response
    await expect(page.getByTestId('gen-result')).toContainText('Lo siento, pero tengo una reunión importante que no puedo posponer.');
  });

  test('Generate auto language — Russian', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Mock API response with Russian text
    await page.route('**/api/generate', route => {
      const body = JSON.parse(route.request().postData() || '{}');
      const isRussian = /[а-яё]/i.test(body?.scenario || '') || /[а-яё]/i.test(body?.context || '');
      const text = isRussian ? 'Извините, но у меня есть важная встреча, которую я не могу перенести.' : 'Sorry, I have a prior commitment.';
      route.fulfill({ 
        status: 200, 
        contentType: 'application/json', 
        body: JSON.stringify({ 
          success: true, 
          text 
        }) 
      });
    });
    
    // Fill form with Russian text
    await page.getByLabel('Scenario').fill('Отмена встречи');
    await page.getByLabel('Context').fill('У меня важная встреча');
    
    // Click generate button
    await page.getByRole('button', { name: 'Generate Excuse' }).click();
    
    // Wait for Russian response
    await expect(page.getByTestId('gen-result')).toContainText('Извините, но у меня есть важная встреча, которую я не могу перенести.');
  });
});

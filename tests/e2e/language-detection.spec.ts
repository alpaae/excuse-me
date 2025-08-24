import { test, expect } from '@playwright/test';

test.describe('Language Detection', () => {
  test('should detect Russian language from input', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Mock API response
    await page.route('/api/generate', async route => {
      const request = route.request();
      const body = JSON.parse(request.postData() || '{}');
      
      // Check that language was detected as Russian
      expect(body.lang).toBe('ru');
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          text: 'Извините, но у меня есть важная встреча, которую я не могу перенести.'
        })
      });
    });
    
    // Fill form with Russian text
    await page.getByLabel('Scenario').fill('Отмена встречи');
    await page.getByLabel('Context').fill('У меня важная встреча');
    
    // Click generate button
    await page.getByRole('button', { name: 'Generate Excuse' }).click();
    
    // Wait for Russian response
    await expect(page.getByText('Извините, но у меня есть важная встреча, которую я не могу перенести.')).toBeVisible();
  });

  test('should detect Polish language from input', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Mock API response
    await page.route('/api/generate', async route => {
      const request = route.request();
      const body = JSON.parse(request.postData() || '{}');
      
      // Check that language was detected as Polish
      expect(body.lang).toBe('pl');
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          text: 'Przepraszam, ale mam ważne spotkanie, którego nie mogę przełożyć.'
        })
      });
    });
    
    // Fill form with Polish text
    await page.getByLabel('Scenario').fill('Odwołanie spotkania');
    await page.getByLabel('Context').fill('Mam ważne spotkanie');
    
    // Click generate button
    await page.getByRole('button', { name: 'Generate Excuse' }).click();
    
    // Wait for Polish response
    await expect(page.getByText('Przepraszam, ale mam ważne spotkanie, którego nie mogę przełożyć.')).toBeVisible();
  });

  test('should detect German language from input', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Mock API response
    await page.route('/api/generate', async route => {
      const request = route.request();
      const body = JSON.parse(request.postData() || '{}');
      
      // Check that language was detected as German
      expect(body.lang).toBe('de');
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          text: 'Entschuldigung, aber ich habe ein wichtiges Treffen, das ich nicht verschieben kann.'
        })
      });
    });
    
    // Fill form with German text
    await page.getByLabel('Scenario').fill('Treffen absagen');
    await page.getByLabel('Context').fill('Ich habe ein wichtiges Treffen');
    
    // Click generate button
    await page.getByRole('button', { name: 'Generate Excuse' }).click();
    
    // Wait for German response
    await expect(page.getByText('Entschuldigung, aber ich habe ein wichtiges Treffen, das ich nicht verschieben kann.')).toBeVisible();
  });

  test('should detect French language from input', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Mock API response
    await page.route('/api/generate', async route => {
      const request = route.request();
      const body = JSON.parse(request.postData() || '{}');
      
      // Check that language was detected as French
      expect(body.lang).toBe('fr');
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          text: 'Je m\'excuse, mais j\'ai une réunion importante que je ne peux pas reporter.'
        })
      });
    });
    
    // Fill form with French text
    await page.getByLabel('Scenario').fill('Annuler une réunion');
    await page.getByLabel('Context').fill('J\'ai une réunion importante');
    
    // Click generate button
    await page.getByRole('button', { name: 'Generate Excuse' }).click();
    
    // Wait for French response
    await expect(page.getByText('Je m\'excuse, mais j\'ai une réunion importante que je ne peux pas reporter.')).toBeVisible();
  });

  test('should detect Spanish language from input', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Mock API response
    await page.route('/api/generate', async route => {
      const request = route.request();
      const body = JSON.parse(request.postData() || '{}');
      
      // Check that language was detected as Spanish
      expect(body.lang).toBe('es');
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          text: 'Lo siento, pero tengo una reunión importante que no puedo posponer.'
        })
      });
    });
    
    // Fill form with Spanish text
    await page.getByLabel('Scenario').fill('Cancelar una reunión');
    await page.getByLabel('Context').fill('Tengo una reunión importante');
    
    // Click generate button
    await page.getByRole('button', { name: 'Generate Excuse' }).click();
    
    // Wait for Spanish response
    await expect(page.getByText('Lo siento, pero tengo una reunión importante que no puedo posponer.')).toBeVisible();
  });

  test('should default to English for mixed or unclear input', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Mock API response
    await page.route('/api/generate', async route => {
      const request = route.request();
      const body = JSON.parse(request.postData() || '{}');
      
      // Check that language defaults to English
      expect(body.lang).toBe('en');
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          text: 'I apologize, but I have a prior commitment that I cannot reschedule.'
        })
      });
    });
    
    // Fill form with mixed or unclear text
    await page.getByLabel('Scenario').fill('Meeting cancellation');
    await page.getByLabel('Context').fill('12345 !@#$%');
    
    // Click generate button
    await page.getByRole('button', { name: 'Generate Excuse' }).click();
    
    // Wait for English response
    await expect(page.getByText('I apologize, but I have a prior commitment that I cannot reschedule.')).toBeVisible();
  });
});

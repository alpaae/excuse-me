import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('homepage render', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check page title
    await expect(page).toHaveTitle(/ExcuseME/);
    
    // Check main elements
    await expect(page.getByRole('heading', { name: 'ExcuseME' })).toBeVisible();
    await expect(page.getByText('AI helps you create polite and convincing excuses for any situation')).toBeVisible();
    
    // Check generation form elements
    await expect(page.getByTestId('gen-form')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Create Excuse' })).toBeVisible();
    await expect(page.getByLabel('Scenario')).toBeVisible();
    await expect(page.getByLabel('Context')).toBeVisible();
    await expect(page.getByTestId('gen-tone')).toBeVisible();
    await expect(page.getByTestId('gen-channel')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Generate Excuse' })).toBeVisible();
    
    // Check sign in button for non-authenticated users
    await expect(page.getByTestId('btn-login')).toBeVisible();
    await expect(page.getByTestId('btn-login')).toHaveText('Sign In');
  });

  test('generate success', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Mock successful API response
    await page.route('/api/generate', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          text: 'I apologize, but I have a prior commitment that I cannot reschedule.'
        })
      });
    });
    
    // Fill the form
    await page.getByLabel('Scenario').fill('Canceling a meeting');
    await page.getByLabel('Context').fill('I have another important meeting');
    
    // Click generate button
    await page.getByRole('button', { name: 'Generate Excuse' }).click();
    
    // Wait for result
    await expect(page.getByText('I apologize, but I have a prior commitment that I cannot reschedule.')).toBeVisible();
    
    // Check that copy and share buttons are visible
    await expect(page.getByRole('button', { name: 'Copy' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Share' })).toBeVisible();
  });

  test('generate auto-language — Spanish', async ({ page }) => {
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
});

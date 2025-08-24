import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('homepage render', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
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

  test('auth modal when trying to generate', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Fill form with test data
    await page.getByLabel('Scenario').fill('Test scenario');
    await page.getByLabel('Context').fill('Test context');
    
    // Click generate button (should show auth modal for unauthenticated user)
    await page.getByRole('button', { name: 'Generate Excuse' }).click();
    
    // Check that auth modal is shown
    await expect(page.getByTestId('auth-dialog')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    
    // Verify that the form data is still there
    await expect(page.getByLabel('Scenario')).toHaveValue('Test scenario');
    await expect(page.getByLabel('Context')).toHaveValue('Test context');
  });

  test('form validation and UI interactions', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Test tone selection
    await page.getByTestId('gen-tone').click();
    await page.getByRole('option', { name: 'Friendly' }).click();
    await expect(page.getByTestId('gen-tone')).toContainText('Friendly');
    
    // Test channel selection
    await page.getByTestId('gen-channel').click();
    await page.getByRole('option', { name: 'Message' }).click();
    await expect(page.getByTestId('gen-channel')).toContainText('Message');
    
    // Test form filling
    await page.getByLabel('Scenario').fill('Meeting cancellation');
    await page.getByLabel('Context').fill('Important client meeting');
    
    // Verify form data
    await expect(page.getByLabel('Scenario')).toHaveValue('Meeting cancellation');
    await expect(page.getByLabel('Context')).toHaveValue('Important client meeting');
  });
});

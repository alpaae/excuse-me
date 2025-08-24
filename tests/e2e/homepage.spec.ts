import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should display main page with generation form', async ({ page }) => {
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
    
    // Check placeholders
    await expect(page.getByPlaceholder('e.g., canceling a meeting, being late to work, missing a party...')).toBeVisible();
    await expect(page.getByPlaceholder('Additional details for more accurate excuse...')).toBeVisible();
    
    // Check default values
    await expect(page.getByTestId('gen-tone')).toContainText('Professional');
    await expect(page.getByTestId('gen-channel')).toContainText('Email');
    
    // Check sign in button for non-authenticated users
    await expect(page.getByTestId('btn-login')).toBeVisible();
    await expect(page.getByTestId('btn-login')).toHaveText('Sign In');
  });

  test('should show auth form when login button clicked', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check that generation form is visible
    await expect(page.getByTestId('gen-form')).toBeVisible();
    
    // Click login button
    await page.getByTestId('btn-login').click();
    
    // Check that auth dialog is displayed
    await expect(page.getByTestId('auth-dialog')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    
    // Check that generation form remains visible under modal
    await expect(page.getByTestId('gen-form')).toBeVisible();
  });



  test('should show auth modal when unauthenticated user tries to generate', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Fill form with test data
    await page.getByLabel('Scenario').fill('Test scenario');
    await page.getByLabel('Context').fill('Test context');
    
    // Click generate button (should show auth modal for unauthenticated user)
    await page.getByRole('button', { name: 'Generate Excuse' }).click();
    
    // Check that auth modal is shown instead of generating
    await expect(page.getByTestId('auth-dialog')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    
    // Verify that the form data is still there
    await expect(page.getByLabel('Scenario')).toHaveValue('Test scenario');
    await expect(page.getByLabel('Context')).toHaveValue('Test context');
  });
});

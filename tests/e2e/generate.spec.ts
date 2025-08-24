import { test, expect } from '@playwright/test';

test.describe('Generate Excuse', () => {
  test('should generate excuse successfully', async ({ page }) => {
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
    
    // Select tone and channel
    await page.getByTestId('gen-tone').click();
    await page.getByRole('option', { name: 'Professional' }).click();
    
    await page.getByTestId('gen-channel').click();
    await page.getByRole('option', { name: 'Email' }).click();
    
    // Click generate button
    await page.getByRole('button', { name: 'Generate Excuse' }).click();
    
    // Wait for result
    await expect(page.getByText('I apologize, but I have a prior commitment that I cannot reschedule.')).toBeVisible();
    
    // Check that copy and share buttons are visible
    await expect(page.getByRole('button', { name: 'Copy' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Share' })).toBeVisible();
  });

  test('should show rate limit error', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Mock rate limit error
    await page.route('/api/generate', async route => {
      await route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'RATE_LIMIT'
        })
      });
    });
    
    // Fill the form
    await page.getByLabel('Scenario').fill('Test scenario');
    await page.getByLabel('Context').fill('Test context');
    
    // Click generate button
    await page.getByRole('button', { name: 'Generate Excuse' }).click();
    
    // Check that rate limit banner is shown
    await expect(page.getByTestId('banner-rate-limit')).toBeVisible();
    await expect(page.getByText('Too many requests')).toBeVisible();
  });

  test('should show free limit error', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Mock free limit error
    await page.route('/api/generate', async route => {
      await route.fulfill({
        status: 402,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'FREE_LIMIT_REACHED'
        })
      });
    });
    
    // Fill the form
    await page.getByLabel('Scenario').fill('Test scenario');
    await page.getByLabel('Context').fill('Test context');
    
    // Click generate button
    await page.getByRole('button', { name: 'Generate Excuse' }).click();
    
    // Check that free limit banner is shown
    await expect(page.getByTestId('banner-free-limit')).toBeVisible();
    await expect(page.getByText('Free limit reached')).toBeVisible();
  });

  test('should copy excuse to clipboard', async ({ page }) => {
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
          text: 'Test excuse text'
        })
      });
    });
    
    // Fill and submit form
    await page.getByLabel('Scenario').fill('Test scenario');
    await page.getByLabel('Context').fill('Test context');
    await page.getByRole('button', { name: 'Generate Excuse' }).click();
    
    // Wait for result
    await expect(page.getByText('Test excuse text')).toBeVisible();
    
    // Mock clipboard API
    await page.evaluate(() => {
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: () => Promise.resolve()
        }
      });
    });
    
    // Click copy button
    await page.getByRole('button', { name: 'Copy' }).click();
    
    // Check success message
    await expect(page.getByText('Copied to clipboard')).toBeVisible();
  });

  test('should change tone and channel options', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Test tone selection
    await page.getByTestId('gen-tone').click();
    await page.getByRole('option', { name: 'Casual' }).click();
    await expect(page.getByTestId('gen-tone')).toContainText('Casual');
    
    await page.getByTestId('gen-tone').click();
    await page.getByRole('option', { name: 'Formal' }).click();
    await expect(page.getByTestId('gen-tone')).toContainText('Formal');
    
    // Test channel selection
    await page.getByTestId('gen-channel').click();
    await page.getByRole('option', { name: 'Message' }).click();
    await expect(page.getByTestId('gen-channel')).toContainText('Message');
    
    await page.getByTestId('gen-channel').click();
    await page.getByRole('option', { name: 'Call' }).click();
    await expect(page.getByTestId('gen-channel')).toContainText('Call');
  });
});

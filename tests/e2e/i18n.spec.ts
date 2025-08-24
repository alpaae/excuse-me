import { test, expect } from '@playwright/test';

test.describe('Internationalization', () => {
  test('should switch language via query parameter', async ({ page }) => {
    // Мокаем i18n API для польского языка
    await page.route('/api/i18n/pl/common', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          'app.title': 'ExcuseME',
          'app.subtitle': 'Generator grzecznych wymówek',
          'form.title': 'Utwórz wymówkę',
          'form.scenario': 'Scenariusz',
          'form.scenario.placeholder': 'Na przykład: odwołanie spotkania, spóźnienie do pracy...',
          'form.tone': 'Ton',
          'form.tone.professional': 'Profesjonalny',
          'form.tone.friendly': 'Przyjazny',
          'form.tone.formal': 'Formalny',
          'form.tone.casual': 'Nieformalny',
          'form.channel': 'Kanał',
          'form.channel.email': 'Email',
          'form.channel.message': 'Wiadomość',
          'form.channel.call': 'Telefon',
          'form.channel.in_person': 'Osobiście',
          'form.language': 'Język',
          'form.language.ru': 'Rosyjski',
          'form.language.en': 'Angielski',
          'form.language.pl': 'Polski',
          'form.context': 'Dodatkowy kontekst (opcjonalnie)',
          'form.context.placeholder': 'Dodatkowe szczegóły...',
          'form.submit': 'Wygeneruj wymówkę',
          'auth.cta': 'Zaloguj się, aby zapisywać historię wymówek',
          'auth.login': 'Zaloguj się'
        }),
      });
    });

    // Переходим на страницу с польским языком
    await page.goto('/?lang=pl');
    
    // Ждем загрузки и применения переводов
    await page.waitForTimeout(1000);
    
    // Проверяем, что контент изменился на польский
    await expect(page.getByText('Generator grzecznych wymówek')).toBeVisible();
    await expect(page.getByText('Utwórz wymówkę')).toBeVisible();
    await expect(page.getByText('Scenariusz')).toBeVisible();
    await expect(page.getByPlaceholder('Na przykład: odwołanie spotkania')).toBeVisible();
    
    // Проверяем опции в селектах
    await expect(page.getByText('Profesjonalny')).toBeVisible();
    await expect(page.getByText('Email')).toBeVisible();
    
    // Проверяем кнопку
    await expect(page.getByRole('button', { name: 'Wygeneruj wymówkę' })).toBeVisible();
    
    // Проверяем призыв к авторизации
    await expect(page.getByText('Zaloguj się, aby zapisywać historię')).toBeVisible();
  });

  test('should persist language choice in URL', async ({ page }) => {
    await page.goto('/?lang=en');
    
    // Проверяем, что URL содержит параметр языка
    expect(page.url()).toContain('lang=en');
    
    // Переходим на другую страницу с тем же языком
    await page.goto('/?lang=pl');
    expect(page.url()).toContain('lang=pl');
  });

  test('should fallback to default language on invalid lang param', async ({ page }) => {
    // Мокаем fallback для несуществующего языка
    await page.route('/api/i18n/invalid/common', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          'app.title': 'ExcuseME',
          'app.subtitle': 'Генератор вежливых отмазок', // Fallback на русский
        }),
      });
    });

    await page.goto('/?lang=invalid');
    
    // Проверяем, что показывается контент по умолчанию (русский)
    await expect(page.getByText('ExcuseME')).toBeVisible();
    await expect(page.getByText('Генератор вежливых отмазок')).toBeVisible();
  });

  test('should handle language switching in form elements', async ({ page }) => {
    // Мокаем API для английского
    await page.route('/api/i18n/en/common', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          'form.language.ru': 'Russian',
          'form.language.en': 'English',
          'form.tone.professional': 'Professional',
          'form.channel.email': 'Email',
        }),
      });
    });

    await page.goto('/?lang=en');
    await page.waitForTimeout(1000);
    
    // Проверяем, что опции в селектах переведены
    await expect(page.getByText('Professional')).toBeVisible();
    await expect(page.getByText('Russian')).toBeVisible();
    await expect(page.getByText('English')).toBeVisible();
  });
});

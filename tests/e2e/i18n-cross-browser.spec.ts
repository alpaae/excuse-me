import { test, expect, API_SCENARIOS } from '../fixtures';
import { SELECTORS } from '../selectors';

test.describe('i18n Cross-Browser Compatibility', () => {
  test('should have consistent language detection across browsers', async ({ page, mockApi }) => {
    // Мокаем health check
    await mockApi('/api/health', API_SCENARIOS.health.response, API_SCENARIOS.health.status);
    
    // Тестируем различные сценарии детекта языка
    const testScenarios = [
      {
        name: 'query parameter priority',
        url: '/?lang=en',
        expectedLang: 'English',
        expectedUrl: /lang=en/,
        description: 'Query parameter should have highest priority'
      },
      {
        name: 'invalid lang fallback',
        url: '/?lang=zzz',
        expectedLang: 'Русский',
        expectedUrl: /^(?!.*lang=zzz)/, // URL should NOT contain lang=zzz
        description: 'Invalid language should fallback to base locale'
      },
      {
        name: 'language aliases',
        url: '/?lang=russian',
        expectedLang: 'Русский',
        expectedUrl: /lang=ru/,
        description: 'Language aliases should be normalized'
      },
      {
        name: 'encoded parameters',
        url: '/?lang=zh%2DCN',
        expectedLang: '中文',
        expectedUrl: /lang=zh-CN/,
        description: 'URL-encoded parameters should be decoded'
      },
      {
        name: 'legacy lng parameter',
        url: '/?lng=en',
        expectedLang: 'English',
        expectedUrl: /lang=en/,
        description: 'Legacy lng parameter should migrate to lang'
      }
    ];

    for (const scenario of testScenarios) {
      await page.goto(scenario.url);
      await page.waitForLoadState('networkidle');

      // Проверяем, что селектор показывает ожидаемый язык
      await expect(page.getByTestId(SELECTORS.LANG_SELECT)).toContainText(scenario.expectedLang);
      
      // Проверяем, что URL соответствует ожиданиям
      if (scenario.expectedUrl instanceof RegExp) {
        await expect(page).toHaveURL(scenario.expectedUrl);
      }
      
      // Проверяем, что форма остается функциональной
      await expect(page.getByTestId(SELECTORS.GEN_FORM)).toBeVisible();
      await expect(page.getByTestId(SELECTORS.GEN_SUBMIT)).toBeVisible();
    }
  });

  test('should have consistent URL sync across browsers', async ({ page, mockApi }) => {
    // Мокаем health check
    await mockApi('/api/health', API_SCENARIOS.health.response, API_SCENARIOS.health.status);
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Тестируем переключение языков через селект
    const languageSwitches = [
      { from: 'Русский', to: 'English', option: SELECTORS.LANG_OPTION_EN, expectedUrl: /lang=en/ },
      { from: 'English', to: 'Español', option: '[data-value="es"]', expectedUrl: /lang=es/ },
      { from: 'Español', to: 'Русский', option: SELECTORS.LANG_OPTION_RU, expectedUrl: /^(?!.*lang=)/ }, // No lang param for base locale
    ];

    for (const switchTest of languageSwitches) {
      // Проверяем текущий язык
      await expect(page.getByTestId(SELECTORS.LANG_SELECT)).toContainText(switchTest.from);
      
      // Переключаем язык
      await page.getByTestId(SELECTORS.LANG_SELECT).click();
      await page.locator(switchTest.option).click();
      
      // Проверяем, что URL обновился
      await expect(page).toHaveURL(switchTest.expectedUrl);
      
      // Проверяем, что селектор показывает новый язык
      await expect(page.getByTestId(SELECTORS.LANG_SELECT)).toContainText(switchTest.to);
      
      // Проверяем, что cookie установлен (кроме base locale)
      const cookies = await page.context().cookies();
      const langCookie = cookies.find(cookie => cookie.name === 'excuseme_lang');
      
      if (switchTest.to === 'Русский') {
        // Для base locale cookie может не быть установлен
        expect(langCookie?.value).toBeFalsy();
      } else {
        expect(langCookie).toBeTruthy();
        expect(langCookie?.value).toBe(switchTest.to === 'English' ? 'en' : 'es');
      }
    }
  });

  test('should have consistent cookie behavior across browsers', async ({ page, mockApi }) => {
    // Мокаем health check
    await mockApi('/api/health', API_SCENARIOS.health.response, API_SCENARIOS.health.status);
    
    // Тестируем различные сценарии с cookie
    const cookieScenarios = [
      {
        name: 'set cookie from query',
        setup: async () => {
          await page.goto('/?lang=en');
          await page.waitForLoadState('networkidle');
        },
        check: async () => {
          const cookies = await page.context().cookies();
          const langCookie = cookies.find(cookie => cookie.name === 'excuseme_lang');
          expect(langCookie).toBeTruthy();
          expect(langCookie?.value).toBe('en');
          expect(langCookie?.path).toBe('/');
          expect(langCookie?.sameSite).toBe('Lax');
        }
      },
      {
        name: 'read cookie on page load',
        setup: async () => {
          // Устанавливаем cookie вручную
          await page.context().addCookies([
            {
              name: 'excuseme_lang',
              value: 'es',
              domain: 'localhost',
              path: '/',
            }
          ]);
          await page.goto('/');
          await page.waitForLoadState('networkidle');
        },
        check: async () => {
          await expect(page.getByTestId(SELECTORS.LANG_SELECT)).toContainText('Español');
        }
      },
      {
        name: 'cookie persistence after reload',
        setup: async () => {
          await page.goto('/?lang=fr');
          await page.waitForLoadState('networkidle');
          await page.reload();
          await page.waitForLoadState('networkidle');
        },
        check: async () => {
          await expect(page.getByTestId(SELECTORS.LANG_SELECT)).toContainText('Français');
          await expect(page).toHaveURL(/lang=fr/);
        }
      }
    ];

    for (const scenario of cookieScenarios) {
      await scenario.setup();
      await scenario.check();
    }
  });

  test('should handle Accept-Language consistently across browsers', async ({ page, mockApi }) => {
    // Мокаем health check
    await mockApi('/api/health', API_SCENARIOS.health.response, API_SCENARIOS.health.status);
    
    // Тестируем различные Accept-Language заголовки
    const acceptLanguageScenarios = [
      {
        header: 'en-US,en;q=0.9,ru;q=0.8',
        expectedLang: 'English',
        description: 'English with high quality'
      },
      {
        header: 'ru-RU,ru;q=0.9,en;q=0.8',
        expectedLang: 'Русский',
        description: 'Russian with high quality'
      },
      {
        header: 'es-ES,es;q=0.9,en;q=0.8',
        expectedLang: 'Español',
        description: 'Spanish with high quality'
      },
      {
        header: 'xx-XX,zz;q=0.9',
        expectedLang: 'Русский',
        description: 'Unsupported language should fallback'
      }
    ];

    for (const scenario of acceptLanguageScenarios) {
      // Устанавливаем Accept-Language заголовок
      await page.setExtraHTTPHeaders({
        'Accept-Language': scenario.header
      });
      
      // Переходим на страницу без query параметров
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Проверяем, что селектор показывает ожидаемый язык
      await expect(page.getByTestId(SELECTORS.LANG_SELECT)).toContainText(scenario.expectedLang);
      
      // Проверяем, что cookie установлен (кроме fallback)
      const cookies = await page.context().cookies();
      const langCookie = cookies.find(cookie => cookie.name === 'excuseme_lang');
      
      if (scenario.expectedLang === 'Русский' && scenario.header.includes('xx-XX')) {
        // Для fallback cookie может не быть установлен
        expect(langCookie?.value).toBeFalsy();
      } else {
        expect(langCookie).toBeTruthy();
        const expectedValue = scenario.expectedLang === 'English' ? 'en' : 
                             scenario.expectedLang === 'Русский' ? 'ru' : 'es';
        expect(langCookie?.value).toBe(expectedValue);
      }
    }
  });

  test('should handle edge cases consistently across browsers', async ({ page, mockApi }) => {
    // Мокаем health check
    await mockApi('/api/health', API_SCENARIOS.health.response, API_SCENARIOS.health.status);
    
    // Тестируем edge cases
    const edgeCases = [
      {
        name: 'empty query parameter',
        url: '/?lang=',
        expectedLang: 'Русский',
        description: 'Empty lang parameter should fallback'
      },
      {
        name: 'whitespace in query parameter',
        url: '/?lang=%20en%20',
        expectedLang: 'English',
        description: 'Whitespace should be trimmed'
      },
      {
        name: 'case insensitive',
        url: '/?lang=EN',
        expectedLang: 'English',
        description: 'Case should be normalized'
      },
      {
        name: 'multiple query parameters',
        url: '/?lang=en&other=value',
        expectedLang: 'English',
        description: 'Should work with other parameters'
      }
    ];

    for (const edgeCase of edgeCases) {
      await page.goto(edgeCase.url);
      await page.waitForLoadState('networkidle');
      
      // Проверяем, что селектор показывает ожидаемый язык
      await expect(page.getByTestId(SELECTORS.LANG_SELECT)).toContainText(edgeCase.expectedLang);
      
      // Проверяем, что форма остается функциональной
      await expect(page.getByTestId(SELECTORS.GEN_FORM)).toBeVisible();
      await expect(page.getByTestId(SELECTORS.GEN_SUBMIT)).toBeVisible();
    }
  });
});

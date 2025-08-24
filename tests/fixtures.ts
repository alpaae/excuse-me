import { test as base, expect, type Page } from '@playwright/test';

// Расширяем базовый test с кастомными фикстурами
export const test = base.extend<{
  mockApi: (route: string, json: any, status?: number) => Promise<void>;
  mockGenerate: (mode: 'success' | 'rate' | 'free') => Promise<void>;
  mockTts: (mode?: 'success' | 'empty') => Promise<void>;
  selectLang: (page: Page, code: string) => Promise<void>;
}>({
  // Устанавливаем baseURL
  baseURL: 'http://localhost:3000',
  
  // Устанавливаем Accept-Language заголовок для детекта языка
  extraHTTPHeaders: {
    'Accept-Language': 'ru-RU,ru;q=0.9,en;q=0.8'
  },
  
  // Кастомная фикстура для мока API
  mockApi: async ({ page }, use) => {
    const mockApi = async (route: string, json: any, status: number = 200) => {
      await page.route(route, async (route) => {
        await route.fulfill({
          status,
          contentType: 'application/json',
          body: JSON.stringify(json),
        });
      });
    };
    
    await use(mockApi);
  },
  
  // Кастомная фикстура для мока генерации
  mockGenerate: async ({ page }, use) => {
    const mockGenerate = async (mode: 'success' | 'rate' | 'free') => {
      const scenarios = {
        success: {
          status: 200,
          body: {
            success: true,
            text: 'OK: generated',
            excuse_id: 'test-excuse-id-123',
            requestId: 'test-request-id'
          }
        },
        rate: {
          status: 429,
          body: {
            error: 'RATE_LIMIT',
            message: 'Too many requests',
            requestId: 'test-request-id'
          }
        },
        free: {
          status: 402,
          body: {
            error: 'FREE_LIMIT_REACHED',
            message: 'Daily free limit reached',
            requestId: 'test-request-id'
          }
        }
      };
      
      const scenario = scenarios[mode];
      
      await page.route('**/api/generate', async (route) => {
        await route.fulfill({
          status: scenario.status,
          contentType: 'application/json',
          body: JSON.stringify(scenario.body),
        });
      });
    };
    
    await use(mockGenerate);
  },
  
  // Кастомная фикстура для мока TTS
  mockTts: async ({ page }, use) => {
    const mockTts = async (mode: 'success' | 'empty' = 'success') => {
      const scenarios = {
        success: {
          status: 200,
          body: {
            success: true,
            url: '/dummy.mp3',
            requestId: 'test-request-id'
          }
        },
        empty: {
          status: 204,
          body: null
        }
      };
      
      const scenario = scenarios[mode];
      
      await page.route('**/api/tts', async (route) => {
        await route.fulfill({
          status: scenario.status,
          contentType: 'application/json',
          body: scenario.body ? JSON.stringify(scenario.body) : '',
        });
      });
    };
    
    await use(mockTts);
  },
  
  // Кастомная фикстура для выбора языка
  selectLang: async ({ page }, use) => {
    const selectLang = async (page: Page, code: string) => {
      // Кликаем по селектору языка
      await page.getByTestId('lang-select').click();
      
      // Выбираем опцию по data-value
      await page.locator(`[data-value="${code}"]`).click();
      
      // Ждем обновления URL
      await page.waitForURL(`**/?*lang=${code}*`, { timeout: 5000 });
    };
    
    await use(selectLang);
  },
});

// Экспортируем expect
export { expect };

// Предустановленные сценарии моков
export const API_SCENARIOS = {
  // Успешная генерация
  success: {
    route: '/api/generate',
    response: {
      success: true,
      text: 'Извините, но у меня возникли непредвиденные обстоятельства, которые не позволяют мне присутствовать на встрече.',
      excuse_id: 'test-excuse-id-123',
      requestId: 'test-request-id'
    },
    status: 200
  },
  
  // Rate limit ошибка
  rateLimit: {
    route: '/api/generate',
    response: {
      error: 'RATE_LIMIT',
      message: 'Too many requests',
      requestId: 'test-request-id'
    },
    status: 429
  },
  
  // Free limit ошибка
  freeLimit: {
    route: '/api/generate',
    response: {
      error: 'FREE_LIMIT_REACHED',
      message: 'Daily free limit reached',
      requestId: 'test-request-id'
    },
    status: 402
  },
  
  // TTS успех
  ttsSuccess: {
    route: '/api/tts',
    response: {
      success: true,
      url: '/tts/dummy-audio.mp3',
      requestId: 'test-request-id'
    },
    status: 200
  },
  
  // TTS ошибка
  ttsError: {
    route: '/api/tts',
    response: {
      error: 'TTS_FAILED',
      message: 'Text-to-speech generation failed',
      requestId: 'test-request-id'
    },
    status: 500
  },
  
  // Auth успех
  authSuccess: {
    route: '/api/tg/auth',
    response: {
      success: true,
      userId: 'test-user-id',
      requestId: 'test-request-id'
    },
    status: 200
  },
  
  // Health check
  health: {
    route: '/api/health',
    response: {
      ok: true,
      time: new Date().toISOString(),
      env: {
        nodeEnv: 'test',
        vercel: false,
        vercelEnv: null,
        vercelRegion: null
      }
    },
    status: 200
  },
  
  // Ready check
  ready: {
    route: '/api/ready',
    response: {
      ok: true,
      missing: [],
      missingOptional: ['STRIPE_SECRET_KEY', 'TG_BOT_TOKEN'],
      env: {
        nodeEnv: 'test',
        vercel: false,
        vercelEnv: null,
        vercelRegion: null
      },
      features: {
        payments: false,
        telegram: false,
        redis: false
      },
      timestamp: new Date().toISOString()
    },
    status: 200
  }
} as const;

// Helper функции для тестов
export const TEST_HELPERS = {
  /**
   * Мокает пользователя (имитирует авторизацию)
   */
  mockUser: async (page: Page) => {
    await page.addInitScript(() => {
      // Имитируем наличие пользователя
      window.localStorage.setItem('supabase.auth.token', 'mock-token');
      window.localStorage.setItem('supabase.auth.refreshToken', 'mock-refresh-token');
      
      // Мокаем Supabase auth
      (window as any).supabase = {
        auth: {
          getUser: () => Promise.resolve({
            data: { user: { id: 'test-user-id', email: 'test@example.com' } },
            error: null
          }),
          getSession: () => Promise.resolve({
            data: { session: { user: { id: 'test-user-id', email: 'test@example.com' } } },
            error: null
          })
        }
      };
    });
  },
  
  /**
   * Мокает неавторизованного пользователя
   */
  mockUnauthorizedUser: async (page: Page) => {
    await page.addInitScript(() => {
      // Очищаем токены
      window.localStorage.removeItem('supabase.auth.token');
      window.localStorage.removeItem('supabase.auth.refreshToken');
      
      // Мокаем Supabase auth без пользователя
      (window as any).supabase = {
        auth: {
          getUser: () => Promise.resolve({
            data: { user: null },
            error: null
          }),
          getSession: () => Promise.resolve({
            data: { session: null },
            error: null
          })
        }
      };
    });
  },
  
  /**
   * Ждет появления элемента с таймаутом
   */
  waitForElement: async (page: Page, selector: string, timeout: number = 5000) => {
    await page.waitForSelector(selector, { timeout });
  },
  
  /**
   * Ждет исчезновения элемента с таймаутом
   */
  waitForElementToDisappear: async (page: Page, selector: string, timeout: number = 5000) => {
    await page.waitForSelector(selector, { state: 'hidden', timeout });
  },
  
  /**
   * Проверяет, что элемент видим
   */
  expectVisible: async (page: Page, selector: string) => {
    await expect(page.locator(selector)).toBeVisible();
  },
  
  /**
   * Проверяет, что элемент не видим
   */
  expectHidden: async (page: Page, selector: string) => {
    await expect(page.locator(selector)).toBeHidden();
  },
  
  /**
   * Проверяет текст элемента
   */
  expectText: async (page: Page, selector: string, text: string) => {
    await expect(page.locator(selector)).toHaveText(text);
  },
  
  /**
   * Кликает по элементу
   */
  click: async (page: Page, selector: string) => {
    await page.locator(selector).click();
  },
  
  /**
   * Заполняет поле
   */
  fill: async (page: Page, selector: string, value: string) => {
    await page.locator(selector).fill(value);
  },
  
  /**
   * Получает текст элемента
   */
  getText: async (page: Page, selector: string): Promise<string> => {
    return await page.locator(selector).textContent() || '';
  }
} as const;

// Типы для TypeScript
export type ApiScenario = keyof typeof API_SCENARIOS;
export type TestHelper = keyof typeof TEST_HELPERS;

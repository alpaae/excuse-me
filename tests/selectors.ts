/**
 * Test selectors for E2E tests
 * Centralized mapping of data-testid attributes
 */

export const SELECTORS = {
  // Generation form
  GEN_FORM: 'gen-form',
  GEN_SUBMIT: 'gen-submit',
  GEN_RESULT: 'gen-result',
  GEN_SCENARIO: 'gen-scenario',
  GEN_CONTEXT: 'gen-context',
  GEN_TONE: 'gen-tone',
  GEN_CHANNEL: 'gen-channel',
  
  // Language detection (no longer needed as it's automatic)
  // LANG_SELECT: 'lang-select',
  // LANG_OPTION_RU: '[data-value="ru"]',
  // LANG_OPTION_EN: '[data-value="en"]',
  
  // Authentication
  BTN_LOGIN: 'btn-login',
  AUTH_DIALOG: 'auth-dialog',
  
  // Banners
  BANNER_RATE_LIMIT: 'banner-rate-limit',
  BANNER_FREE_LIMIT: 'banner-free-limit',
  
  // Dashboard
  EXCUSE_LIST: 'excuse-list',
  EXCUSE_ITEM: 'excuse-item',
  FAVORITE_BTN: 'favorite-btn',
  
  // Account
  SUBSCRIPTION_STATUS: 'subscription-status',
  UPGRADE_BTN: 'upgrade-btn',
  
  // Navigation
  NAV_DASHBOARD: 'nav-dashboard',
  NAV_ACCOUNT: 'nav-account',
  
  // Admin
  I18N_TABLE: 'i18n-table',
  I18N_SEARCH: 'i18n-search',
  
  // Common
  LOADING_SPINNER: 'loading-spinner',
  ERROR_MESSAGE: 'error-message',
  SUCCESS_MESSAGE: 'success-message',
} as const;

/**
 * Helper functions for common test actions
 */
export const TEST_HELPERS = {
  /**
   * Get selector by key
   */
  getSelector: (key: keyof typeof SELECTORS): string => `[data-testid="${SELECTORS[key]}"]`,
  
  /**
   * Get selector for specific item in list
   */
  getListItemSelector: (key: keyof typeof SELECTORS, index: number): string => 
    `${SELECTORS[key]}:nth-child(${index + 1})`,
  
  /**
   * Get selector for specific excuse by ID
   */
  getExcuseById: (id: string): string => `[data-testid="excuse-item"][data-excuse-id="${id}"]`,
  
  /**
   * Get selector for language option
   */
  getLanguageOption: (lang: string): string => `[data-value="${lang}"]`,
  
  /**
   * Get selector for tone option
   */
  getToneOption: (tone: string): string => `[data-value="${tone}"]`,
  
  /**
   * Get selector for channel option
   */
  getChannelOption: (channel: string): string => `[data-value="${channel}"]`,
} as const;

/**
 * Test data constants
 */
export const TEST_DATA = {
  LANGUAGES: {
    RUSSIAN: 'ru',
    ENGLISH: 'en',
  },
  TONES: {
    PROFESSIONAL: 'professional',
    FRIENDLY: 'friendly',
    FORMAL: 'formal',
    CASUAL: 'casual',
  },
  CHANNELS: {
    EMAIL: 'email',
    MESSAGE: 'message',
    CALL: 'call',
    IN_PERSON: 'in_person',
  },
  SCENARIOS: {
    MEETING_CANCEL: 'cancel meeting',
    LATE_WORK: 'late to work',
    MISS_PARTY: 'miss party',
  },
} as const;

/**
 * Expected text content for assertions
 */
export const EXPECTED_TEXT = {
  GENERATION: {
    BUTTON: 'Generate Excuse',
    GENERATING: 'Generating...',
    SUCCESS: 'Excuse generated successfully',
  },
  AUTH: {
    LOGIN_BUTTON: 'Sign In',
    TITLE: 'Sign in to ExcuseME',
    EMAIL_PLACEHOLDER: 'your@email.com',
  },
  BANNERS: {
    RATE_LIMIT_TITLE: 'Too many requests',
    FREE_LIMIT_TITLE: 'Free limit reached',
    FREE_LIMIT_DESCRIPTION: 'Free users can generate up to 3 excuses per day',
  },
  ERRORS: {
    RATE_LIMIT: 'Too many requests. Please try again in a minute.',
    FREE_LIMIT: 'Daily free limit reached',
    GENERATION_ERROR: 'Generation error. Please try again.',
  },
} as const;

export type SelectorKey = keyof typeof SELECTORS;
export type TestDataKey = keyof typeof TEST_DATA;
export type ExpectedTextKey = keyof typeof EXPECTED_TEXT;

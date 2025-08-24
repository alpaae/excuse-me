'use client';

import { useEffect, useState, createContext, useContext } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18next from '@/lib/i18n';

// Константы из middleware (синхронизированы с сервером)
const SUPPORTED_LOCALES = ['ru', 'en', 'pl', 'de', 'fr', 'es', 'it', 'pt', 'uk', 'zh-CN', 'ja', 'ko'] as const;
const BASE_LOCALE = 'ru';

const LOCALE_ALIASES: Record<string, string> = {
  'cn': 'zh-CN',
  'ua': 'uk',
  'pt': 'pt-PT',
  'br': 'pt-BR',
  'en-US': 'en',
  'ru-RU': 'ru',
  'russian': 'ru',
  'русский': 'ru',
  'рус': 'ru',
  'english': 'en',
  'английский': 'en',
  'polish': 'pl',
  'polski': 'pl',
  'german': 'de',
  'deutsch': 'de',
  'french': 'fr',
  'français': 'fr',
  'spanish': 'es',
  'español': 'es',
  'italian': 'it',
  'italiano': 'it',
  'portuguese': 'pt',
  'português': 'pt',
  'ukrainian': 'uk',
  'українська': 'uk',
  'chinese': 'zh-CN',
  '中文': 'zh-CN',
  'japanese': 'ja',
  '日本語': 'ja',
  'korean': 'ko',
  '한국어': 'ko',
};

/**
 * Нормализует локаль к BCP-47 формату (синхронизировано с сервером)
 */
function normalizeLocale(input: string): string {
  if (!input || typeof input !== 'string') {
    return BASE_LOCALE;
  }

  const cleaned = input.trim().toLowerCase();

  if (LOCALE_ALIASES[cleaned]) {
    return LOCALE_ALIASES[cleaned];
  }

  const bcp47Match = cleaned.match(/^([a-z]{2})(?:-([A-Z]{2}))?$/);
  if (bcp47Match) {
    const lang = bcp47Match[1];
    const region = bcp47Match[2];
    
    if (LOCALE_ALIASES[lang]) {
      return LOCALE_ALIASES[lang];
    }
    
    const normalized = region ? `${lang}-${region}` : lang;
    
    if (SUPPORTED_LOCALES.includes(normalized as any)) {
      return normalized;
    }
    
    if (SUPPORTED_LOCALES.includes(lang as any)) {
      return lang;
    }
  }

  return BASE_LOCALE;
}

// Контекст для текущей локали
interface LocaleContextType {
  currentLocale: string;
  setCurrentLocale: (locale: string) => void;
}

const LocaleContext = createContext<LocaleContextType | null>(null);

interface I18nProviderProps {
  children: React.ReactNode;
  initialLocale?: string; // Серверно-определенная локаль
}

// Функция для установки cookie через API
async function setLanguageCookie(lang: string): Promise<void> {
  try {
    const response = await fetch('/api/i18n/lang', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ lang }),
    });

    if (!response.ok) {
      console.warn('Failed to set language cookie via API:', response.status);
      // Fallback к клиентской установке cookie
      const expires = new Date();
      expires.setTime(expires.getTime() + (180 * 24 * 60 * 60 * 1000));
      document.cookie = `excuseme_lang=${lang}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
    }
  } catch (error) {
    console.warn('Error setting language cookie via API:', error);
    // Fallback к клиентской установке cookie
    const expires = new Date();
    expires.setTime(expires.getTime() + (180 * 24 * 60 * 60 * 1000));
    document.cookie = `excuseme_lang=${lang}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
  }
}

export function I18nProvider({ children, initialLocale }: I18nProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentLocale, setCurrentLocale] = useState<string>(() => {
    // Инициализируем состояние с серверной локалью
    const normalizedLocale = initialLocale ? normalizeLocale(initialLocale) : BASE_LOCALE;
    return normalizedLocale;
  });

  useEffect(() => {
    // Инициализируем i18n на клиенте
    if (!i18next.isInitialized) {
      i18next.init();
    }

    // Устанавливаем локаль из сервера
    const localeToUse = initialLocale ? normalizeLocale(initialLocale) : BASE_LOCALE;
    
    // Обновляем i18next
    i18next.changeLanguage(localeToUse);
    
    // Обновляем состояние если локаль изменилась
    if (localeToUse !== currentLocale) {
      setCurrentLocale(localeToUse);
    }

    // Синхронизируем с cookie и URL только если нет query параметра
    // (чтобы не перезаписывать явный выбор пользователя)
    if (!window.location.search.includes('lang=') && !window.location.search.includes('lng=')) {
      // Используем API для установки cookie
      setLanguageCookie(localeToUse);
      // Обновляем URL
      const url = new URL(window.location.href);
      if (localeToUse === BASE_LOCALE) {
        url.searchParams.delete('lang');
      } else {
        url.searchParams.set('lang', localeToUse);
      }
      url.searchParams.delete('lng');
      window.history.replaceState({}, '', url.toString());
    }

    setIsInitialized(true);
  }, [initialLocale, currentLocale]);

  // Функция для изменения локали
  const handleSetCurrentLocale = async (newLocale: string) => {
    const normalizedLocale = normalizeLocale(newLocale);
    setCurrentLocale(normalizedLocale);
    i18next.changeLanguage(normalizedLocale);
    
    // Используем API для установки cookie
    await setLanguageCookie(normalizedLocale);
    
    // Обновляем URL
    const url = new URL(window.location.href);
    if (normalizedLocale === BASE_LOCALE) {
      url.searchParams.delete('lang');
    } else {
      url.searchParams.set('lang', normalizedLocale);
    }
    url.searchParams.delete('lng');
    window.history.replaceState({}, '', url.toString());
  };

  return (
    <LocaleContext.Provider value={{ currentLocale, setCurrentLocale: handleSetCurrentLocale }}>
      <I18nextProvider i18n={i18next}>
        {children}
      </I18nextProvider>
    </LocaleContext.Provider>
  );
}

// Хук для получения текущей локали
export function useCurrentLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useCurrentLocale must be used within I18nProvider');
  }
  return context;
}

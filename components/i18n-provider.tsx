'use client';

import { useEffect, useState, createContext, useContext } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18next from '@/lib/i18n';
import { normalizeLocale, syncLanguage } from '@/lib/i18n-detect';

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

export function I18nProvider({ children, initialLocale }: I18nProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentLocale, setCurrentLocale] = useState<string>(() => {
    // Инициализируем состояние с серверной локалью или fallback
    return initialLocale ? normalizeLocale(initialLocale) : 'ru';
  });

  useEffect(() => {
    // Инициализируем i18n на клиенте
    if (!i18next.isInitialized) {
      i18next.init();
    }

    // Устанавливаем локаль из сервера или текущего состояния
    const localeToUse = initialLocale ? normalizeLocale(initialLocale) : currentLocale;
    
    // Обновляем i18next
    i18next.changeLanguage(localeToUse);
    
    // Обновляем состояние если локаль изменилась
    if (localeToUse !== currentLocale) {
      setCurrentLocale(localeToUse);
    }

    // Синхронизируем с cookie и URL только если нет query параметра
    // (чтобы не перезаписывать явный выбор пользователя)
    if (!window.location.search.includes('lang=') && !window.location.search.includes('lng=')) {
      syncLanguage(localeToUse);
    }

    setIsInitialized(true);
  }, [initialLocale, currentLocale]);

  // Функция для изменения локали
  const handleSetCurrentLocale = (newLocale: string) => {
    const normalizedLocale = normalizeLocale(newLocale);
    setCurrentLocale(normalizedLocale);
    i18next.changeLanguage(normalizedLocale);
    syncLanguage(normalizedLocale);
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

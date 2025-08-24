'use client';

import { useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18next from '@/lib/i18n';
import { detectLanguage, getLanguageCookie, normalizeLocale } from '@/lib/i18n-detect';

interface I18nProviderProps {
  children: React.ReactNode;
  initialLanguage?: string; // Для SSR гидратации
}

export function I18nProvider({ children, initialLanguage }: I18nProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Инициализируем i18n на клиенте
    if (!i18next.isInitialized) {
      i18next.init();
    }

    // Синхронизируем язык с SSR
    if (initialLanguage) {
      const normalized = normalizeLocale(initialLanguage);
      i18next.changeLanguage(normalized);
    } else {
      // Детектируем язык на клиенте
      const searchParams = new URLSearchParams(window.location.search);
      const queryLang = searchParams.get('lang') || searchParams.get('lng');
      const cookieLang = getLanguageCookie();
      
      const detectedLang = detectLanguage({
        query: queryLang || undefined,
        cookie: cookieLang || undefined,
        acceptLanguage: navigator.language,
      });

      i18next.changeLanguage(detectedLang);
    }

    setIsInitialized(true);
  }, [initialLanguage]);

  return (
    <I18nextProvider i18n={i18next}>
      {children}
    </I18nextProvider>
  );
}

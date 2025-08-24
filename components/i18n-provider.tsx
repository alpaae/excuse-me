'use client';

import { useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18next from '@/lib/i18n';
import { detectLanguage, getLanguageCookie, normalizeLocale, syncLanguage, getLanguageFromUrl } from '@/lib/i18n-detect';

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

    let finalLanguage: string;

    // Синхронизируем язык с SSR
    if (initialLanguage) {
      finalLanguage = normalizeLocale(initialLanguage);
      i18next.changeLanguage(finalLanguage);
    } else {
      // Детектируем язык на клиенте
      const queryLang = getLanguageFromUrl(window.location.href);
      const cookieLang = getLanguageCookie();
      
      finalLanguage = detectLanguage({
        query: queryLang || undefined,
        cookie: cookieLang || undefined,
        acceptLanguage: navigator.language,
      });

      i18next.changeLanguage(finalLanguage);
    }

    // Сохраняем выбранную локаль в cookie для будущих посещений
    // Только если нет query параметра (чтобы не перезаписывать явный выбор)
    if (!window.location.search.includes('lang=') && !window.location.search.includes('lng=')) {
      syncLanguage(finalLanguage);
    }

    setIsInitialized(true);
  }, [initialLanguage]);

  return (
    <I18nextProvider i18n={i18next}>
      {children}
    </I18nextProvider>
  );
}

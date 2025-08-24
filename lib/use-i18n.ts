'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { detectLanguage, setLanguageCookie } from './i18n-detect';

export function useI18n() {
  const { t, i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);

  useEffect(() => {
    // Детектируем язык при загрузке
    const detectedLang = detectLanguage({
      query: new URLSearchParams(window.location.search).get('lng') || undefined,
      cookie: document.cookie.split('; ').find(row => row.startsWith('i18nextLng='))?.split('=')[1] || undefined,
      acceptLanguage: navigator.language,
    });

    if (detectedLang !== currentLanguage) {
      changeLanguage(detectedLang);
    }
  }, []);

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setCurrentLanguage(lang);
    setLanguageCookie(lang);
    
    // Обновляем URL без перезагрузки
    const url = new URL(window.location.href);
    url.searchParams.set('lng', lang);
    window.history.replaceState({}, '', url.toString());
  };

  const getLanguageFromTelegram = (telegramLanguage?: string) => {
    if (telegramLanguage) {
      const detectedLang = detectLanguage({
        telegramLanguage,
        acceptLanguage: navigator.language,
      });
      changeLanguage(detectedLang);
    }
  };

  return {
    t,
    currentLanguage,
    changeLanguage,
    getLanguageFromTelegram,
    isReady: i18n.isInitialized,
  };
}

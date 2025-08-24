'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { detectLanguage, setLanguageCookie } from './i18n-detect';

export function useI18n() {
  const { t, i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);

  const changeLanguage = useCallback((lang: string) => {
    i18n.changeLanguage(lang);
    setCurrentLanguage(lang);
    setLanguageCookie(lang);
    
    // Обновляем URL без перезагрузки (используем lang параметр)
    const url = new URL(window.location.href);
    url.searchParams.set('lang', lang);
    // Удаляем старый параметр lng если есть
    url.searchParams.delete('lng');
    window.history.replaceState({}, '', url.toString());
  }, [i18n]);

  useEffect(() => {
    // Детектируем язык при загрузке (приоритет: lang > lng > cookie > accept-language)
    const searchParams = new URLSearchParams(window.location.search);
    const detectedLang = detectLanguage({
      query: searchParams.get('lang') || searchParams.get('lng') || undefined,
      cookie: document.cookie.split('; ').find(row => row.startsWith('i18nextLng='))?.split('=')[1] || undefined,
      acceptLanguage: navigator.language,
    });

    if (detectedLang !== currentLanguage) {
      changeLanguage(detectedLang);
    }
  }, [changeLanguage, currentLanguage]);

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

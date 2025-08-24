'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  detectLanguage, 
  syncLanguage, 
  getLanguageCookie, 
  normalizeLocale 
} from './i18n-detect';

export function useI18n() {
  const { t, i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);

  const changeLanguage = useCallback((lang: string) => {
    const normalized = normalizeLocale(lang);
    i18n.changeLanguage(normalized);
    setCurrentLanguage(normalized);
    syncLanguage(normalized); // Синхронизирует cookie + query
  }, [i18n]);

  useEffect(() => {
    // Детектируем язык при загрузке с новым порядком приоритетов
    const searchParams = new URLSearchParams(window.location.search);
    const queryLang = searchParams.get('lang') || searchParams.get('lng');
    const cookieLang = getLanguageCookie();
    
    const detectedLang = detectLanguage({
      query: queryLang || undefined,
      cookie: cookieLang || undefined,
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

'use client';

import { useCurrentLocale } from './i18n-provider';

// Минимальный набор поддерживаемых языков
const SUPPORTED_LANGUAGES = [
  { code: 'ru', name: 'Русский' },
  { code: 'en', name: 'English' },
  { code: 'pl', name: 'Polski' },
  { code: 'de', name: 'Deutsch' },
  { code: 'fr', name: 'Français' },
  { code: 'es', name: 'Español' },
] as const;

interface LanguageSwitchProps {
  onLanguageChange?: (lang: string) => void;
}

export function LanguageSwitch({ onLanguageChange }: LanguageSwitchProps) {
  const { currentLocale, setCurrentLocale } = useCurrentLocale();

  const handleLanguageChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lang = e.target.value;
    
    try {
      // 1. Устанавливаем cookie через API
      await fetch('/api/i18n/lang', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lang }),
      });

      // 2. Обновляем URL без навигации
      const url = new URL(window.location.href);
      url.searchParams.set('lang', lang);
      history.replaceState(null, '', url.toString());

      // 3. Обновляем состояние провайдера
      setCurrentLocale(lang);

      // 4. Вызываем callback для обновления формы (если передан)
      if (onLanguageChange) {
        onLanguageChange(lang);
      }

    } catch (error) {
      console.error('Error changing language:', error);
      // Fallback: обновляем только состояние провайдера
      setCurrentLocale(lang);
      
      // Fallback callback
      if (onLanguageChange) {
        onLanguageChange(lang);
      }
    }
  };

  return (
    <select
      data-testid="lang-select"
      value={currentLocale}
      onChange={handleLanguageChange}
      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    >
      {SUPPORTED_LANGUAGES.map((lang) => (
        <option
          key={lang.code}
          value={lang.code}
          data-testid={`lang-option-${lang.code}`}
        >
          {lang.name}
        </option>
      ))}
         </select>
   );
 }

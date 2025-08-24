'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCurrentLocale } from './i18n-provider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Поддерживаемые языки
const SUPPORTED_LANGUAGES = [
  { code: 'ru', name: 'Русский' },
  { code: 'en', name: 'English' },
  { code: 'pl', name: 'Polski' },
  { code: 'de', name: 'Deutsch' },
  { code: 'fr', name: 'Français' },
  { code: 'es', name: 'Español' },
  { code: 'it', name: 'Italiano' },
  { code: 'pt', name: 'Português' },
  { code: 'uk', name: 'Українська' },
  { code: 'zh-CN', name: '中文' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' },
] as const;

interface LanguageSwitchProps {
  onLanguageChange?: (lang: string) => void;
}

export function LanguageSwitch({ onLanguageChange }: LanguageSwitchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { currentLocale, setCurrentLocale } = useCurrentLocale();

  const handleLanguageChange = async (newLang: string) => {
    try {
      // 1. Устанавливаем cookie через API
      const response = await fetch('/api/i18n/lang', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lang: newLang }),
      });

      if (!response.ok) {
        console.warn('Failed to set language cookie via API:', response.status);
      }

      // 2. Обновляем URL с новым параметром lang
      const newSearchParams = new URLSearchParams(searchParams.toString());
      if (newLang === 'ru') {
        // Для русского языка убираем параметр lang (используем как default)
        newSearchParams.delete('lang');
      } else {
        newSearchParams.set('lang', newLang);
      }
      
      const newUrl = `${pathname}?${newSearchParams.toString()}`;
      router.replace(newUrl, { scroll: false });

      // 3. Обновляем состояние провайдера для немедленного перевода UI
      setCurrentLocale(newLang);

      // 4. Вызываем callback для обновления формы (если передан)
      if (onLanguageChange) {
        onLanguageChange(newLang);
      }

    } catch (error) {
      console.error('Error changing language:', error);
      // Fallback: обновляем только состояние провайдера
      setCurrentLocale(newLang);
      
      // Fallback callback
      if (onLanguageChange) {
        onLanguageChange(newLang);
      }
    }
  };

  return (
    <Select 
      value={currentLocale} 
      onValueChange={handleLanguageChange}
    >
      <SelectTrigger data-testid="lang-select" className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {SUPPORTED_LANGUAGES.map((lang) => (
          <SelectItem 
            key={lang.code} 
            value={lang.code}
            data-value={lang.code}
          >
            {lang.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

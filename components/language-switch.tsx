'use client';
import { useCurrentLocale } from './i18n-provider';

export function LanguageSwitch() {
  const { currentLocale, setCurrentLocale } = useCurrentLocale();
  return (
    <select
      data-testid="lang-select"
      value={currentLocale}
      onChange={(e) => {
        setCurrentLocale(e.target.value);
      }}
    >
      <option value="en" data-testid="lang-option-en">English</option>
      <option value="ru" data-testid="lang-option-ru">Русский</option>
      <option value="pl" data-testid="lang-option-pl">Polski</option>
      <option value="de" data-testid="lang-option-de">Deutsch</option>
      <option value="fr" data-testid="lang-option-fr">Français</option>
      <option value="es" data-testid="lang-option-es">Español</option>
    </select>
  );
}

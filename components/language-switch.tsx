'use client';
import { useCurrentLocale } from './i18n-provider';

export function LanguageSwitch() {
  const { currentLocale, setCurrentLocale } = useCurrentLocale();
  return (
    <select
      data-testid="lang-select"
      value={currentLocale}
      onChange={async (e) => {
        const lang = e.target.value;
        await fetch('/api/i18n/lang', {
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ lang }),
        });
        const url = new URL(window.location.href);
        if (lang === 'en') {
          url.searchParams.delete('lang');
        } else {
          url.searchParams.set('lang', lang);
        }
        history.replaceState(null, '', url.toString());
        setCurrentLocale(lang);
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

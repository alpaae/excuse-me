import { headers } from 'next/headers';
import { getLanguageFromRequest } from '@/lib/i18n-server';
import { I18nProvider } from './i18n-provider';

interface I18nProviderServerProps {
  children: React.ReactNode;
}

export async function I18nProviderServer({ children }: I18nProviderServerProps) {
  // Получаем язык из request на сервере
  const headersList = await headers();
  const request = new Request('http://localhost', {
    headers: Object.fromEntries(headersList.entries()),
  });
  
  const initialLanguage = await getLanguageFromRequest(request);

  return (
    <I18nProvider initialLanguage={initialLanguage}>
      {children}
    </I18nProvider>
  );
}

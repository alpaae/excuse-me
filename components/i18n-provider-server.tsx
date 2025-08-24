import { headers } from 'next/headers';
import { I18nProvider } from './i18n-provider';
import { normalizeLocale } from '@/lib/i18n-detect';

const BASE_LOCALE = 'en';

export default async function I18nProviderServer({ children }: { children: React.ReactNode }) {
  const h = await headers();
  const fromHeader = h.get('x-locale');
  const initialLocale = fromHeader || BASE_LOCALE;
  return <I18nProvider initialLocale={normalizeLocale(initialLocale)}>{children}</I18nProvider>;
}

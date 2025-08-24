'use client';

import { useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18next from '@/lib/i18n';

interface I18nProviderProps {
  children: React.ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  useEffect(() => {
    // Инициализируем i18n на клиенте
    if (!i18next.isInitialized) {
      i18next.init();
    }
  }, []);

  return (
    <I18nextProvider i18n={i18next}>
      {children}
    </I18nextProvider>
  );
}

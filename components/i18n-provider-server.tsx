import { headers } from 'next/headers';
import { resolveLocaleServer } from '@/lib/i18n-detect';
import { I18nProvider } from './i18n-provider';

interface I18nProviderServerProps {
  children: React.ReactNode;
}

export async function I18nProviderServer({ children }: I18nProviderServerProps) {
  // Получаем заголовки
  const headersList = await headers();
  
  // Создаем объект, имитирующий NextRequest
  const mockRequest = {
    nextUrl: {
      searchParams: {
        get: (name: string) => {
          // В server component мы не можем получить query параметры из URL
          // Они будут обработаны middleware
          return null;
        }
      }
    },
    cookies: {
      get: (name: string) => {
        const cookieHeader = headersList.get('cookie');
        if (!cookieHeader) return null;
        
        const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
          const [name, value] = cookie.trim().split('=');
          if (name && value) {
            acc[name] = value;
          }
          return acc;
        }, {} as Record<string, string>);
        
        return cookies[name] ? { value: cookies[name] } : null;
      }
    },
    headers: {
      get: (name: string) => headersList.get(name)
    }
  } as any;
  
  // Определяем локаль на сервере
  const initialLocale = resolveLocaleServer(mockRequest);

  return (
    <I18nProvider initialLocale={initialLocale}>
      {children}
    </I18nProvider>
  );
}

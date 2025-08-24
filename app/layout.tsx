import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '@/components/toast-provider';
import { SWRProvider } from '@/components/swr-provider';

// === FONT КОНФИГУРАЦИЯ ===
// Next.js 15: обновленная конфигурация шрифтов
const inter = Inter({ 
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
});

// === МЕТАДАННЫЕ ===
// Next.js 15: обновленная структура метаданных
export const metadata: Metadata = {
  title: {
    default: 'ExcuseME - Polite Excuses',
    template: '%s | ExcuseME'
  },
  description: 'AI-powered generator of polite excuses with PWA and Telegram Mini App support. Create polite excuses for any situation using AI.',
  keywords: ['excuses', 'generator', 'polite', 'AI', 'OpenAI', 'PWA', 'Telegram'],
  authors: [{ name: 'ExcuseME Team' }],
  creator: 'ExcuseME',
  publisher: 'ExcuseME',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  
  // === PWA МЕТАДАННЫЕ ===
  manifest: '/manifest.webmanifest',
  applicationName: 'ExcuseME',
  category: 'productivity',
  
  // === OPEN GRAPH ===
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://excuseme.app',
    title: 'ExcuseME - Polite Excuses',
    description: 'AI-powered generator of polite excuses with PWA and Telegram Mini App support',
    siteName: 'ExcuseME',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ExcuseME - Polite Excuse Generator',
      },
    ],
  },
  
  // === TWITTER ===
  twitter: {
    card: 'summary_large_image',
    title: 'ExcuseME - Polite Excuses',
    description: 'AI-powered generator of polite excuses with PWA and Telegram Mini App support',
    images: ['/og-image.png'],
    creator: '@excuseme_app',
  },
  
  // === APPLE WEB APP ===
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ExcuseME',
    startupImage: [
      {
        url: '/icons/icon-512.png',
        media: '(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)',
      },
      {
        url: '/icons/icon-512.png',
        media: '(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)',
      },
      {
        url: '/icons/icon-512.png',
        media: '(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)',
      },
    ],
  },
  
  // === ИКОНКИ ===
  icons: {
    icon: [
      { url: '/icons/icon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icons/icon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/icons/icon-192.png',
  },
  
  // === АЛЬТЕРНАТИВНЫЕ ЯЗЫКИ ===
  alternates: {
    canonical: 'https://excuseme.app',
  },
  
  // === РОБОТЫ ===
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // === ВЕРИФИКАЦИЯ ===
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  },
};

// === VIEWPORT КОНФИГУРАЦИЯ ===
// Next.js 15: отдельный export для viewport
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#6f5cff' },
    { media: '(prefers-color-scheme: dark)', color: '#8b7cff' },
  ],
  colorScheme: 'light dark',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        {/* PWA мета-теги для лучшей совместимости */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="ExcuseME" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#6f5cff" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        
        {/* Preconnect для оптимизации производительности */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://api.openai.com" />
        <link rel="preconnect" href="https://supabase.co" />
        
        {/* DNS prefetch для внешних ресурсов */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//api.openai.com" />
        <link rel="dns-prefetch" href="//supabase.co" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <SWRProvider>
          {children}
          <ToastProvider />
        </SWRProvider>
        
        {/* PWA инициализация */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Инициализация PWA при загрузке страницы
              window.addEventListener('load', async function() {
                try {
                  // Динамический импорт PWA утилит
                  const { initializePWA } = await import('/lib/pwa-utils.js');
                  await initializePWA();
                } catch (error) {
                  console.warn('PWA initialization failed:', error);
                  
                  // Fallback к базовой регистрации SW
                  if ('serviceWorker' in navigator) {
                    navigator.serviceWorker.register('/sw.js')
                      .then(function(registration) {
                        console.log('SW registered (fallback): ', registration);
                      })
                      .catch(function(registrationError) {
                        console.log('SW registration failed (fallback): ', registrationError);
                      });
                  }
                }
              });
            `,
          }}
        />
      </body>
    </html>
  );
}

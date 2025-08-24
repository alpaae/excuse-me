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
  },
  
  // === TWITTER ===
  twitter: {
    card: 'summary',
    title: 'ExcuseME - Polite Excuses',
    description: 'AI-powered generator of polite excuses with PWA and Telegram Mini App support',
    creator: '@excuseme_app',
  },
  
  // === APPLE WEB APP ===
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ExcuseME',
  },
  
  // === ИКОНКИ ===
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
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

      <body className={`${inter.className} antialiased`}>
        <SWRProvider>
          {children}
          <ToastProvider />
        </SWRProvider>
        

      </body>
    </html>
  );
}

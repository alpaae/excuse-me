import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { SWRProvider } from '@/components/swr-provider';
import { ToastProvider } from '@/components/toast-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ExcuseME - Polite Excuses',
  description: 'AI-powered generator of polite excuses with PWA and Telegram Mini App support. Create polite excuses for any situation using AI.',
  applicationName: 'ExcuseME',
  authors: [{ name: 'ExcuseME Team' }],
  manifest: '/manifest.webmanifest',
  keywords: ['excuses', 'generator', 'polite', 'AI', 'OpenAI', 'PWA', 'Telegram'],
  creator: 'ExcuseME',
  publisher: 'ExcuseME',
  robots: 'index, follow',
  category: 'productivity',
  alternates: {
    canonical: 'https://excuseme.app',
  },
  formatDetection: {
    telephone: false,
    address: false,
    email: false,
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  },
  appleWebApp: {
    capable: true,
    title: 'ExcuseME',
    statusBarStyle: 'default',
  },
  openGraph: {
    title: 'ExcuseME - Polite Excuses',
    description: 'AI-powered generator of polite excuses with PWA and Telegram Mini App support',
    url: 'https://excuseme.app',
    siteName: 'ExcuseME',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    creator: '@excuseme_app',
    title: 'ExcuseME - Polite Excuses',
    description: 'AI-powered generator of polite excuses with PWA and Telegram Mini App support',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              document.querySelectorAll('body link[rel="icon"], body link[rel="apple-touch-icon"]').forEach(el => document.head.appendChild(el))
            `,
          }}
        />
      </head>
      <body className={`${inter.className} antialiased bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden`}>
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-300/10 to-purple-300/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>
        
        <SWRProvider>
          <ToastProvider />
          {children}
        </SWRProvider>
      </body>
    </html>
  );
}

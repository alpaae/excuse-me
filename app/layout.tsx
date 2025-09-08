import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AnimatedBackground } from '@/components/animated-background';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ExcuseME - AI-Powered Excuse Generator',
  description: 'Transform awkward situations into graceful exits with AI-powered, context-aware excuses that feel natural and professional.',
  keywords: 'AI, excuses, professional, situations, generator',
  authors: [{ name: 'ExcuseME Team' }],
  creator: 'ExcuseME',
  publisher: 'ExcuseME',
  robots: 'index, follow',
  openGraph: {
    title: 'ExcuseME - AI-Powered Excuse Generator',
    description: 'Transform awkward situations into graceful exits with AI-powered, context-aware excuses that feel natural and professional.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ExcuseME - AI-Powered Excuse Generator',
    description: 'Transform awkward situations into graceful exits with AI-powered, context-aware excuses that feel natural and professional.',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#3b82f6',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Preload critical resources */}
        <link rel="preload" href="/api/limits" as="fetch" crossOrigin="anonymous" />
        <link rel="preload" href="/api/social-proof" as="fetch" crossOrigin="anonymous" />
        
        {/* Preload critical fonts */}
        <link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        
        {/* DNS prefetch for external domains */}
        <link rel="dns-prefetch" href="//supabase.co" />
        <link rel="dns-prefetch" href="//stripe.com" />
        <link rel="dns-prefetch" href="//api.openai.com" />
      </head>
      <body className={inter.className}>
        <AnimatedBackground />
        {children}
      </body>
    </html>
  );
}
